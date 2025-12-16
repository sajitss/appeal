import os
import django
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

print("--- Clinical URL Patterns ---")
resolver = get_resolver()
url_patterns = resolver.url_patterns

def print_urls(patterns, prefix=''):
    for p in patterns:
        if hasattr(p, 'url_patterns'):
            new_prefix = prefix + str(p.pattern)
            print_urls(p.url_patterns, new_prefix)
        else:
            print(f"{prefix}{p.pattern}  -> {p.callback}")

print_urls(url_patterns)
