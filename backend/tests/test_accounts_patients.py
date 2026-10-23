"""Accounts, roles and patient lifecycle. All people and addresses are fictional."""

from datetime import date

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import call_command
from django.db import IntegrityError, transaction
from django.urls import reverse
from wagtail.models import ModelLogEntry

from accounts.roles import EMPFANG, PRAXISLEITUNG
from patients import services
from patients.models import Patient

BIRTH = date(1980, 5, 17)


@pytest.fixture
def owner(db):
    call_command("create_practice_owner", email="dr.linden@example.invalid",
                 first_name="Anna", last_name="Linden")
    return get_user_model().objects.get(email="dr.linden@example.invalid")


def register(email="max@example.invalid", **extra):
    data = dict(email=email, password="Demo-Passwort-2026!", first_name="Max",
                last_name="Mustermann", birth_date=BIRTH)
    data.update(extra)
    return services.register_from_website(**data)


@pytest.mark.django_db
def test_email_is_case_insensitive_unique():
    User = get_user_model()
    user = User.objects.create_user("Max@Example.invalid", "x")
    assert user.email == "max@example.invalid"
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create_user("MAX@example.invalid", "y")


@pytest.mark.django_db
def test_roles_exist_with_expected_permissions():
    def perms(name):
        return set(Group.objects.get(name=name).permissions.values_list("codename", flat=True))

    assert {"access_admin", "approve_patient"} <= perms(EMPFANG)
    assert not {"block_patient", "add_user"} & perms(EMPFANG)
    assert {"access_admin", "approve_patient", "block_patient", "add_user"} <= perms(PRAXISLEITUNG)


@pytest.mark.django_db
def test_wagtail_user_admin_works_with_email_user(client):
    admin = get_user_model().objects.create_superuser("tech@example.invalid", "x")
    client.force_login(admin)
    assert client.get(reverse("wagtailusers_users:index")).status_code == 200
    assert client.get(reverse("wagtailusers_users:add")).status_code == 200


def test_practice_owner_can_open_wagtail_but_not_django_admin(client, owner):
    assert owner.groups.filter(name=PRAXISLEITUNG).exists()
    assert not owner.is_staff and not owner.has_usable_password()
    client.force_login(owner)
    assert client.get("/cms/").status_code == 200
    assert client.get("/django-admin/").status_code == 302


@pytest.mark.django_db
def test_register_creates_pending_website_patient_and_ignores_taken_email():
    patient = register()
    assert patient.status == Patient.Status.PENDING
    assert patient.source == Patient.Source.WEBSITE
    assert patient.user.email == "max@example.invalid"
    assert register(email="MAX@example.invalid") is None
    assert Patient.objects.count() == 1


def test_link_registration_moves_account_and_removes_duplicate(owner):
    target = services.create_by_staff(by=owner, first_name="Max", last_name="Mustermann",
                                      birth_date=BIRTH)
    registration = register(phone="+49 30 23125 000")
    assert list(services.possible_matches(registration)) == [target]

    linked = services.link_registration(registration, target, by=owner, copy_fields=["phone"])

    assert linked.user.email == "max@example.invalid"
    assert linked.account_linked_at is not None
    assert linked.phone == "+49 30 23125 000"
    assert not Patient.objects.filter(pk=registration.pk).exists()


def test_link_rejects_target_with_account(owner):
    first = register()
    services.approve(first, by=owner)
    second = register(email="max.zwei@example.invalid")
    with pytest.raises(Exception):
        services.link_registration(second, first, by=owner)


def test_audit_log_has_no_patient_name(owner):
    patient = register()
    services.approve(patient, by=owner)
    entry = ModelLogEntry.objects.filter(action="patients.approve").latest("timestamp")
    assert entry.label == f"Patient #{patient.pk}"
    assert "Mustermann" not in entry.label


def test_block_deactivates_login(owner):
    patient = register()
    services.block(patient, by=owner)
    patient.user.refresh_from_db()
    assert patient.status == Patient.Status.BLOCKED
    assert not patient.user.is_active
