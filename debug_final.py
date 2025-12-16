import os
import django
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from clinical.models import ChildMilestone

print("\n--- 1. VALID IDs ---")
print(f"Total milestones: {ChildMilestone.objects.count()}")
print("IDs:", list(ChildMilestone.objects.values_list('id', flat=True)[:10]))

print("\n--- 2. MILESTONE ROUTES ---")
def print_milestone_routes(patterns, prefix=''):
    for p in patterns:
        if hasattr(p, 'url_patterns'):
            new_prefix = prefix + str(p.pattern)
            print_milestone_routes(p.url_patterns, new_prefix)
        else:
            full_path = f"{prefix}{p.pattern}"
            if 'milestones' in full_path:
                print(f"MATCH: {full_path}")

resolver = get_resolver()
print_milestone_routes(resolver.url_patterns)
