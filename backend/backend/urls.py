import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse, JsonResponse

def spa_fallback(request, path=''):
    # Check if frontend/dist/index.html exists for static serving
    frontend_dist_index = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist', 'index.html')
    if os.path.exists(frontend_dist_index):
        if not path.startswith('api/'):
            with open(frontend_dist_index, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='text/html')
    
    # If path starts with api/, return a clean JSON 404
    if path.startswith('api/'):
        return JsonResponse({'error': 'Endpoint not found'}, status=404)
    
    # Fallback message for direct Django server requests
    return HttpResponse(
        '<!DOCTYPE html><html><head><title>LoyalKart</title></head>'
        '<body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:60px 20px;background:#f8f9ff;color:#0b1c30;">'
        '<h1 style="font-size:32px;color:#0058be;">LoyalKart API Backend Server</h1>'
        '<p style="font-size:16px;color:#45464d;">The backend server is running cleanly. Access your React application via the Vite frontend dev server (e.g., http://localhost:5173).</p>'
        '</body></html>',
        status=200
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    ]

# Catch-all pattern for SPA route fallback
urlpatterns += [
    re_path(r'^(?P<path>.*)$', spa_fallback),
]

