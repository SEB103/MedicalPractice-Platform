from django.templatetags.static import static
from django.utils.html import format_html
from wagtail import hooks
from wagtail.admin.viewsets.model import ModelViewSet, ModelViewSetGroup

from .models import Closure, Service, SpecialHours, WeeklyWindow


class ServiceViewSet(ModelViewSet):
    model = Service
    icon = "list-ul"
    menu_label = "Terminarten"
    form_fields = [
        "title",
        "description",
        "icon",
        "duration_minutes",
        "is_active",
        "sort_order",
        "introduction",
        "sections",
        "preparation",
    ]
    list_display = ["title", "duration_minutes", "is_active"]
    copy_view_enabled = False


class WeeklyWindowViewSet(ModelViewSet):
    model = WeeklyWindow
    icon = "time"
    menu_label = "Sprechzeiten"
    form_fields = ["weekday", "start", "end"]
    list_display = ["__str__"]


class ClosureViewSet(ModelViewSet):
    model = Closure
    icon = "warning"
    menu_label = "Schließzeiten & Urlaub"
    form_fields = ["start_date", "end_date", "reason"]
    list_display = ["start_date", "end_date", "reason"]


class SpecialHoursViewSet(ModelViewSet):
    model = SpecialHours
    icon = "calendar-alt"
    menu_label = "Abweichende Sprechzeiten"
    form_fields = ["date", "start", "end"]
    list_display = ["date", "start", "end"]


class PracticeSettingsGroup(ModelViewSetGroup):
    menu_label = "Praxis-Einstellungen"
    menu_icon = "cog"
    menu_order = 120
    items = (ServiceViewSet, WeeklyWindowViewSet, ClosureViewSet, SpecialHoursViewSet)


@hooks.register("register_admin_viewset")
def register_practice_settings():
    return PracticeSettingsGroup()


@hooks.register("insert_global_admin_css")
def status_badge_css():
    return format_html('<link rel="stylesheet" href="{}">', static("practice/admin-status.css"))
