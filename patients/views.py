from rest_framework import viewsets, permissions
from .models import Caregiver, Child
from .serializers import CaregiverSerializer, ChildSerializer

class CaregiverViewSet(viewsets.ModelViewSet):
    queryset = Caregiver.objects.all()
    serializer_class = CaregiverSerializer

class ChildViewSet(viewsets.ModelViewSet):
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        print("DEBUG: perform_create called with data:", serializer.validated_data)
        child = serializer.save()
        print("DEBUG: Child saved:", child)
        
        # Populate Milestones from Templates
        # This ensures every new child gets the standard developmental path (like Zara/Arjun)
        try:
            from clinical.models import MilestoneTemplate, ChildMilestone
            import datetime
            
            templates = MilestoneTemplate.objects.all()
            # Calculate rough age in months
            age_months = (datetime.date.today() - child.date_of_birth).days // 30
            
            for t in templates:
                cm, created = ChildMilestone.objects.get_or_create(child=child, template=t)
                
                # Default is pending (is_completed=False), so nothing to do here.
                # Timelines will show them as ACTIVE (Pending) if age >= expected_age.
                    
        except Exception as e:
            print(f"Error populating milestones for {child}: {e}")
