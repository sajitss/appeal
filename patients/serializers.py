from rest_framework import serializers
from .models import Caregiver, Child

class CaregiverSerializer(serializers.ModelSerializer):
    family_members = serializers.SerializerMethodField()

    class Meta:
        model = Caregiver
        fields = '__all__'

    def get_family_members(self, obj):
        if obj.family:
            members = obj.family.members.all()
            return [{
                'id': m.id,
                'first_name': m.first_name,
                'last_name': m.last_name,
                'relationship': m.relationship,
                'phone_number': m.phone_number
            } for m in members]
        return []

class ChildSerializer(serializers.ModelSerializer):
    caregiver_details = CaregiverSerializer(source='caregiver', read_only=True)

    class Meta:
        model = Child
        fields = '__all__'
