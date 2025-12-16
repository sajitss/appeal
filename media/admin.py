from django.contrib import admin
from .models import MediaAsset, AIReport

class AIReportInline(admin.StackedInline):
    model = AIReport

@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'encounter', 'media_type', 'is_processed')
    list_filter = ('media_type', 'is_processed')
    inlines = [AIReportInline]
