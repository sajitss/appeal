from django.contrib import admin
from .models import Encounter, ScreeningResult

class ScreeningInline(admin.TabularInline):
    model = ScreeningResult
    extra = 0

@admin.register(Encounter)
class EncounterAdmin(admin.ModelAdmin):
    list_display = ('child', 'performed_by', 'encounter_date', 'location_lat')
    inlines = [ScreeningInline]
