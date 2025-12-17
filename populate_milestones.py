import os
import sys
import django

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from clinical.models import MilestoneTemplate, ChildMilestone
from patients.models import Child, Caregiver
import datetime

# 1. Create Comprehensive Standard Templates
templates_data = [
    # 0 Months (New Born)
    {
        "title": "New Born", 
        "desc": "ready for the first photo", 
        "age": 0,
        "hi": {"title": "नवजात", "desc": "पहली फोटो के लिए तैयार"},
        "kn": {"title": "ನವಜಾತ ಶಿಶು", "desc": "ಮೊದಲ ಫೋಟೋಗೆ ಸಿದ್ಧವಾಗಿದೆ"}
    },
    # 2 Months
    {
        "title": "Social Smile", 
        "desc": "Smiles at people", 
        "age": 2,
        "hi": {"title": "सामाजिक मुस्कान", "desc": "लोगों को देखकर मुस्कुराता है"},
        "kn": {"title": "ಸಾಮಾಜಿಕ ನಗು", "desc": "ಜನರನ್ನು ನೋಡಿದಾಗ ನಗುತ್ತದೆ"}
    },
    {
        "title": "Head Up", 
        "desc": "Holds head up when on tummy", 
        "age": 2,
        "hi": {"title": "सिर उठाना", "desc": "पेट के बल लेटने पर सिर उठाता है"},
        "kn": {"title": "ತಲೆ ಎತ್ತುವುದು", "desc": "ಹೊಟ್ಟೆಯ ಮೇಲೆ ಮಲಗಿದಾಗ ತಲೆಯನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುತ್ತದೆ"}
    },
    # 4 Months
    {
        "title": "Rollover", 
        "desc": "Rolls from tummy to back", 
        "age": 4,
        "hi": {"title": "पलटना", "desc": "पेट से पीठ के बल पलटता है"},
        "kn": {"title": "ಉರುಳುವುದು", "desc": "ಹೊಟ್ಟೆಯಿಂದ ಬೆನ್ನಿಗೆ ಉರುಳುತ್ತದೆ"}
    },
    {
        "title": "Babbling", 
        "desc": "Makes sounds like 'ooh' and 'aah'", 
        "age": 4,
        "hi": {"title": "बड़बड़ाना", "desc": "'ऊ' और 'आ' जैसी आवाज़ें निकालता है"},
        "kn": {"title": "ಬಡಬಡಿಸುವುದು", "desc": "'ಊ' ಮತ್ತು 'ಆ' ತರಹದ ಶಬ್ದಗಳನ್ನು ಮಾಡುತ್ತದೆ"}
    },
    # 6 Months
    {
        "title": "Sits with Support", 
        "desc": "Sits without help for short periods", 
        "age": 6,
        "hi": {"title": "सहारे के साथ बैठना", "desc": "थोड़ी देर के लिए बिना मदद के बैठता है"},
        "kn": {"title": "ಬೆಂಬಲದೊಂದಿಗೆ ಕುಳಿತುಕೊಳ್ಳುವುದು", "desc": "ಸ್ವಲ್ಪ ಸಮಯದವರೆಗೆ ಸಹಾಯವಿಲ್ಲದೆ ಕುಳಿತುಕೊಳ್ಳುತ್ತದೆ"}
    },
    {
        "title": "Passes Objects", 
        "desc": "Passes toy from one hand to another", 
        "age": 6,
        "hi": {"title": "वस्तुएँ पकड़ना", "desc": "खिलौने को एक हाथ से दूसरे हाथ में देता है"},
        "kn": {"title": "ವಸ್ತುಗಳನ್ನು ರವಾನಿಸುವುದು", "desc": "ಆಟಿಕೆ ಒಂದು ಕೈಯಿಂದ ಇನ್ನೊಂದು ಕೈಗೆ ನೀಡುತ್ತದೆ"}
    },
    # 9 Months
    {
        "title": "Crawling", 
        "desc": "Crawls on hands and knees", 
        "age": 9,
        "hi": {"title": "घुटनों के बल चलना", "desc": "हाथ और घुटनों के बल चलता है"},
        "kn": {"title": "ತೆವಳುವುದು", "desc": "ಕೈ ಮತ್ತು ಮೊಣಕಾಲುಗಳ ಮೇಲೆ ತೆವಳುತ್ತದೆ"}
    },
    {
        "title": "Pincer Grasp", 
        "desc": "Picks up small food with thumb/index", 
        "age": 9,
        "hi": {"title": "चुटकी पकड़", "desc": "अंगूठे और तर्जनी से छोटा भोजन उठाता है"},
        "kn": {"title": "ಚಿಮುಟದ ಹಿಡಿತ", "desc": "ಹೆಬ್ಬೆರಳು/ತೋರುಬೆರಳಿನಿಂದ ಸಣ್ಣ ಆಹಾರವನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ"}
    },
    # 12 Months
    {
        "title": "First Steps", 
        "desc": "Takes steps holding on or alone", 
        "age": 12,
        "hi": {"title": "पहला कदम", "desc": "पकड़ कर या अकेले कदम बढ़ाता है"},
        "kn": {"title": "ಮೊದಲ ಹಂತಗಳು", "desc": "ಹಿಡಿದುಕೊಂಡು ಅಥವಾ ಏಕಾಂಗಿಯಾಗಿ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡುತ್ತದೆ"}
    },
    {
        "title": "First Words", 
        "desc": "Says 'mama' or 'dada'", 
        "age": 12,
        "hi": {"title": "पहला शब्द", "desc": "'mama' या 'dada' बोलता है"},
        "kn": {"title": "ಮೊದಲ ಪದಗಳು", "desc": "'ಅಮ್ಮ' ಅಥವಾ 'ಅಪ್ಪ' ಎನ್ನುತ್ತದೆ"}
    },
    # 18 Months
    {
        "title": "Walking Well", 
        "desc": "Walks alone steadily", 
        "age": 18,
        "hi": {"title": "अच्छी तरह चलना", "desc": "अकेले स्थिरता से चलता है"},
        "kn": {"title": "ಚೆನ್ನಾಗಿ ನಡೆಯುವುದು", "desc": "ಏಕಾಂಗಿಯಾಗಿ ಸ್ಥಿರವಾಗಿ ನಡೆಯುತ್ತದೆ"}
    },
    {
        "title": "Spoon Feeding", 
        "desc": "Eats with a spoon", 
        "age": 18,
        "hi": {"title": "चम्मच से खाना", "desc": "चम्मच से खाता है"},
        "kn": {"title": "ಚಮಚದ ಊಟ", "desc": "ಚಮಚದೊಂದಿಗೆ ತಿನ್ನುತ್ತದೆ"}
    },
    # 24 Months
    {
        "title": "Running", 
        "desc": "Runs well", 
        "age": 24,
        "hi": {"title": "दौड़ना", "desc": "अच्छी तरह दौड़ता है"},
        "kn": {"title": "ಓಡುವುದು", "desc": "ಚೆನ್ನಾಗಿ ಓಡುತ್ತದೆ"}
    },
    {
        "title": "2-Word Sentences", 
        "desc": "Puts two words together", 
        "age": 24,
        "hi": {"title": "दो शब्दों के वाक्य", "desc": "दो शब्दों को एक साथ जोड़ता है"},
        "kn": {"title": "2-ಪದಗಳ ವಾಕ್ಯಗಳು", "desc": "ಎರಡು ಪದಗಳನ್ನು ಒಟ್ಟಿಗೆ ಸೇರಿಸುತ್ತದೆ"}
    },
]

