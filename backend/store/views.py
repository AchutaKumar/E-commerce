from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.contrib.auth.models import User
from .serializers import UserProfileSerializer, UserRegistrationSerializer, UserSerializer, HeroSlideSerializer, TestimonialSerializer, FlashDealSerializer
from rest_framework import status
from .models import CartItem, OrderItem, Product, Category, Cart, Order, UserProfile, NewsletterSubscription, HeroSlide, Testimonial, FlashDeal
from .serializers import CartSerializer, ProductSerializer, CategorySerializer
from django.utils import timezone
from datetime import timedelta

from django.views.decorators.cache import cache_page
from django.core.cache import cache

from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Prefetch


# ── Cache helpers ────────────────────────────────────────


def cache_product_detail(pk):
    return f"product_detail:{pk}"


def cache_related_products(pk):
    return f"related_products:{pk}"


def invalidate_product_caches(pk=None):
    """Invalidate product caches on create/update."""
    # Product list keys are pattern-matched and deleted in bulk
    # Product detail and related products are keyed by pk
    if pk:
        cache.delete(cache_product_detail(pk))
        cache.delete(cache_related_products(pk))
    # Invalidate all product list caches (pattern-based)
    # Note: DatabaseCache doesn't support pattern delete, so we use a version bump
    cache.set("product_list_version", cache.get_or_set("product_list_version", 0) + 1)


def get_product_list_cache_key(page, query, category_id):
    version = cache.get("product_list_version", 0)
    return f"pl_v{version}:page={page}:q={query or ''}:cat={category_id or 'All'}"


from rest_framework.exceptions import NotFound

class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


@api_view(["GET"])
def get_products(req):
    query = req.GET.get("q", "")
    category_id = req.GET.get("category", "All")
    page = req.GET.get("page", 1)

    # Auto-seed landing page data & products if empty
    if Product.objects.count() == 0:
        get_landing_data(req)

    # Try cache first
    cache_key = get_product_list_cache_key(page, query, category_id)
    cached = cache.get(cache_key)
    if cached is not None:
        return Response(cached)

    products = Product.objects.select_related("category").all()

    if query:
        products = products.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )

    if category_id and category_id != "All":
        if category_id.isdigit():
            products = products.filter(category_id=category_id)
        else:
            products = products.filter(category__name=category_id)

    products = products.order_by("-created_at")

    paginator = ProductPagination()
    try:
        paginated_products = paginator.paginate_queryset(products, req)
    except NotFound:
        empty_data = {"count": products.count(), "next": None, "previous": None, "results": []}
        return Response(empty_data)

    serializer = ProductSerializer(
        paginated_products, many=True, context={"request": req}
    )
    response = paginator.get_paginated_response(serializer.data)

    # Cache the response data for 5 minutes
    cache.set(cache_key, response.data, 60 * 5)
    return response



@api_view(["GET"])
def get_product(req, pk):
    cache_key = cache_product_detail(pk)
    cached = cache.get(cache_key)
    if cached is not None:
        return Response(cached)

    try:
        product = Product.objects.select_related("category").get(id=pk)
        serializer = ProductSerializer(product, context={"request": req})
        data = serializer.data
        cache.set(cache_key, data, 60 * 5)
        return Response(data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)


@api_view(["GET"])
def get_related_products(req, pk):
    """Return up to 4 products in the same category, excluding the current one."""
    cache_key = cache_related_products(pk)
    cached = cache.get(cache_key)
    if cached is not None:
        return Response(cached)

    try:
        product = Product.objects.only("category_id").get(id=pk)
        related = (
            Product.objects.select_related("category")
            .filter(category_id=product.category_id)
            .exclude(id=pk)
            .order_by("-created_at")[:4]
        )
        serializer = ProductSerializer(related, many=True, context={"request": req})
        data = serializer.data
        cache.set(cache_key, data, 60 * 5)
        return Response(data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)


