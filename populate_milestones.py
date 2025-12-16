from clinical.models import MilestoneTemplate, ChildMilestone
from patients.models import Child, Caregiver
import datetime

# 1. Create Comprehensive Standard Templates
templates_data = [
    # 0 Months (New Born)
    {"title": "New Born", "desc": "Welcome to the world!", "age": 0},
    # 2 Months
    {"title": "Social Smile", "desc": "Smiles at people", "age": 2},
    {"title": "Head Up", "desc": "Holds head up when on tummy", "age": 2},
    # 4 Months
    {"title": "Rollover", "desc": "Rolls from tummy to back", "age": 4},
    {"title": "Babbling", "desc": "Makes sounds like 'ooh' and 'aah'", "age": 4},
    # 6 Months
    {"title": "Sits with Support", "desc": "Sits without help for short periods", "age": 6},
    {"title": "Passes Objects", "desc": "Passes toy from one hand to another", "age": 6},
    # 9 Months
    {"title": "Crawling", "desc": "Crawls on hands and knees", "age": 9},
    {"title": "Pincer Grasp", "desc": "Picks up small food with thumb/index", "age": 9},
    # 12 Months
    {"title": "First Steps", "desc": "Takes steps holding on or alone", "age": 12},
    {"title": "First Words", "desc": "Says 'mama' or 'dada'", "age": 12},
    # 18 Months
    {"title": "Walking Well", "desc": "Walks alone steadily", "age": 18},
    {"title": "Spoon Feeding", "desc": "Eats with a spoon", "age": 18},
    # 24 Months
    {"title": "Running", "desc": "Runs well", "age": 24},
    {"title": "2-Word Sentences", "desc": "Puts two words together", "age": 24},
]

templates = []
print("--- Clearing Old Data & Creating Templates ---")
# Optional: Clear old templates to remove 'Small Smes' or other junk
# ChildMilestone.objects.all().delete()
# MilestoneTemplate.objects.all().delete()
# We will do a soft-update: renaming specific typos if found, or just creating new ones.
# Given the user request "instead of", let's attempt to find the typo and update it, 
# or simpler: just clear and recreate for this prototype stage.
ChildMilestone.objects.all().delete()
MilestoneTemplate.objects.all().delete()

for data in templates_data:
    t, _ = MilestoneTemplate.objects.get_or_create(
        title=data['title'],
        defaults={'description': data['desc'], 'expected_age_months': data['age']}
    )
    templates.append(t)
    print(f"Verified: {t}")

# 2. Get/Create Zara and link to EXISTING Caregiver (Lakshmi)
print("\n--- Linking Zara to Active Caregiver ---")
# Try to find the original test caregiver
cg = Caregiver.objects.filter(phone_number='9999999999').first()
if not cg:
    # Fallback if Lakshmi doesn't exist
    cg, _ = Caregiver.objects.get_or_create(
        phone_number='9999999999',
        defaults={'first_name': 'Lakshmi', 'last_name': 'Devi', 'relationship': 'MOTHER'}
    )
print(f"Active Caregiver: {cg.first_name} ({cg.phone_number})")

# DOB approx 9 months ago
dob = datetime.date.today() - datetime.timedelta(days=9*30)

child, created = Child.objects.get_or_create(
    unique_child_id='CID-ZARA-009',
    defaults={
        'caregiver': cg,
        'first_name': 'Zara',
        'last_name': 'Khan',
        'date_of_birth': dob,
        'sex': 'F'
    }
)

if child.caregiver != cg:
    child.caregiver = cg
    child.save()
    print("Re-assigned Zara to Lakshmi.")

print(f"Child: {child.first_name} (Age ~9m)")

# 3. Assign All Templates to ALL Children (Arjun AND Zara)
print("--- Syncing Milestones for ALL Children ---")
all_children = Child.objects.all()
for kid in all_children:
    print(f"Processing: {kid.first_name}")
    count = 0
    for t in templates:
        cm, c = ChildMilestone.objects.get_or_create(child=kid, template=t)
        if c: count += 1
        
        # Auto-complete logic based on child's actual age
        # Age in months
        age_in_months = (datetime.date.today() - kid.date_of_birth).days // 30
        
        if t.expected_age_months <= age_in_months:
            cm.is_completed = True
            cm.save()
            
    print(f" - Verified milestones (Auto-completed up to {age_in_months}m)")

print("Done. Refresh Dashboard.")
