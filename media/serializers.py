from rest_framework import serializers
from .models import MediaAsset, AIReport

class AIReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIReport
        fields = '__all__'

class MediaAssetSerializer(serializers.ModelSerializer):
    ai_report = AIReportSerializer(read_only=True)

    class Meta:
        model = MediaAsset
        fields = '__all__'
