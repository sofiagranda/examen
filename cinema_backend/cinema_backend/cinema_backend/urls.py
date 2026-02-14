from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from cinema import views
from django.views.generic.base import RedirectView
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'shows', views.ShowViewSet)
router.register(r'reservations', views.ReservationViewSet)

urlpatterns = [
    path('', RedirectView.as_view(url='admin/', permanent=True)),

    path('admin/', admin.site.urls),

    path('api/', include(router.urls)),

    path('api/auth/login/', views.CustomAuthToken.as_view(), name='api_login'),

    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)