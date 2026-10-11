from decimal import Decimal
from io import BytesIO
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.contrib.auth.models import User
from django.db import DatabaseError
from django.db.models.deletion import ProtectedError
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from .models import Cart, CartItem, Category, Order, OrderItem, Product, UserProfile


class StoreAPITests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			username='shopper',
			email='shopper@example.com',
			password='AComplex-password-9182!',
		)
		self.category = Category.objects.create(name='Electronics', slug='electronics')
		self.product = Product.objects.create(
			category=self.category,
			name='Studio Headphones',
			price=Decimal('19.99'),
		)
		self.client = APIClient()
		self.client.force_authenticate(user=self.user)

	def checkout_payload(self, **overrides):
		return {
			'name': 'Shopper Name',
			'address': '42 Market Street',
			'phone': '+1 (555) 123-4567',
			'payment_method': 'COD',
			**overrides,
		}

	def test_add_to_cart_rejects_non_positive_quantity(self):
		response = self.client.post(
			'/api/cart/add/',
			{'product_id': self.product.pk, 'quantity': 0},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertFalse(Cart.objects.filter(user=self.user).exists())

	def test_cart_add_update_and_remove_preserve_response_contract(self):
		added = self.client.post(
			'/api/cart/add/',
			{'product_id': self.product.pk, 'quantity': 2},
			format='json',
		)
		self.assertEqual(added.status_code, 200)
		self.assertEqual(added.data['item'][0]['product_name'], 'Studio Headphones')
		self.assertEqual(Decimal(added.data['total']), Decimal('39.98'))

		item_id = added.data['item'][0]['id']
		updated = self.client.post(
			'/api/cart/update/',
			{'item_id': item_id, 'quantity': 3},
			format='json',
		)
		self.assertEqual(updated.status_code, 200)
		self.assertEqual(updated.data['item'][0]['quantity'], 3)

		removed = self.client.post(
			'/api/cart/remove/',
			{'item_id': item_id},
			format='json',
		)
		self.assertEqual(removed.status_code, 200)
		self.assertEqual(removed.data['item'], [])

	def test_jwt_login_and_unauthenticated_cart_access(self):
		anonymous_client = APIClient()
		denied = anonymous_client.get('/api/cart/')
		self.assertEqual(denied.status_code, 401)

		login = anonymous_client.post(
			'/api/login/',
			{'username': 'shopper', 'password': 'AComplex-password-9182!'},
			format='json',
		)
		self.assertEqual(login.status_code, 200)
		self.assertIn('access', login.data)
		self.assertIn('refresh', login.data)
		self.assertFalse(login.data['is_staff'])

	def test_cart_mutations_reject_other_users_items(self):
		other_user = User.objects.create_user(username='other-shopper', password='password')
		other_cart = Cart.objects.create(user=other_user)
		other_item = CartItem.objects.create(cart=other_cart, product=self.product, quantity=1)

		update_response = self.client.post(
			'/api/cart/update/',
			{'item_id': other_item.pk, 'quantity': 4},
			format='json',
		)
		remove_response = self.client.post(
			'/api/cart/remove/',
			{'item_id': other_item.pk},
			format='json',
		)

		self.assertEqual(update_response.status_code, 404)
		self.assertEqual(remove_response.status_code, 404)
		other_item.refresh_from_db()
		self.assertEqual(other_item.quantity, 1)

	def test_checkout_persists_frontend_fields_and_clears_cart(self):
		cart = Cart.objects.create(user=self.user)
		CartItem.objects.create(cart=cart, product=self.product, quantity=2)

		response = self.client.post(
			'/api/orders/create/',
			self.checkout_payload(),
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		order = Order.objects.get(pk=response.data['order_id'])
		self.assertEqual(order.total_amount, Decimal('39.98'))
		self.assertEqual(order.shipping_name, 'Shopper Name')
		self.assertEqual(order.shipping_address, '42 Market Street')
		self.assertEqual(order.phone_number, '+1 (555) 123-4567')
		self.assertEqual(order.payment_method, 'COD')
		self.assertEqual(OrderItem.objects.filter(order=order).count(), 1)
		self.assertFalse(cart.item.exists())

	def test_checkout_preserves_existing_online_payment_choice(self):
		cart = Cart.objects.create(user=self.user)
		CartItem.objects.create(cart=cart, product=self.product, quantity=1)

		response = self.client.post(
			'/api/orders/create/',
			self.checkout_payload(payment_method='credit'),
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		order = Order.objects.get(pk=response.data['order_id'])
		self.assertEqual(order.payment_method, 'credit')
		self.assertFalse(cart.item.exists())

	def test_checkout_rolls_back_if_order_items_fail(self):
		cart = Cart.objects.create(user=self.user)
		CartItem.objects.create(cart=cart, product=self.product, quantity=1)

		with self.assertLogs('store.views', level='ERROR'):
			with patch('store.views.OrderItem.objects.bulk_create', side_effect=DatabaseError):
				response = self.client.post(
					'/api/orders/create/',
					self.checkout_payload(),
					format='json',
				)

		self.assertEqual(response.status_code, 500)
		self.assertFalse(Order.objects.exists())
		self.assertTrue(cart.item.exists())

	def test_profile_creates_missing_profile_and_ignores_staff_updates(self):
		response = self.client.get('/api/profile/')

		self.assertEqual(response.status_code, 200)
		self.assertTrue(UserProfile.objects.filter(user=self.user).exists())

		update_response = self.client.put(
			'/api/profile/',
			{
				'username': 'shopper-updated',
				'email': 'updated@example.com',
				'phone_number': '5551234567',
				'is_staff': True,
			},
			format='json',
		)

		self.assertEqual(update_response.status_code, 200)
		self.user.refresh_from_db()
		self.assertFalse(self.user.is_staff)
		self.assertEqual(self.user.username, 'shopper-updated')
		self.assertEqual(self.user.userprofile.phone_number, '5551234567')

	def test_registration_enforces_password_validators_and_creates_profile(self):
		weak_response = APIClient().post(
			'/api/register/',
			{
				'username': 'new-shopper',
				'email': 'new@example.com',
				'password': 'password',
				'password2': 'password',
			},
			format='json',
		)
		self.assertEqual(weak_response.status_code, 400)

		response = APIClient().post(
			'/api/register/',
			{
				'username': 'new-shopper',
				'email': 'new@example.com',
				'password': 'ASeparate-complex-4821!',
				'password2': 'ASeparate-complex-4821!',
				'phone_number': '5557654321',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		registered_user = User.objects.get(username='new-shopper')
		self.assertTrue(registered_user.check_password('ASeparate-complex-4821!'))
		self.assertEqual(registered_user.userprofile.phone_number, '5557654321')

	def test_admin_product_endpoint_validates_and_requires_staff(self):
		payload = {'name': 'New item', 'price': '0', 'category': self.category.pk}
		denied = self.client.post('/api/products/create/', payload, format='json')
		self.assertEqual(denied.status_code, 403)

		admin = User.objects.create_user(username='catalog-admin', password='password', is_staff=True)
		self.client.force_authenticate(user=admin)
		invalid = self.client.post('/api/products/create/', payload, format='json')
		self.assertEqual(invalid.status_code, 400)
		self.assertEqual(Product.objects.count(), 1)

		image_file = BytesIO()
		Image.new('RGB', (2, 2), color='green').save(image_file, format='PNG')
		valid_image = SimpleUploadedFile(
			'new-item.png',
			image_file.getvalue(),
			content_type='image/png',
		)
		invalid_payload = {
			'name': 'Invalid image',
			'price': '25.50',
			'category': self.category.pk,
			'image': SimpleUploadedFile('invalid.png', b'not an image', content_type='image/png'),
		}
		invalid_image = self.client.post(
			'/api/products/create/',
			invalid_payload,
			format='multipart',
		)
		self.assertEqual(invalid_image.status_code, 400)

		admin_payload = {
			'name': 'New item',
			'price': '25.50',
			'category': self.category.pk,
			'image': valid_image,
		}
		with TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
			created = self.client.post(
				'/api/products/create/',
				admin_payload,
				format='multipart',
			)

		self.assertEqual(created.status_code, 201)
		created_product = Product.objects.get(name='New item')
		self.assertEqual(created_product.price, Decimal('25.50'))
		self.assertTrue(created_product.image.name)

	def test_product_filters_remain_paginated(self):
		for index in range(13):
			Product.objects.create(
				category=self.category,
				name=f'Headphones {index}',
				price=Decimal('10.00'),
			)

		response = APIClient().get(
			f'/api/products/?q=headphones&category={self.category.pk}'
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data['results']), 12)
		self.assertIsNotNone(response.data['next'])

	def test_category_endpoint_returns_categories(self):
		response = APIClient().get('/api/category/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data, [{'id': self.category.pk, 'name': 'Electronics', 'slug': 'electronics'}])

	def test_referenced_catalog_data_cannot_be_cascade_deleted(self):
		order = Order.objects.create(user=self.user, total_amount=Decimal('19.99'))
		OrderItem.objects.create(order=order, product=self.product, quantity=1, price=self.product.price)

		with self.assertRaises(ProtectedError):
			self.product.delete()
		with self.assertRaises(ProtectedError):
			self.category.delete()
