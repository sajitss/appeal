from django.db import models
from django.conf import settings
from patients.models import Child
import uuid

class Encounter(models.Model):
    ENCOUNTER_TYPE_CHOICES = (
        ('HOME_VISIT', 'Home Visit'),
        ('CLINIC', 'Clinic'),
        ('TELECONSULT', 'Teleconsult'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='encounters')
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    encounter_type = models.CharField(max_length=20, choices=ENCOUNTER_TYPE_CHOICES, default='HOME_VISIT')
    encounter_date = models.DateTimeField(auto_now_add=True)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Encounter: {self.child} on {self.encounter_date.date()}"

class ScreeningResult(models.Model):
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='screenings')
    milestone_category = models.CharField(max_length=50)  # e.g., 'Communication', 'Gross Motor'
    question_id = models.CharField(max_length=50) # Reference to quesionnaire
    response = models.CharField(max_length=50) # e.g., 'Yes', 'No', 'Sometimes'
    is_flagged = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.milestone_category}: {self.response}"

class MilestoneTemplate(models.Model):
    """Refers to a standard developmental milestone (e.g. 'Walks alone' at 12 months)"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    expected_age_months = models.IntegerField(help_text="Age in months when this milestone becomes active")
    
    def __str__(self):
        return f"{self.title} ({self.expected_age_months}m)"

class ChildMilestone(models.Model):
    """Tracks a specific child's progress on a milestone"""
    child = models.ForeignKey('patients.Child', on_delete=models.CASCADE, related_name='milestones')
    template = models.ForeignKey(MilestoneTemplate, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateField(null=True, blank=True)
    evidence = models.FileField(upload_to='milestone_evidence/', null=True, blank=True)
    
    class Meta:
        unique_together = ('child', 'template')

    def __str__(self):
        status = "DONE" if self.is_completed else "PENDING"
        return f"{self.child.first_name} - {self.template.title}: {status}"
