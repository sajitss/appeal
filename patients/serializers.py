from rest_framework import serializers
from .models import Caregiver, Child

class CaregiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caregiver
        fields = '__all__'

class ChildSerializer(serializers.ModelSerializer):
    caregiver_details = CaregiverSerializer(source='caregiver', read_only=True)

    class Meta:
        model = Child
        fields = '__all__'
