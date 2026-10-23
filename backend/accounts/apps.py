from django.apps import AppConfig
from wagtail.users.apps import WagtailUsersAppConfig


class AccountsConfig(AppConfig):
    default = True
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"
    verbose_name = "Konten"

    def ready(self):
        from . import schema  # noqa: F401  registers the OpenAPI authentication extension


class PracticeUsersAppConfig(WagtailUsersAppConfig):
    """Replaces ``wagtail.users`` in INSTALLED_APPS to use the restricted user forms."""

    user_viewset = "accounts.wagtail_users.UserViewSet"
