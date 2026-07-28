from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('products/', views.get_products),
    path('products/create/', views.create_product),
    path('products/<int:pk>/', views.get_product),
    path('products/<int:pk>/related/', views.get_related_products),
    path('category/', views.get_category),
    path('cart/', views.get_cart),
    path('cart/add/', views.add_to_cart),
    path('cart/remove/', views.remove_from_cart),
    path('cart/update/', views.update_cart_quantity),
    path('orders/create/', views.create_order),
    path('profile/', views.get_profile),
    path('newsletter/subscribe/', views.newsletter_subscribe),
    path('session/', views.get_session_info),
    path('session/track-view/', views.track_recently_viewed),
    path('landing/data/', views.get_landing_data),
]

