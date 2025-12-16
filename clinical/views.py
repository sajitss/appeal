from rest_framework import viewsets
from .models import Encounter, ScreeningResult
from .serializers import EncounterSerializer, ScreeningResultSerializer

class EncounterViewSet(viewsets.ModelViewSet):
    queryset = Encounter.objects.all()
    serializer_class = EncounterSerializer

class ScreeningResultViewSet(viewsets.ModelViewSet):
    queryset = ScreeningResult.objects.all()
    serializer_class = ScreeningResultSerializer
