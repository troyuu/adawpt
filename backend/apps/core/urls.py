from django.urls import path

from . import views

urlpatterns = [
    path('public-stats/', views.public_stats, name='public-stats'),
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
    path('adopter/', views.dashboard_adopter, name='dashboard-adopter'),
]
