from django.contrib.auth.management import create_permissions
from django.db import migrations

_COMMON = [
    ("wagtailadmin", "access_admin"),
    ("patients", "view_patient"),
    ("patients", "add_patient"),
    ("patients", "change_patient"),
    ("patients", "approve_patient"),
    ("appointments", "view_appointment"),
    ("appointments", "add_appointment"),
    ("appointments", "change_appointment"),
]
_SETTINGS = [
    ("practice", f"{action}_{model}")
    for model in ("service", "weeklywindow", "closure", "specialhours")
    for action in ("view", "add", "change", "delete")
] + [("practice", "change_schedulesettings")]
# Frozen copy of the roles at this migration; later changes go into new migrations.
ROLE_PERMISSIONS = {
    "Empfang": _COMMON,
    "Praxisleitung": _COMMON
    + [
        ("patients", "block_patient"),
        ("accounts", "view_user"),
        ("accounts", "add_user"),
        ("accounts", "change_user"),
    ]
    + _SETTINGS,
}


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
