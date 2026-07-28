from django.contrib import admin
from . models import Category, Product, UserProfile, Order, OrderItem, Cart, CartItem, NewsletterSubscription, HeroSlide, Testimonial, FlashDeal

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(UserProfile)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(NewsletterSubscription)
admin.site.register(HeroSlide)
admin.site.register(Testimonial)
admin.site.register(FlashDeal)