from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaregiverViewSet, ChildViewSet

router = DefaultRouter()
router.register(r'caregivers', CaregiverViewSet)
router.register(r'children', ChildViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
