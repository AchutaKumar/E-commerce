from rest_framework import serializers
from .models import CartItem, Product, Category,Cart
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only = True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"
    
    def get_image(self, obj):
        if obj.image:
            return obj.image.url if hasattr(obj.image, 'url') else str(obj.image)
        return None

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source = 'product.name', read_only = True)
    product_price = serializers.DecimalField(source = 'product.price', max_digits=10, decimal_places=2, read_only = True)
    product_image = serializers.ImageField(source = 'product.image', read_only = True)
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'product_name', 'product_price', 'product_image']

class CartSerializer(serializers.ModelSerializer):
    item = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'item', 'total']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [ 'username', 'email', 'password' ,'password2', 'phone_number']

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
            
        email = data.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email is already registered."})
            
        return data
    
    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        from .models import UserProfile
        UserProfile.objects.create(user=user, phone_number=phone_number)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='userprofile.phone_number', required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'is_staff', 'phone_number']

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_staff'] = self.user.is_staff
        return data