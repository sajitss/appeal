from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('HEW', 'Health Extension Worker'),
        ('DOCTOR', 'Doctor'),
        ('ADMIN', 'Administrator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='HEW')
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
