from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Technical-administrator view only; the practice uses the Wagtail admin."""

    list_display = ("id", "start", "status", "service")
    list_filter = ("status",)
    raw_id_fields = ("patient", "replaces", "created_by")
