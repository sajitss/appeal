import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from patients.models import Child
from clinical.models import ChildMilestone

def reset_arjun():
    try:
        arjun = Child.objects.get(first_name='Arjun')
        print(f"Found Arjun: {arjun}")
        
        tasks_to_reset = ["Sits with Support", "Walking Well"]
        
        for task_name in tasks_to_reset:
            milestones = ChildMilestone.objects.filter(
                child=arjun, 
                template__title__iexact=task_name
            )
            
            if milestones.exists():
                for m in milestones:
                    m.is_completed = False
                    m.save()
                    print(f"Updated '{task_name}' to PENDING (is_completed=False)")
            else:
                print(f"Warning: Milestone '{task_name}' not found for Arjun")
                
    except Child.DoesNotExist:
        print("Error: Child 'Arjun' not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_arjun()
