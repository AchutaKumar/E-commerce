import logging
from decimal import Decimal

from cloudinary.exceptions import Error as CloudinaryError
from django.db import DatabaseError, transaction
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView
from requests.exceptions import RequestException

from .models import Cart, CartItem, Category, Order, OrderItem, Product, UserProfile
from .serializers import (
    CartAddSerializer,
    CartRemoveSerializer,
    CartSerializer,
    CartUpdateSerializer,
    CategorySerializer,
    CheckoutSerializer,
    MyTokenObtainPairSerializer,
    ProductCreateSerializer,
    ProductSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from django.views.decorators.cache import cache_page

logger = logging.getLogger(__name__)

class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50

@api_view(['GET'])
def get_products(req):
    query = req.GET.get('q', '')
    category_id = req.GET.get('category', 'All')

    products = Product.objects.select_related('category').all()

    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
    
    if category_id and category_id != 'All':
        if category_id.isdigit():
            products = products.filter(category__id=category_id)
        else:
            products = products.filter(category__name=category_id)
            
    products = products.order_by('-created_at')

    paginator = ProductPagination()
    paginated_products = paginator.paginate_queryset(products, req)
    serializer = ProductSerializer(paginated_products, many=True, context={'request': req})
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def get_product(req, pk):
    try:
        product = Product.objects.select_related('category').get(id=pk)
        serializer = ProductSerializer(product, context={'request': req})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET'])
@cache_page(60 * 15) # Cache for 15 minutes
def get_category(req):
    category = Category.objects.all()
    serializer = CategorySerializer(category, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(req):
    cart, created = Cart.objects.prefetch_related('item__product').get_or_create(user=req.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(req):
    input_serializer = CartAddSerializer(data=req.data)
    if not input_serializer.is_valid():
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product_id = input_serializer.validated_data['product_id']
    quantity = input_serializer.validated_data['quantity']
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    with transaction.atomic():
        cart, _ = Cart.objects.get_or_create(user=req.user)
        Cart.objects.select_for_update().get(pk=cart.pk)
        item, created = CartItem.objects.select_for_update().get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity},
        )
        if not created:
            item.quantity += quantity
        item.save(update_fields=['quantity'])
        updated_cart = Cart.objects.prefetch_related('item__product').get(pk=cart.pk)

    return Response(CartSerializer(updated_cart).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(req):
    input_serializer = CartRemoveSerializer(data=req.data)
    if not input_serializer.is_valid():
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        cart = Cart.objects.select_for_update().filter(user=req.user).first()
        if cart is None:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        item = CartItem.objects.select_for_update().filter(
            pk=input_serializer.validated_data['item_id'],
            cart=cart,
        ).first()
        if item is None:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        updated_cart = Cart.objects.prefetch_related('item__product').get(pk=cart.pk)

    return Response(CartSerializer(updated_cart).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(req):
    input_serializer = CartUpdateSerializer(data=req.data)
    if not input_serializer.is_valid():
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        cart = Cart.objects.select_for_update().filter(user=req.user).first()
        if cart is None:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        item = CartItem.objects.select_for_update().filter(
            pk=input_serializer.validated_data['item_id'],
            cart=cart,
        ).first()
        if item is None:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

        quantity = input_serializer.validated_data['quantity']
        if quantity == 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save(update_fields=['quantity'])

        updated_cart = Cart.objects.prefetch_related('item__product').get(pk=cart.pk)

    return Response(CartSerializer(updated_cart).data)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(req):
    input_serializer = CheckoutSerializer(data=req.data)
    if not input_serializer.is_valid():
        return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    checkout = input_serializer.validated_data
    try:
        with transaction.atomic():
            cart = Cart.objects.select_for_update().filter(user=req.user).first()
            if cart is None:
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            items = list(cart.item.select_for_update().select_related('product'))
            if not items:
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            total = sum(
                (item.product.price * item.quantity for item in items),
                Decimal('0.00'),
            )
            order = Order.objects.create(
                user=req.user,
                total_amount=total,
                shipping_name=checkout['name'],
                shipping_address=checkout['address'],
                phone_number=checkout['phone'],
                payment_method=checkout['payment_method'],
            )
            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price,
                )
                for item in items
            ])
            cart.item.all().delete()
    except DatabaseError:
        logger.exception('Database error while creating order for user_id=%s', req.user.pk)
        return Response(
            {'error': 'Unable to create order. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {'message': 'Order created successfully', 'order_id': order.pk},
        status=status.HTTP_201_CREATED,
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(req):
    serializer = UserRegistrationSerializer(data=req.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'message': 'User created successfully', 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def get_profile(req):
    UserProfile.objects.get_or_create(user=req.user)
    user = User.objects.select_related('userprofile').get(pk=req.user.pk)

    if req.method == 'PUT':
        serializer = UserProfileSerializer(user, data=req.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        user = User.objects.select_related('userprofile').get(pk=user.pk)
        return Response(UserProfileSerializer(user).data)

    return Response(UserProfileSerializer(user).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_product(req):
    input_serializer = ProductCreateSerializer(data=req.data)
    if not input_serializer.is_valid():
        first_error = next(iter(input_serializer.errors.values()))[0]
        return Response({'error': str(first_error)}, status=status.HTTP_400_BAD_REQUEST)

    if req.FILES.get('image') and not settings.CLOUDINARY_URL:
        return Response(
            {
                'error': (
                    'Image uploads require persistent storage. Configure '
                    'CLOUDINARY_URL on the backend Vercel project and redeploy.'
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        product = input_serializer.save()
    except DatabaseError:
        logger.exception('Database error while creating product for user_id=%s', req.user.pk)
        return Response(
            {'error': 'Unable to create product. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    except (CloudinaryError, OSError, RequestException):
        logger.exception('Image storage error while creating product for user_id=%s', req.user.pk)
        return Response(
            {'error': 'Unable to store the product image. Please try again.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        ProductSerializer(product, context={'request': req}).data,
        status=status.HTTP_201_CREATED,
    )

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
