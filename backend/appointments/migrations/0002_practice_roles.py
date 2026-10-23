from django.contrib.auth.management import create_permissions
from django.db import migrations

from accounts.roles import ROLE_PERMISSIONS


def sync_roles(apps, schema_editor):
    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, apps=apps, verbosity=0)
        app_config.models_module = None
    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    for name, perms in ROLE_PERMISSIONS.items():
        group, _ = Group.objects.get_or_create(name=name)
        for app_label, codename in perms:
            group.permissions.add(
                Permission.objects.get(content_type__app_label=app_label, codename=codename)
            )


class Migration(migrations.Migration):
    dependencies = [
        ("appointments", "0001_initial"),
        ("practice", "0001_initial"),
        ("patients", "0002_practice_roles"),
    ]

    operations = [migrations.RunPython(sync_roles, migrations.RunPython.noop)]
