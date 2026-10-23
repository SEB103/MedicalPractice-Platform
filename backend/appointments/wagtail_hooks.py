from datetime import timedelta

import django_filters
from django import forms
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404, redirect
from django.urls import path, reverse
from django.utils import timezone
from django.views.decorators.http import require_POST
from wagtail import hooks
from wagtail.admin.filters import DateRangePickerWidget, WagtailFilterSet
from wagtail.admin.forms import WagtailAdminModelForm
from wagtail.admin.menu import MenuItem
from wagtail.admin.ui.components import Component
from wagtail.admin.ui.tables import Column, TitleColumn
from wagtail.admin.views.generic import CreateView, EditView, InspectView
from wagtail.admin.viewsets.model import ModelViewSet
from wagtail.admin.widgets import AdminDateTimeInput

from patients.models import Patient
from practice.admin_ui import StatusBadgeColumn

from . import services
from .models import ACTIVE_STATUSES, Appointment

ACTIONS_LOG = {
    "request": "Termin angefragt",
    "cancel": "Termin abgesagt",
    "confirm": "Termin bestätigt",
    "decline": "Termin abgelehnt",
    "no_show": "Nicht erschienen",
    "book": "Termin durch die Praxis eingetragen",
    "block": "Zeit blockiert",
    "reschedule": "Termin verschoben",
}


@hooks.register("register_log_actions")
def register_appointment_log_actions(actions):
    for key, label in ACTIONS_LOG.items():
        actions.register_action(f"appointments.{key}", label, label)


def detail_url(appointment: Appointment) -> str:
    return reverse("appointments:inspect", args=[appointment.pk])


def patient_name(appointment: Appointment) -> str:
    patient = appointment.patient
    return f"{patient.last_name}, {patient.first_name}" if patient else "— (Zeit blockiert)"


class AppointmentFilterSet(WagtailFilterSet):
    status = django_filters.ChoiceFilter(choices=Appointment.Status.choices, label="Status")
    start = django_filters.DateFromToRangeFilter(
        field_name="start__date", label="Datum", widget=DateRangePickerWidget
    )

    class Meta:
        model = Appointment
        fields = ["status"]


class StaffBookingForm(WagtailAdminModelForm):
    """Booking by the practice (e.g. by phone) or, without patient, blocking a time span."""

    class Meta:
        model = Appointment
        fields = ["patient", "service", "start", "end"]
        widgets = {"start": AdminDateTimeInput, "end": AdminDateTimeInput}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["patient"].queryset = Patient.objects.filter(status=Patient.Status.APPROVED)
        self.fields["patient"].required = False
        self.fields["patient"].help_text = "Leer lassen, um nur eine Zeit zu blockieren."
        self.fields["service"].required = False
        self.fields["end"].required = False
        self.fields["end"].help_text = "Nur für Blockierungen; Termine enden automatisch nach der Dauer der Terminart."

    def clean(self):
        data = super().clean()
        if data.get("patient") and not data.get("service"):
            self.add_error("service", "Bitte eine Terminart wählen.")
        if not data.get("patient") and not data.get("end"):
            self.add_error("end", "Für eine Blockierung bitte das Ende angeben.")
        return data


class DeclineReasonForm(WagtailAdminModelForm):
    class Meta:
        model = Appointment
        fields = ["decline_reason"]


class AppointmentTitleMixin:
    def get_page_subtitle(self):
        start = timezone.localtime(self.object.start)
        return f"{start:%d.%m.%Y %H:%M} · {patient_name(self.object)}"


class AppointmentEditView(AppointmentTitleMixin, EditView):
    pass


class AppointmentCreateView(CreateView):
    def save_instance(self):
        data = self.form.cleaned_data
        if data.get("patient"):
            return services.book_by_staff(data["patient"], data["service"], data["start"], by=self.request.user)
        return services.block_time(data["start"], data["end"], by=self.request.user)

    def form_valid(self, form):
        try:
            return super().form_valid(form)
        except services.BookingError as error:
            form.add_error(None, str(error))
            self.produced_error_message = str(error)
            return self.form_invalid(form)


