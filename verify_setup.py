import os
import django
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from core.views import UserViewSet
from patients.views import CaregiverViewSet
from clinical.views import EncounterViewSet

def verify():
    factory = APIRequestFactory()
    
    print("Verifying User Endpoint...")
    view = UserViewSet.as_view({'get': 'list'})
    request = factory.get('/api/core/users/')
    response = view(request)
    print(f"User List Status: {response.status_code}")
    
    print("Verifying Caregiver Endpoint...")
    view = CaregiverViewSet.as_view({'get': 'list'})
    request = factory.get('/api/patients/caregivers/')
    response = view(request)
    print(f"Caregiver List Status: {response.status_code}")
    
    print("Verifying Encounter Endpoint...")
    view = EncounterViewSet.as_view({'get': 'list'})
    request = factory.get('/api/clinical/encounters/')
    response = view(request)
    print(f"Encounter List Status: {response.status_code}")

if __name__ == '__main__':
    verify()
