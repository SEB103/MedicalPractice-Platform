from django.contrib import admin

from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    """Technical-administrator view only; the practice uses the Wagtail admin."""

    list_display = ("id", "status", "source", "created_at")
    list_filter = ("status", "source")
    search_fields = ("last_name", "email")
    raw_id_fields = ("user", "created_by", "approved_by")