class AppointmentDetailView(AppointmentTitleMixin, InspectView):
    template_name = "appointments/admin/detail.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["can_change"] = self.request.user.has_perm("appointments.change_appointment")
        context["patient_label"] = patient_name(self.object)
        return context


class AppointmentViewSet(ModelViewSet):
    model = Appointment
    name = "appointments"
    icon = "date"
    menu_label = "Termine"
    menu_order = 100
    add_to_admin_menu = True
    add_view_class = AppointmentCreateView
    edit_view_class = AppointmentEditView
    inspect_view_enabled = True
    inspect_view_class = AppointmentDetailView
    inspect_view_fields = ["start", "end", "service", "status", "decline_reason", "created_at"]
    copy_view_enabled = False
    filterset_class = AppointmentFilterSet
    list_display = [
        TitleColumn("start", label="Beginn", get_url=detail_url),
        Column("patient", label="Patient", accessor=patient_name),
        Column("service", label="Terminart"),
        StatusBadgeColumn("status", label="Status", accessor="display_label"),
    ]

    def get_form_class(self, for_update=False):
        return DeclineReasonForm if for_update else StaffBookingForm


appointment_viewset = AppointmentViewSet()


@hooks.register("register_admin_viewset")
def register_appointment_viewset():
    return appointment_viewset


class RequestsMenuItem(MenuItem):
    def is_shown(self, request):
        return request.user.has_perm("appointments.change_appointment")


@hooks.register("register_admin_menu_item")
def register_requests_menu_item():
    return RequestsMenuItem(
        "Terminanfragen",
        reverse("appointments:index") + "?status=requested",
        icon_name="mail",
        order=99,
    )


@require_POST
def appointment_action(request, pk, action):
    if not request.user.has_perm("appointments.change_appointment"):
        raise PermissionDenied
    appointment = get_object_or_404(Appointment, pk=pk)
    by = request.user
    try:
        if action == "confirm":
            services.confirm(appointment, by=by)
        elif action == "decline":
            services.decline(appointment, by=by, reason=request.POST.get("reason", ""))
        elif action == "cancel":
            services.cancel_by_practice(appointment, by=by)
        elif action == "no_show":
            services.mark_no_show(appointment, by=by)
        elif action == "reschedule":
            start = forms.DateTimeField().clean(request.POST.get("start"))
            appointment = services.reschedule_by_staff(appointment, start, by=by)
        else:
            raise PermissionDenied
    except (services.BookingError, forms.ValidationError) as error:
        messages.error(request, " ".join(getattr(error, "messages", [str(error)])))
        return redirect(detail_url(appointment))
    messages.success(request, "Termin aktualisiert.")
    return redirect(detail_url(appointment))


@hooks.register("register_admin_urls")
def register_appointment_action_urls():
    return [path("appointments/<int:pk>/action/<str:action>/", appointment_action, name="appointments_action")]


class TodayPanel(Component):
    """Dashboard: today's and the next days' appointments plus open work."""

    name = "practice_today"
    order = 10
    template_name = "appointments/admin/today_panel.html"

    def get_context_data(self, parent_context):
        today = timezone.localdate()
        index = reverse("appointments:index")
        upcoming = (
            Appointment.objects.filter(
                status__in=ACTIVE_STATUSES,
                start__date__gte=today,
                start__date__lte=today + timedelta(days=7),
            )
            .select_related("patient", "service")
            .order_by("start")
        )
        return {
            "today": today,
            "upcoming": upcoming,
            "open_requests": Appointment.objects.filter(
                status=Appointment.Status.REQUESTED, start__gt=timezone.now()
            ).count(),
            "pending_patients": Patient.objects.filter(status=Patient.Status.PENDING).count(),
            "requests_url": index + "?status=requested",
            "patients_url": reverse("patients:index") + "?status=pending",
        }


@hooks.register("construct_homepage_panels")
def add_today_panel(request, panels):
    if request.user.has_perm("appointments.view_appointment"):
        panels.insert(0, TodayPanel())
