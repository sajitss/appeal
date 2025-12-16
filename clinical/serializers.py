from rest_framework import serializers
from .models import Encounter, ScreeningResult

class ScreeningResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreeningResult
        fields = '__all__'

class EncounterSerializer(serializers.ModelSerializer):
    screenings = ScreeningResultSerializer(many=True, read_only=True)

    class Meta:
        model = Encounter
        fields = '__all__'
