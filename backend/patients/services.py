"""Patient lifecycle: website registration, staff creation, approval and manual linking."""

from collections.abc import Iterable
from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q, QuerySet
from django.utils import timezone
from wagtail.log_actions import log

from .models import Patient

LINKABLE_FIELDS = {"email", "phone", "street", "postal_code", "city"}


def _log(patient: Patient, action: str, by) -> None:
    log(instance=patient, action=f"patients.{action}", user=by, title=f"Patient #{patient.pk}")


@transaction.atomic
def register_from_website(
    *,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    birth_date: date,
    phone: str = "",
    street: str = "",
    postal_code: str = "",
    city: str = "",
) -> Patient | None:
    """Create a pending website patient; ``None`` (and no change) if the e-mail is taken."""
    User = get_user_model()
    if User.objects.filter(email__iexact=email.strip()).exists():
        return None
    user = User.objects.create_user(email=email, password=password)
    return Patient.objects.create(
        user=user,
        email=user.email,
        first_name=first_name,
        last_name=last_name,
        birth_date=birth_date,
        phone=phone,
        street=street,
        postal_code=postal_code,
        city=city,
        status=Patient.Status.PENDING,
        source=Patient.Source.WEBSITE,
    )


@transaction.atomic
def create_by_staff(*, by, first_name: str, last_name: str, birth_date: date, **contact) -> Patient:
    unknown = set(contact) - LINKABLE_FIELDS
    if unknown:
        raise ValidationError(f"Unknown fields: {sorted(unknown)}")
    patient = Patient.objects.create(
        first_name=first_name,
        last_name=last_name,
        birth_date=birth_date,
        status=Patient.Status.APPROVED,
        source=Patient.Source.PRACTICE,
        created_by=by,
        approved_by=by,
        approved_at=timezone.now(),
        **contact,
    )
    _log(patient, "create", by)
    return patient


@transaction.atomic
def approve(patient: Patient, *, by) -> Patient:
    patient.status = Patient.Status.APPROVED
    patient.approved_by = by
    patient.approved_at = timezone.now()
    patient.save(update_fields=["status", "approved_by", "approved_at"])
    _log(patient, "approve", by)
    return patient


@transaction.atomic
def reject(patient: Patient, *, by) -> Patient:
    patient.status = Patient.Status.REJECTED
    patient.save(update_fields=["status"])
    _log(patient, "reject", by)
    return patient


@transaction.atomic
def block(patient: Patient, *, by) -> Patient:
    patient.status = Patient.Status.BLOCKED
    patient.save(update_fields=["status"])
    if patient.user_id:
        patient.user.is_active = False
        patient.user.save(update_fields=["is_active"])
    _log(patient, "block", by)
    return patient


def possible_matches(patient: Patient) -> QuerySet[Patient]:
    """Existing patients that may be the same person (same surname + birth date, or same e-mail)."""
    condition = Q(last_name__iexact=patient.last_name, birth_date=patient.birth_date)
    if patient.email:
        condition |= Q(email__iexact=patient.email)
    return Patient.objects.filter(condition).exclude(pk=patient.pk)


@transaction.atomic
def link_registration(
    registration: Patient, target: Patient, *, by, copy_fields: Iterable[str] = ()
) -> Patient:
    """Attach a pending website registration's account to an existing patient record.

    The target record stays authoritative; only the explicitly chosen contact fields are copied.
    The registration's own patient row is deleted afterwards.
    """
    copy_fields = set(copy_fields)
    if copy_fields - LINKABLE_FIELDS:
        raise ValidationError("Only contact fields can be copied.")
    if (
        registration.source != Patient.Source.WEBSITE
        or registration.status != Patient.Status.PENDING
        or registration.user_id is None
    ):
        raise ValidationError("Only pending website registrations can be linked.")
    if target.pk == registration.pk or target.user_id is not None:
        raise ValidationError("The target patient already has a website account.")
    if target.status != Patient.Status.APPROVED:
        raise ValidationError("Only approved patients can be linked.")

    user = registration.user
    for field in copy_fields:
        setattr(target, field, getattr(registration, field))
    registration.delete()
    target.user = user
    target.account_linked_at = timezone.now()
    target.save()
    _log(target, "link", by)
    return target