@api_view(["GET"])
@cache_page(60 * 15)
def get_category(req):
    # Tiny table – no optimization needed
    category = Category.objects.all()
    serializer = CategorySerializer(category, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_cart(req):
    cart = Cart.objects.prefetch_related(
        Prefetch("item", queryset=CartItem.objects.select_related("product"))
    ).filter(user=req.user).first()

    if not cart:
        cart = Cart.objects.create(user=req.user)

    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(req):
    try:
        product_id = req.data.get("product_id")
        quantity = int(req.data.get("quantity", 1))

        # Lightweight product check – only the id needed for the FK
        product = Product.objects.only("id", "price").get(id=product_id)

        # Get or create cart (lightweight – no prefetch needed yet)
        cart, _ = Cart.objects.get_or_create(user=req.user)

        # Atomic get-or-create and update quantity
        item, created = CartItem.objects.select_related("product").get_or_create(
            cart=cart, product=product
        )
        item.quantity = (item.quantity + quantity) if not created else quantity
        item.save()

        # Re-fetch cart with all items and products for the response
        cart = (
            Cart.objects.prefetch_related(
                Prefetch("item", queryset=CartItem.objects.select_related("product"))
            )
            .get(id=cart.id)
        )
        return Response(CartSerializer(cart).data)

    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_from_cart(req):
    item_id = req.data.get("item_id")

    # Delete the cart item
    CartItem.objects.filter(id=item_id, cart__user=req.user).delete()

    # Fetch or create cart with items for the response
    cart, _ = Cart.objects.prefetch_related(
        Prefetch("item", queryset=CartItem.objects.select_related("product"))
    ).get_or_create(user=req.user)

    return Response(CartSerializer(cart).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_cart_quantity(req):
    item_id = req.data.get("item_id")
    quantity = req.data.get("quantity")

    if not item_id or quantity is None:
        return Response({"error": "Item ID and quantity are required"}, status=400)

    try:
        # Only need cart_id (FK column) — no select_related needed
        item = CartItem.objects.only("id", "quantity", "cart_id").get(
            id=item_id, cart__user=req.user
        )
        cart_id = item.cart_id  # Use cached FK value – no extra query

        if int(quantity) < 1:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        # Re-fetch cart with items for response
        cart = (
            Cart.objects.prefetch_related(
                Prefetch("item", queryset=CartItem.objects.select_related("product"))
            )
            .get(id=cart_id)
        )
        return Response(CartSerializer(cart).data)

    except CartItem.DoesNotExist:
        return Response({"error": "Cart item not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(req):
    try:
        phone = req.data.get("phone")
        full_name = req.data.get("full_name", "")
        address = req.data.get("address", "")

        if not phone or len(phone) < 10:
            return Response({"error": "Invalid phone number"}, status=400)

        # Fetch cart with items and products in a single chain
        cart = (
            Cart.objects.prefetch_related(
                Prefetch("item", queryset=CartItem.objects.select_related("product"))
            )
            .filter(user=req.user)
            .first()
        )

        if not cart:
            return Response({"error": "Cart is empty"}, status=400)

        items = list(cart.item.all())  # Evaluates the prefetched data
        if not items:
            return Response({"error": "Cart is empty"}, status=400)

        # Calculate total from prefetched data (no extra queries)
        total = sum(item.product.price * item.quantity for item in items)

        # Bulk create order items and create order in one shot
        order = Order.objects.create(user=req.user, total_amount=total)

        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price,
                )
                for item in items
            ]
        )

        # Delete all cart items efficiently
        cart.item.all().delete()

        return Response(
            {"message": "Order created successfully", "order_id": order.id}
        )

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def newsletter_subscribe(req):
    """Subscribe an email address to the newsletter."""
    email = req.data.get("email", "").strip().lower()

    if not email or "@" not in email:
        return Response(
            {"error": "A valid email address is required."}, status=400
        )

    _, created = NewsletterSubscription.objects.get_or_create(email=email)

    if created:
        return Response({"message": "Subscribed successfully!"})
    return Response({"message": "You are already subscribed!"})


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(req):
    serializer = UserRegistrationSerializer(data=req.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {"message": "User created successfully", "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def get_profile(req):
    if req.method == "PUT":
        user = req.user
        data = req.data
        new_username = data.get("username")
        new_email = data.get("email")
        new_phone = data.get("phone_number")

        if new_username and new_username != user.username:
            if (
                User.objects.filter(username=new_username)
                .exclude(id=user.id)
                .exists()
            ):
                return Response(
                    {"error": "Username is already taken."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.username = new_username

        if new_email and new_email != user.email:
            if (
                User.objects.filter(email=new_email).exclude(id=user.id).exists()
            ):
                return Response(
                    {"error": "Email is already registered."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.email = new_email

        if new_phone is not None:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.phone_number = new_phone
            profile.save()

        try:
            user.save()
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

        # Refresh with userprofile explicitly for accurate serialization
        user = User.objects.select_related("userprofile").get(id=user.id)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    user = User.objects.select_related("userprofile").get(id=req.user.id)
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_session_info(req):
    """Return session-based data: recently viewed products and auth status."""
    raw_ids = req.session.get("recently_viewed", [])
    # Convert to int — session stores JSON values which may be strings
    recently_viewed_ids = [
        int(pid) for pid in raw_ids if isinstance(pid, int) or (isinstance(pid, str) and pid.isdigit())
    ]
    recently_viewed = []
    if recently_viewed_ids:
        products = Product.objects.select_related("category").filter(
            id__in=recently_viewed_ids
        )
        product_map = {p.id: p for p in products}
        recently_viewed = [
            {
                "id": pid,
                "name": product_map[pid].name,
                "price": str(product_map[pid].price),
                "image": product_map[pid].image.url
                if product_map[pid].image
                else None,
                "category": product_map[pid].category.name
                if product_map[pid].category
                else None,
            }
            for pid in recently_viewed_ids
            if pid in product_map
        ]
        recently_viewed = recently_viewed[:6]

    return Response(
        {
            "recently_viewed": recently_viewed,
            "session_id": req.session.session_key,
            "is_authenticated": req.user.is_authenticated,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def track_recently_viewed(req):
    """Record a product view in the user's session."""
    product_id = req.data.get("product_id")
    if not product_id:
        return Response({"error": "product_id is required"}, status=400)

    recently_viewed = req.session.get("recently_viewed", [])
    # Remove if already present (to move it to front)
    if product_id in recently_viewed:
        recently_viewed.remove(product_id)
    # Add to front
    recently_viewed.insert(0, product_id)
    # Keep only the latest 20
    recently_viewed = recently_viewed[:20]
    req.session["recently_viewed"] = recently_viewed
    req.session.modified = True
    return Response({"ok": True})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_product(req):
    try:
        category_id = req.data.get("category")
        category = Category.objects.get(id=category_id)
        product = Product.objects.create(
            category=category,
            name=req.data.get("name"),
            description=req.data.get("description", ""),
            price=req.data.get("price"),
            image=req.FILES.get("image"),
        )
        # Invalidate product list caches
        invalidate_product_caches(product.id)
        serializer = ProductSerializer(product, context={"request": req})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def get_landing_data(req):
    """
    Consolidated API endpoint for the landing page.
    Returns hero slides, categories with product counts, trending products,
    active flash deal, testimonials, and live store stats.
    """
    # 1. Hero Slides (seed if empty)
    slides = HeroSlide.objects.filter(is_active=True).order_by("order")
    if not slides.exists():
        HeroSlide.objects.create(
            title="Experience Next-Gen Audio & Innovation",
            subtitle="Discover premium wireless noise-canceling headphones, flagship devices, and curated tech essentials.",
            badge="FEATURED LAUNCH 2026",
            cta_text="Shop Collection",
            cta_link="/shop",
            bg_gradient="linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311b92 100%)",
            order=1,
        )
        HeroSlide.objects.create(
            title="Elevate Your Everyday Style & Gear",
            subtitle="Explore minimalist aesthetics with high-performance craftsmanship designed for everyday life.",
            badge="UP TO 40% OFF",
            cta_text="Explore Deals",
            cta_link="/shop",
            bg_gradient="linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #047857 100%)",
            order=2,
        )
        HeroSlide.objects.create(
            title="Premium Tech. Unmatched Quality.",
            subtitle="Fast delivery, 100% authentic products, and 24/7 dedicated VIP customer support.",
            badge="LIMITED TIME OFFER",
            cta_text="Browse All Products",
            cta_link="/shop",
            bg_gradient="linear-gradient(135deg, #0f172a 0%, #701a75 50%, #be185d 100%)",
            order=3,
        )
        slides = HeroSlide.objects.filter(is_active=True).order_by("order")

    # 2. Categories with Product Count and Category-Specific Images
    category_image_defaults = {
        "electronics": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
        "fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
        "skin care": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
        "skincare": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
        "books": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop",
        "gifts": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
    }

    categories_qs = Category.objects.all()
    categories_data = []
    for cat in categories_qs:
        count = Product.objects.filter(category=cat).count()
        cat_key = cat.name.lower().strip()
        slug_key = cat.slug.lower().strip()
        img_url = (
            category_image_defaults.get(cat_key) 
            or category_image_defaults.get(slug_key) 
            or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop"
        )
        categories_data.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "product_count": count,
            "image_url": img_url
        })


    # 3. Trending Products (latest 8)
    trending_products = Product.objects.select_related("category").order_by("-created_at")[:8]
    trending_serialized = ProductSerializer(trending_products, many=True, context={"request": req}).data

    # 4. Flash Deal (seed if missing)
    flash_deal = FlashDeal.objects.filter(is_active=True).first()
    if not flash_deal:
        sample_prod = Product.objects.first()
        flash_deal = FlashDeal.objects.create(
            title="Mega Tech Flash Sale",
            subtitle="Exclusive 35% discount on our top-rated flagship items!",
            discount_percentage=35,
            end_time=timezone.now() + timedelta(hours=36),
            product=sample_prod,
            is_active=True,
        )
    flash_deal_serialized = FlashDealSerializer(flash_deal, context={"request": req}).data if flash_deal else None

    # 5. Testimonials (seed if missing)
    testimonials_qs = Testimonial.objects.filter(is_featured=True)
    if not testimonials_qs.exists():
        Testimonial.objects.create(
            name="Alexander Wright",
            role="Verified Buyer",
            rating=5,
            comment="LoyalKart completely exceeded my expectations. Super fast shipping and the packaging was ultra-premium!",
            verified_buyer=True,
            is_featured=True,
        )
        Testimonial.objects.create(
            name="Sophia Chen",
            role="Tech Enthusiast",
            rating=5,
            comment="The quality of products and smooth checkout experience make this my favorite online store. 10/10 recommendation!",
            verified_buyer=True,
            is_featured=True,
        )
        Testimonial.objects.create(
            name="Marcus Vance",
            role="Frequent Shopper",
            rating=5,
            comment="Customer support helped me within 5 minutes when I had a question. Fantastic service and authentic gear.",
            verified_buyer=True,
            is_featured=True,
        )
        testimonials_qs = Testimonial.objects.filter(is_featured=True)
    testimonials_serialized = TestimonialSerializer(testimonials_qs, many=True).data

    # 6. Live Store Stats
    total_products = Product.objects.count()
    total_orders = Order.objects.count()

    stats = {
        "happy_customers": "15,000+",
        "total_products": total_products or 120,
        "satisfaction_rate": "99.4%",
        "fast_delivery_hours": "24h"
    }

    return Response({
        "hero_slides": HeroSlideSerializer(slides, many=True).data,
        "categories": categories_data,
        "trending_products": trending_serialized,
        "flash_deal": flash_deal_serialized,
        "testimonials": testimonials_serialized,
        "stats": stats,
    })

