from django.contrib.auth.management import create_permissions
from django.db import migrations

_COMMON = [
    ("wagtailadmin", "access_admin"),
    ("patients", "view_patient"),
    ("patients", "add_patient"),
    ("patients", "change_patient"),
    ("patients", "approve_patient"),
]
# Frozen copy of the roles at this migration; later changes go into new migrations.
ROLE_PERMISSIONS = {
    "Empfang": _COMMON,
    "Praxisleitung": _COMMON
    + [
        ("patients", "block_patient"),
        ("accounts", "view_user"),
        ("accounts", "add_user"),
        ("accounts", "change_user"),
    ],
}


def create_roles(apps, schema_editor):
    # Model permissions are normally created after migrate; create them now so groups can use them.
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
        ("patients", "0001_initial"),
        ("accounts", "0001_initial"),
        ("wagtailadmin", "0001_create_admin_access_permissions"),
    ]

    operations = [migrations.RunPython(create_roles, migrations.RunPython.noop)]
