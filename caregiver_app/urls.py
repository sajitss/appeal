from django.urls import path
from .views import CaregiverLoginView, CaregiverDashboardView, ChildTimelineView

urlpatterns = [
    path('login/', CaregiverLoginView.as_view(), name='caregiver-login'),
    path('dashboard/', CaregiverDashboardView.as_view(), name='caregiver-dashboard'),
    path('child/<uuid:child_id>/', ChildTimelineView.as_view(), name='child-timeline'),
]
