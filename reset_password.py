import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appeal_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'admin'
new_password = 'admin'

try:
    u = User.objects.get(username=username)
    u.set_password(new_password)
    u.save()
    print(f"Password for '{username}' has been updated to '{new_password}'.")
except User.DoesNotExist:
    print(f"User '{username}' does not exist. Creating...")
    User.objects.create_superuser(username, 'admin@example.com', new_password)
    print(f"Superuser '{username}' created with password '{new_password}'.")
