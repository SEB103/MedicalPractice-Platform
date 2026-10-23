from django.contrib import messages
from django.core.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404, redirect
from django.urls import path, reverse
from django.views.decorators.http import require_POST
from wagtail import hooks
from wagtail.admin.ui.tables import Column, TitleColumn
from wagtail.admin.views.generic import CreateView, InspectView
from wagtail.admin.viewsets.model import ModelViewSet

from . import services
from .models import Patient

FORM_FIELDS = ["first_name", "last_name", "birth_date", "email", "phone", "street", "postal_code", "city"]


@hooks.register("register_log_actions")
def register_patient_log_actions(actions):
    actions.register_action("patients.create", "Patient angelegt", "Patient angelegt")
    actions.register_action("patients.approve", "Patient freigegeben", "Patient freigegeben")
    actions.register_action("patients.reject", "Patient abgelehnt", "Patient abgelehnt")
    actions.register_action("patients.block", "Patient gesperrt", "Patient gesperrt")
    actions.register_action(
        "patients.link", "Konto mit Patient verbunden", "Konto mit Patient verbunden"
    )


def record_url(patient: Patient) -> str:
    return reverse("patients:inspect", args=[patient.pk])


def match_label(patient: Patient) -> str:
    if patient.source == Patient.Source.WEBSITE and patient.status == Patient.Status.PENDING:
        if services.possible_matches(patient).exists():
            return "Mögliche Übereinstimmung"
    return ""


class PatientCreateView(CreateView):
    """Patients entered by the practice are approved immediately and need no website account."""

    def save_instance(self):
        return services.create_by_staff(by=self.request.user, **self.form.cleaned_data)


class PatientRecordView(InspectView):
    template_name = "patients/admin/record.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        patient = self.object
        pending_registration = (
            patient.source == Patient.Source.WEBSITE and patient.status == Patient.Status.PENDING
        )
        user = self.request.user
        context.update(
            matches=services.possible_matches(patient).filter(user__isnull=True, status="approved")
            if pending_registration
            else [],
            appointments=patient.appointments.select_related("service").order_by("-start"),
            can_approve=user.has_perm("patients.approve_patient"),
            can_block=user.has_perm("patients.block_patient"),
            pending_registration=pending_registration,
            linkable_fields=[(f, Patient._meta.get_field(f).verbose_name) for f in sorted(services.LINKABLE_FIELDS)],
        )
        return context


class PatientViewSet(ModelViewSet):
    model = Patient
    name = "patients"
    icon = "user"
    menu_label = "Patienten"
    menu_order = 110
    add_to_admin_menu = True
    form_fields = FORM_FIELDS
    add_view_class = PatientCreateView
    inspect_view_enabled = True
    inspect_view_class = PatientRecordView
    inspect_view_fields = FORM_FIELDS + ["status", "source", "created_at", "approved_at", "account_linked_at"]
    copy_view_enabled = False
    search_fields = ["last_name", "first_name", "email"]
    list_filter = ["status", "source"]
    list_display = [
        TitleColumn("last_name", label="Nachname", get_url=record_url),
        "first_name",
        "birth_date",
        Column("status", label="Status", accessor="get_status_display"),
        Column("source", label="Herkunft", accessor="get_source_display"),
        Column("match", label="Hinweis", accessor=match_label),
    ]


patient_viewset = PatientViewSet()


@hooks.register("register_admin_viewset")
def register_patient_viewset():
    return patient_viewset


ACTIONS = {
    "approve": ("patients.approve_patient", services.approve, "Patient freigegeben."),
    "reject": ("patients.approve_patient", services.reject, "Registrierung abgelehnt."),
    "block": ("patients.block_patient", services.block, "Patient gesperrt."),
}


@require_POST
def patient_action(request, pk, action):
    if action not in ACTIONS:
        raise PermissionDenied
    permission, func, message = ACTIONS[action]
    if not request.user.has_perm(permission):
        raise PermissionDenied
    patient = get_object_or_404(Patient, pk=pk)
    func(patient, by=request.user)
    messages.success(request, message)
    return redirect(record_url(patient))


@require_POST
def patient_link(request, pk):
    if not request.user.has_perm("patients.approve_patient"):
        raise PermissionDenied
    registration = get_object_or_404(Patient, pk=pk)
    target = get_object_or_404(Patient, pk=request.POST.get("target"))
    try:
        target = services.link_registration(
            registration, target, by=request.user, copy_fields=request.POST.getlist("copy_fields")
        )
    except ValidationError as error:
        messages.error(request, " ".join(error.messages))
        return redirect(record_url(registration))
    messages.success(request, "Konto mit der bestehenden Patientenakte verbunden.")
    return redirect(record_url(target))


@hooks.register("register_admin_urls")
def register_patient_action_urls():
    return [
        path("patients/<int:pk>/link/", patient_link, name="patients_link"),
        path("patients/<int:pk>/<str:action>/", patient_action, name="patients_action"),
    ]