templates = []
print("--- Clearing Old Data & Creating Templates ---")
ChildMilestone.objects.all().delete()
MilestoneTemplate.objects.all().delete()


for data in templates_data:
    # 1. Create with Base English
    t = MilestoneTemplate(
        title=data['title'],
        title_en=data['title'],
        description=data['desc'],
        description_en=data['desc'],
        expected_age_months=data['age']
    )
    
    # 2. Add Hindi
    if 'hi' in data:
        t.title_hi = data['hi']['title']
        t.description_hi = data['hi']['desc']

    # 3. Add Kannada
    if 'kn' in data:
        t.title_kn = data['kn']['title']
        t.description_kn = data['kn']['desc']
        
    t.save()
    templates.append(t)
    print(f"Verified: {t.title} (Hi: {t.title_hi}, Kn: {t.title_kn})")

# 2. Get/Create Zara and link to EXISTING Caregiver (Lakshmi)
print("\n--- Linking Zara to Active Caregiver ---")
cg = Caregiver.objects.filter(phone_number='9999999999').first()
if not cg:
    cg, _ = Caregiver.objects.get_or_create(
        phone_number='9999999999',
        defaults={'first_name': 'Lakshmi', 'last_name': 'Devi', 'relationship': 'MOTHER'}
    )
print(f"Active Caregiver: {cg.first_name} ({cg.phone_number})")

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

# 3. Assign All Templates to ALL Children
print("--- Syncing Milestones for ALL Children ---")
all_children = Child.objects.all()
for kid in all_children:
    print(f"Processing: {kid.first_name}")
    count = 0
    for t in templates:
        cm, c = ChildMilestone.objects.get_or_create(child=kid, template=t)
        if c: count += 1
        
        age_in_months = (datetime.date.today() - kid.date_of_birth).days // 30
        
        if t.expected_age_months <= age_in_months:
            cm.is_completed = True
            cm.save()
            
    print(f" - Verified milestones (Auto-completed up to {age_in_months}m)")

print("Done. Refresh Dashboard.")
