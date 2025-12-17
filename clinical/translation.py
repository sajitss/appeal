from modeltranslation.translator import register, TranslationOptions
from .models import MilestoneTemplate

@register(MilestoneTemplate)
class MilestoneTemplateTranslationOptions(TranslationOptions):
    fields = ('title', 'description',)
