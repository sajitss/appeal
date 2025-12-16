import os
import django
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from clinical.models import ChildMilestone

# 1. Check ID 24
try:
    ms = ChildMilestone.objects.get(id=24)
    print(f"FOUND: ChildMilestone ID=24 exists. {ms}")
except ChildMilestone.DoesNotExist:
    print("MISSING: ChildMilestone ID=24 DOES NOT EXIST.")
    # Print some existing ones
    print(f"Total milestones: {ChildMilestone.objects.count()}")
    print("First 5 IDs:", list(ChildMilestone.objects.values_list('id', flat=True)[:5]))

# 2. Print URLs
print("\n--- Registered URLs ---")
url_patterns = get_resolver().url_patterns
for pattern in url_patterns:
    print(pattern)
    if hasattr(pattern, 'url_patterns'):
        for sub in pattern.url_patterns:
            print(f"  - {sub}")
            if hasattr(sub, 'url_patterns'):
                 for sub2 in sub.url_patterns:
                     print(f"    - {sub2}")
