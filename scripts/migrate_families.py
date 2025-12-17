import os
import sys
import django

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from patients.models import Caregiver, Family, Child

def migrate_families():
    print("--- Starting Family Migration ---")
    caregivers = Caregiver.objects.filter(family__isnull=True)
    
    for cg in caregivers:
        print(f"Processing Caregiver: {cg.first_name} {cg.last_name}")
        
        # 1. Create Family
        family_name = f"{cg.first_name}'s Family"
        family = Family.objects.create(name=family_name)
        print(f"  > Created Family: {family.name}")
        
        # 2. Link Caregiver
        cg.family = family
        cg.save()
        print("  > Linked Caregiver to Family")
        
        # 3. Link Children
        children = Child.objects.filter(caregiver=cg)
        for child in children:
            child.family = family
            child.save()
            print(f"   - Linked Child {child.first_name} to Family")
            
    print("--- Migration Complete ---")

if __name__ == '__main__':
    migrate_families()
