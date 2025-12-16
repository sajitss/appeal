from rest_framework import viewsets
from .models import MediaAsset, AIReport
from .serializers import MediaAssetSerializer, AIReportSerializer

class MediaAssetViewSet(viewsets.ModelViewSet):
    queryset = MediaAsset.objects.all()
    serializer_class = MediaAssetSerializer

class AIReportViewSet(viewsets.ModelViewSet):
    queryset = AIReport.objects.all()
    serializer_class = AIReportSerializer
