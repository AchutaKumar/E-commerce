from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category, related_name="product", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="product/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "-created_at"], name="idx_category_created"),
            models.Index(fields=["name"], name="idx_product_name"),
        ]

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.user.username


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"], name="idx_order_user_created"),
        ]

    def __str__(self):
        return f"Order {self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="item", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        indexes = [
            models.Index(fields=["order", "product"], name="idx_orderitem_order_product"),
        ]

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["user"], name="idx_cart_user"),
        ]

    def __str__(self):
        return f"Cart {self.id} for {self.user}"

    @property
    def total(self):
        return sum(item.subtotal for item in self.item.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="item", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        indexes = [
            models.Index(fields=["cart", "product"], name="idx_cartitem_cart_product"),
        ]

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def subtotal(self):
        return self.quantity * self.product.price


class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-subscribed_at"]

    def __str__(self):
        return self.email


class HeroSlide(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    badge = models.CharField(max_length=100, blank=True, default="NEW COLLECTION")
    cta_text = models.CharField(max_length=50, default="Shop Now")
    cta_link = models.CharField(max_length=200, default="/shop")
    image_url = models.URLField(blank=True)
    bg_gradient = models.CharField(max_length=200, default="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order", "-id"]

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, default="Verified Buyer")
    avatar = models.URLField(blank=True)
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField()
    verified_buyer = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.rating} stars"


class FlashDeal(models.Model):
    title = models.CharField(max_length=200, default="Flash Sale - Up to 40% Off")
    subtitle = models.CharField(max_length=200, default="Limited time offer on top tech & lifestyle gear")
    discount_percentage = models.PositiveIntegerField(default=30)
    end_time = models.DateTimeField()
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="flash_deals")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

