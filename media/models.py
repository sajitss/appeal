from django.db import models
from clinical.models import Encounter
import uuid

class MediaAsset(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='media_assets')
    file = models.FileField(upload_to='developmental_videos/%Y/%m/%d/')
    media_type = models.CharField(max_length=10, choices=[('VIDEO', 'Video'), ('IMAGE', 'Image')])
    file_size = models.BigIntegerField(null=True, blank=True)
    checksum = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.media_type} for {self.encounter}"

class AIReport(models.Model):
    media_asset = models.OneToOneField(MediaAsset, on_delete=models.CASCADE, related_name='ai_report')
    result_json = models.JSONField(default=dict)
    confidence_score = models.FloatField(default=0.0)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Report for {self.media_asset}"
