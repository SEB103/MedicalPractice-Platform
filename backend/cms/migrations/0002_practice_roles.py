from django.contrib.auth.management import create_permissions
from django.db import migrations

from accounts.roles import PRAXISLEITUNG, ROLE_PERMISSIONS

IMAGE_PERMISSIONS = ("add_image", "change_image", "choose_image")


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
    # Wagtail image permissions are granted per collection (root = all images).
    Collection = apps.get_model("wagtailcore", "Collection")
    GroupCollectionPermission = apps.get_model("wagtailcore", "GroupCollectionPermission")
    root = Collection.objects.filter(depth=1).first()
    if root is None:
        return
    doctor = Group.objects.get(name=PRAXISLEITUNG)
    for codename in IMAGE_PERMISSIONS:
        GroupCollectionPermission.objects.get_or_create(
            group=doctor,
            collection=root,
            permission=Permission.objects.get(content_type__app_label="wagtailimages", codename=codename),
        )


class Migration(migrations.Migration):
    dependencies = [
        ("cms", "0001_initial"),
        ("appointments", "0002_practice_roles"),
        ("practice", "0002_service_introduction_service_preparation_and_more"),
        ("wagtailimages", "0027_image_description"),
        ("wagtailcore", "0092_alter_collectionviewrestriction_password_and_more"),
    ]

    operations = [migrations.RunPython(sync_roles, migrations.RunPython.noop)]
