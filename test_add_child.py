import urllib.request
import json
import django
import os
import uuid

# Setup Django environment to get Caregiver ID
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from patients.models import Caregiver

cg = Caregiver.objects.filter(phone_number='9999999999').first()
if not cg:
    print("Caregiver Lakshmi not found!")
    exit(1)

print(f"Testing for Caregiver: {cg.id}")

url = "http://127.0.0.1:8000/api/patients/children/"
data = {
    "first_name": "TestBaby",
    "last_name": "Script",
    "date_of_birth": "2024-01-01",
    "sex": "M",
    "unique_child_id": f"CID-SCRIPT-{uuid.uuid4().hex[:6]}",
    "caregiver": str(cg.id)
}

print("Sending Data:", data)
try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        print("Status Code:", response.getcode())
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print("Request failed:", e)
