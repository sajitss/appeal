from django.db import models
import uuid

class Caregiver(models.Model):
    RELATIONSHIP_CHOICES = (
        ('MOTHER', 'Mother'),
        ('FATHER', 'Father'),
        ('GUARDIAN', 'Guardian'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True)
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, default='GUARDIAN')
    language_preference = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Child(models.Model):
    SEX_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Using 'caregiver' instead of 'guardian' for clarity, though keeping related_name might be safe or we can update it.
    # Let's update the field name to 'caregiver' to match the model rename.
    caregiver = models.ForeignKey(Caregiver, on_delete=models.CASCADE, related_name='children', null=True)
    unique_child_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    sex = models.CharField(max_length=1, choices=SEX_CHOICES)
    
    # New metrics
    birth_weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    birth_height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    gestational_age_weeks = models.IntegerField(null=True, blank=True)
    
    is_at_risk = models.BooleanField(default=False)
    enrollment_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_sex_display()})"
