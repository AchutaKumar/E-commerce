from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.models import User
from .serializers import UserProfileSerializer, UserRegistrationSerializer, UserSerializer
from rest_framework import status
from .models import CartItem, OrderItem, Product, Category, Cart, Order
from .serializers import CartSerializer, ProductSerializer, CategorySerializer

@api_view(['GET'])
def get_products(req):
    product = Product.objects.select_related('category').all()
    serializer = ProductSerializer(product, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_product(req, pk):
    try:
        product = Product.objects.select_related('category').get(id=pk)
        serializer = ProductSerializer(product, context={'request': req})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET'])
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
    try:
        product_id = req.data.get('product_id')
        quantity = int(req.data.get('quantity', 1))
        product = Product.objects.get(id=product_id)
        cart, created = Cart.objects.prefetch_related('item__product').get_or_create(user=req.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        item.quantity = (item.quantity + quantity) if not created else quantity
        item.save()
        cart_prefetched = Cart.objects.prefetch_related('item__product').get(id=cart.id)
        return Response(CartSerializer(cart_prefetched).data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(req):
    item_id = req.data.get('item_id')
    CartItem.objects.filter(id=item_id, cart__user=req.user).delete()
    cart, created = Cart.objects.prefetch_related('item__product').get_or_create(user=req.user)
    return Response(CartSerializer(cart).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(req):
    item_id = req.data.get('item_id')
    quantity = req.data.get('quantity')

    if not item_id or quantity is None:
        return Response({'error': 'Item ID and quantity are required'}, status=400)

    try:
        item = CartItem.objects.select_related('cart').get(id=item_id, cart__user=req.user)
        cart = item.cart
        if int(quantity) < 1:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
        cart_prefetched = Cart.objects.prefetch_related('item__product').get(id=cart.id)
        return Response(CartSerializer(cart_prefetched).data)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=404)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(req):
    try:
        phone = req.data.get('phone')
        if not phone or not phone.isdigit() or len(phone) < 10:
            return Response({'error': 'Invalid phone number'}, status=400)
        cart, created = Cart.objects.prefetch_related('item__product').get_or_create(user=req.user)
        items = list(cart.item.all())
        if not items:
            return Response({'error': 'Cart is empty'}, status=400)
        total = sum(item.product.price * item.quantity for item in items)
        order = Order.objects.create(user=req.user, total_amount=total)
        OrderItem.objects.bulk_create([
            OrderItem(order=order, product=item.product, quantity=item.quantity, price=item.product.price)
            for item in items
        ])
        cart.item.all().delete()
        return Response({'message': 'Order created successfully', 'order_id': order.id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

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
    if req.method == 'PUT':
        user = req.user
        data = req.data
        new_username = data.get('username')
        new_email = data.get('email')
        new_phone = data.get('phone_number')

        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exists():
                return Response({'error': 'Username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username

        if new_email and new_email != user.email:
            if User.objects.filter(email=new_email).exists():
                return Response({'error': 'Email is already registered.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email

        if new_phone is not None:
            from .models import UserProfile
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.phone_number = new_phone
            profile.save()

        try:
            user.save()
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
        
    serializer = UserProfileSerializer(req.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_product(req):
    try:
        category_id = req.data.get('category')
        category = Category.objects.get(id=category_id)
        product = Product.objects.create(
            category=category,
            name=req.data.get('name'),
            description=req.data.get('description', ''),
            price=req.data.get('price'),
            image=req.FILES.get('image')
        )
        serializer = ProductSerializer(product, context={'request': req})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
