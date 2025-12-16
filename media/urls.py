from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MediaAssetViewSet, AIReportViewSet

router = DefaultRouter()
router.register(r'media-assets', MediaAssetViewSet)
router.register(r'ai-reports', AIReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
