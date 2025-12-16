from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Encounter, ScreeningResult, ChildMilestone
from .serializers import EncounterSerializer, ScreeningResultSerializer
import datetime

class EncounterViewSet(viewsets.ModelViewSet):
    queryset = Encounter.objects.all()
    serializer_class = EncounterSerializer

class ScreeningResultViewSet(viewsets.ModelViewSet):
    queryset = ScreeningResult.objects.all()
    serializer_class = ScreeningResultSerializer

class MilestoneViewSet(viewsets.GenericViewSet):
    """
    Handle individual milestone actions
    """
    queryset = ChildMilestone.objects.all()
    # lookup_field = 'pk' # Default
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'])
    def upload_evidence(self, request, pk=None):
        try:
            # pk is the child_milestone id
            milestone = ChildMilestone.objects.get(id=pk)
            
            file = request.FILES.get('file')
            if not file:
                 return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            milestone.evidence = file
            milestone.status = 'SUBMITTED' # Review Flow Step 1
            # milestone.is_completed = True # REMOVED: Wait for review
            milestone.completion_date = None # Not done yet
            milestone.save()
            
            return Response({'status': 'success', 'message': 'Evidence uploaded. Submitted for AI review.'})
            
        except ChildMilestone.DoesNotExist:
            return Response({'error': 'Milestone not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def perform_ai_review(self, request, pk=None):
        """
        Mock Endpoint: Simulates AI analysis passing.
        """
        try:
            milestone = ChildMilestone.objects.get(id=pk)
            if milestone.status != 'SUBMITTED':
                 return Response({'error': 'Milestone not in SUBMITTED state'}, status=status.HTTP_400_BAD_REQUEST)
            
            milestone.status = 'AI_REVIEWED'
            milestone.save()
            return Response({'status': 'success', 'message': 'AI Review Passed'})
        except ChildMilestone.DoesNotExist:
            return Response({'error': 'Milestone not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def perform_human_review(self, request, pk=None):
        """
        Mock Endpoint: Simulates Human Doctor approval.
        """
        try:
            milestone = ChildMilestone.objects.get(id=pk)
             # Allow direct approval from Submitted too for flexibility
            if milestone.status not in ['SUBMITTED', 'AI_REVIEWED']:
                 return Response({'error': 'Milestone not ready for review'}, status=status.HTTP_400_BAD_REQUEST)
            
            milestone.status = 'COMPLETED'
            milestone.is_completed = True
            milestone.completion_date = datetime.date.today()
            milestone.save()
            return Response({'status': 'success', 'message': 'Milestone Approved and Completed'})
        except ChildMilestone.DoesNotExist:
            return Response({'error': 'Milestone not found'}, status=status.HTTP_404_NOT_FOUND)
