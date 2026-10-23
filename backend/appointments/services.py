"""Appointment state changes for patients and practice staff."""

from datetime import datetime, timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone
from wagtail.log_actions import log

from patients.models import Patient
from practice.models import ScheduleSettings, Service

from .availability import available_slots
from .models import Appointment

S = Appointment.Status


class BookingError(Exception):
    code = "booking_error"
    message = "Die Aktion ist nicht möglich."

    def __init__(self, message: str | None = None):
        super().__init__(message or self.message)


class SlotUnavailable(BookingError):
    code = "slot_unavailable"
    message = "Der Termin ist nicht mehr verfügbar. Bitte wählen Sie eine andere Uhrzeit."


class TooManyOpenRequests(BookingError):
    code = "too_many_open_requests"
    message = "Sie haben bereits die maximale Anzahl offener Terminanfragen."


class NotChangeable(BookingError):
    code = "not_changeable"
    message = "Dieser Termin kann nicht mehr geändert werden."


class PatientNotApproved(BookingError):
    code = "patient_not_approved"
    message = "Ihre Registrierung wurde von der Praxis noch nicht freigegeben."


def _log(appointment: Appointment, action: str, by) -> None:
    log(instance=appointment, action=f"appointments.{action}", user=by, title=str(appointment))


def _create(**fields) -> Appointment:
    try:
        with transaction.atomic():
            return Appointment.objects.create(**fields)
    except IntegrityError as error:
        raise SlotUnavailable() from error


def _span(service: Service, start: datetime) -> dict:
    end = start + timedelta(minutes=service.duration_minutes)
    buffer = timedelta(minutes=ScheduleSettings.load().buffer_minutes)
    return {"start": start, "end": end, "occupied_until": end + buffer}


def patient_can_change(appointment: Appointment) -> bool:
    """Patients may cancel or move active appointments until the day before."""
    return appointment.status in (S.REQUESTED, S.CONFIRMED) and (
        timezone.localdate(appointment.start) > timezone.localdate()
    )


@transaction.atomic
def request_appointment(
    patient: Patient, service: Service, start: datetime, *, replaces: Appointment | None = None
) -> Appointment:
    if patient.status != Patient.Status.APPROVED:
        raise PatientNotApproved()
    if replaces is not None:
        replaces = Appointment.objects.select_for_update().get(pk=replaces.pk)
        if replaces.patient_id != patient.pk or not patient_can_change(replaces):
            raise NotChangeable()
    if not service.is_active or start not in available_slots(
        service, timezone.localdate(start), exclude=replaces
    ):
        raise SlotUnavailable()
    open_requests = Appointment.objects.filter(
        patient=patient, status=S.REQUESTED, start__gt=timezone.now()
    )
    if replaces is not None:
        open_requests = open_requests.exclude(pk=replaces.pk)
    if open_requests.count() >= ScheduleSettings.load().max_open_requests:
        raise TooManyOpenRequests()
    if replaces is not None:
        replaces.status = S.CANCELLED
        replaces.save(update_fields=["status", "updated_at"])
    appointment = _create(
        patient=patient,
        service=service,
        status=S.REQUESTED,
        replaces=replaces,
        created_by=patient.user,
        **_span(service, start),
    )
    _log(appointment, "request", patient.user)
    return appointment


@transaction.atomic
def cancel_by_patient(appointment: Appointment, patient: Patient) -> Appointment:
    if appointment.patient_id != patient.pk or not patient_can_change(appointment):
        raise NotChangeable()
    appointment.status = S.CANCELLED
    appointment.save(update_fields=["status", "updated_at"])
    _log(appointment, "cancel", patient.user)
    return appointment


def _set_status(appointment: Appointment, status: str, by, action: str, *, allowed, **extra):
    if appointment.status not in allowed:
        raise NotChangeable()
    appointment.status = status
    for field, value in extra.items():
        setattr(appointment, field, value)
    appointment.save(update_fields=["status", "updated_at", *extra])
    _log(appointment, action, by)
    return appointment


def confirm(appointment: Appointment, *, by) -> Appointment:
    return _set_status(appointment, S.CONFIRMED, by, "confirm", allowed=(S.REQUESTED,))


def decline(appointment: Appointment, *, by, reason: str = "") -> Appointment:
    return _set_status(
        appointment, S.DECLINED, by, "decline", allowed=(S.REQUESTED,), decline_reason=reason[:200]
    )


def cancel_by_practice(appointment: Appointment, *, by) -> Appointment:
    return _set_status(
        appointment, S.CANCELLED, by, "cancel", allowed=(S.REQUESTED, S.CONFIRMED, S.BLOCKED)
    )


def mark_no_show(appointment: Appointment, *, by) -> Appointment:
    if appointment.start > timezone.now():
        raise NotChangeable()
    return _set_status(appointment, S.NO_SHOW, by, "no_show", allowed=(S.CONFIRMED,))


@transaction.atomic
def book_by_staff(patient: Patient, service: Service, start: datetime, *, by) -> Appointment:
    """Staff bookings (e.g. by phone) are confirmed directly and may use any free time."""
    appointment = _create(
        patient=patient, service=service, status=S.CONFIRMED, created_by=by, **_span(service, start)
    )
    _log(appointment, "book", by)
    return appointment


@transaction.atomic
def block_time(start: datetime, end: datetime, *, by) -> Appointment:
    if end <= start:
        raise NotChangeable("Das Ende muss nach dem Beginn liegen.")
    appointment = _create(status=S.BLOCKED, start=start, end=end, occupied_until=end, created_by=by)
    _log(appointment, "block", by)
    return appointment


@transaction.atomic
def reschedule_by_staff(appointment: Appointment, start: datetime, *, by) -> Appointment:
    if appointment.status not in (S.REQUESTED, S.CONFIRMED) or appointment.service is None:
        raise NotChangeable()
    appointment.status = S.CANCELLED
    appointment.save(update_fields=["status", "updated_at"])
    new = _create(
        patient=appointment.patient,
        service=appointment.service,
        status=S.CONFIRMED,
        replaces=appointment,
        created_by=by,
        **_span(appointment.service, start),
    )
    _log(new, "reschedule", by)
    return new
