from decimal import Decimal
import re

from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Cart, CartItem, Category, Product, UserProfile

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
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password2 = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(
        write_only=True, required=False, allow_blank=True, max_length=20
    )

    class Meta:
        model = User
        fields = [ 'username', 'email', 'password' ,'password2', 'phone_number']

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password": "Passwords do not match."})

        try:
            validate_password(data['password'])
        except DjangoValidationError as error:
            raise serializers.ValidationError({'password': error.messages}) from error
            
        email = data.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email is already registered."})
            
        return data
    
    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        validated_data.pop('password2')
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            UserProfile.objects.create(user=user, phone_number=phone_number)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    is_staff = serializers.BooleanField(read_only=True)
    phone_number = serializers.CharField(
        source='userprofile.phone_number',
        required=False,
        allow_blank=True,
        max_length=20,
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'is_staff', 'phone_number']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('userprofile', {})
        phone_number = profile_data.get('phone_number')

        with transaction.atomic():
            for field, value in validated_data.items():
                setattr(instance, field, value)
            instance.save()

            if phone_number is not None:
                profile, _ = UserProfile.objects.get_or_create(user=instance)
                profile.phone_number = phone_number
                profile.save(update_fields=['phone_number'])

        return instance


class CartAddSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, default=1)


class CartUpdateSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=0)


class CartRemoveSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    address = serializers.CharField(max_length=1000)
    phone = serializers.CharField(max_length=20)
    payment_method = serializers.ChoiceField(
        choices=[('COD', 'Cash on Delivery'), ('credit', 'Online Card Payment')]
    )

    def validate_phone(self, value):
        phone = value.strip()
        if not re.fullmatch(r'\+?[0-9][0-9\s().-]*', phone):
            raise serializers.ValidationError('Enter a valid phone number.')

        digits = re.sub(r'\D', '', phone)
        if not 10 <= len(digits) <= 15:
            raise serializers.ValidationError('Enter a phone number with 10 to 15 digits.')
        return phone


class ProductCreateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('0.01'),
    )
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'category']

    def validate_image(self, image):
        if image and image.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('Image must be 10 MB or smaller.')
        return image

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_staff'] = self.user.is_staff
        return data