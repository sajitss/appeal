import os
import sys
import django

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from clinical.models import MilestoneTemplate

def run():
    print(f"| {'Age (Months)':<12} | {'Title (English)':<25} | {'Title (Hindi)':<20} | {'Title (Kannada)':<20} |")
    print(f"|{'-'*14}|{'-'*27}|{'-'*22}|{'-'*22}|")
    
    for m in MilestoneTemplate.objects.all().order_by('expected_age_months'):
        print(f"| {str(m.expected_age_months):<12} | {m.title_en:<25} | {m.title_hi:<20} | {m.title_kn or '---':<20} |")

if __name__ == "__main__":
    run()
