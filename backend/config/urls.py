from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from apps.accounts.views import UserViewSet

user_router = DefaultRouter()
user_router.register('', UserViewSet, basename='user-management')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/users/', include(user_router.urls)),
    path('api/v1/animals/', include('apps.animals.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/adoptions/', include('apps.adoptions.urls')),
    path('api/v1/donations/', include('apps.donations.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/content/', include('apps.content.urls')),
    path('api/v1/dashboard/', include('apps.core.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
