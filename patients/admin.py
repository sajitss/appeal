from django.contrib import admin
from .models import Caregiver, Child

@admin.register(Caregiver)
class CaregiverAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'phone_number', 'created_at')
    search_fields = ('first_name', 'last_name', 'phone_number')

@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'sex', 'date_of_birth', 'is_at_risk')
    list_filter = ('sex', 'is_at_risk')
    search_fields = ('first_name', 'last_name')
