from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EncounterViewSet, ScreeningResultViewSet

router = DefaultRouter()
router.register(r'encounters', EncounterViewSet)
router.register(r'screening-results', ScreeningResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
