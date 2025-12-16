from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EncounterViewSet, ScreeningResultViewSet, MilestoneViewSet

router = DefaultRouter()
router.register(r'encounters', EncounterViewSet)
router.register(r'screening-results', ScreeningResultViewSet)
router.register(r'milestones', MilestoneViewSet, basename='milestone')

urlpatterns = [
    path('', include(router.urls)),
]
