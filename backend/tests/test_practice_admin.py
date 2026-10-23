"""Wagtail practice admin: role access and key actions. All people are fictional."""

from datetime import date, time, timedelta

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from django.utils import timezone

from accounts.roles import EMPFANG, PRAXISLEITUNG
from appointments import services as booking
from appointments.availability import local_dt
from appointments.models import Appointment
from patients import services as patients
from patients.models import Patient
from practice.models import Service, WeeklyWindow

pytestmark = pytest.mark.django_db
BIRTH = date(1980, 5, 17)


def staff(role, email):
    user = get_user_model().objects.create_user(email, "Demo-Passwort-2026!")
    user.groups.add(Group.objects.get(name=role))
    return user


@pytest.fixture
def doctor(client):
    return staff(PRAXISLEITUNG, "dr.linden@example.invalid")


@pytest.fixture
def reception():
    return staff(EMPFANG, "empfang@example.invalid")


@pytest.fixture
def service():
    for weekday in range(5):
        WeeklyWindow.objects.create(weekday=weekday, start=time(9), end=time(12))
    return Service.objects.create(title="Beratung", duration_minutes=30)


@pytest.fixture
def day():
    candidate = timezone.localdate() + timedelta(days=3)
    return candidate + timedelta(days=(7 - candidate.weekday()) % 7)


def registration(email="max@example.invalid"):
    return patients.register_from_website(
        email=email, password="Demo-Passwort-2026!", first_name="Max",
        last_name="Mustermann", birth_date=BIRTH,
    )


def test_reception_sees_patients_and_appointments_but_not_settings(client, reception):
    client.force_login(reception)
    assert client.get(reverse("patients:index")).status_code == 200
    assert client.get(reverse("appointments:index")).status_code == 200
    assert client.get(reverse("wagtailadmin_home")).status_code == 200
    assert client.get(reverse("service:index")).status_code != 200


def test_doctor_manages_settings_and_cannot_create_superusers(client, doctor):
    client.force_login(doctor)
    assert client.get(reverse("service:index")).status_code == 200
    response = client.get(reverse("wagtailusers_users:add"))
    assert response.status_code == 200
    assert "is_superuser" not in response.context["form"].fields
    tech = get_user_model().objects.create_superuser("tech@example.invalid", "x")
    assert client.get(reverse("wagtailusers_users:edit", args=[tech.pk])).status_code != 200


def test_staff_creates_patient_without_account(client, reception):
    client.force_login(reception)
    response = client.post(reverse("patients:add"), {
        "first_name": "Erika", "last_name": "Musterfrau", "birth_date": "1975-01-02",
    })
    assert response.status_code == 302
    patient = Patient.objects.get(last_name="Musterfrau")
    assert patient.status == "approved" and patient.source == "practice" and patient.user is None


def test_reception_approves_but_cannot_block(client, reception):
    patient = registration()
    client.force_login(reception)
    client.post(reverse("patients_action", args=[patient.pk, "approve"]))
    patient.refresh_from_db()
    assert patient.status == "approved"
    response = client.post(reverse("patients_action", args=[patient.pk, "block"]))
    patient.refresh_from_db()
    # Wagtail answers PermissionDenied with a redirect to the dashboard.
    assert response.status_code in (302, 403) and patient.status == "approved"


def test_record_shows_match_and_links_account(client, doctor):
    target = patients.create_by_staff(by=doctor, first_name="Max", last_name="Mustermann",
                                      birth_date=BIRTH)
    reg = registration()
    client.force_login(doctor)
    record = client.get(reverse("patients:inspect", args=[reg.pk]))
    assert "Mögliche Übereinstimmung" in record.content.decode()
    client.post(reverse("patients_link", args=[reg.pk]), {"target": target.pk})
    target.refresh_from_db()
    assert target.user is not None and not Patient.objects.filter(pk=reg.pk).exists()


def test_staff_booking_form_confirms_and_rejects_overlap(client, reception, service, day):
    patient = patients.create_by_staff(by=reception, first_name="Max", last_name="Mustermann",
                                       birth_date=BIRTH)
    client.force_login(reception)
    data = {"patient": patient.pk, "service": service.pk, "start": local_dt(day, time(9)).strftime("%Y-%m-%d %H:%M")}
    assert client.post(reverse("appointments:add"), data).status_code == 302
    assert Appointment.objects.get().status == "confirmed"
    again = client.post(reverse("appointments:add"), data)
    assert again.status_code == 200 and Appointment.objects.count() == 1


def test_confirm_request_from_detail_and_dashboard(client, reception, service, day):
    patient = patients.approve(registration(), by=reception)
    appointment = booking.request_appointment(patient, service, local_dt(day, time(10)))
    client.force_login(reception)
    assert "Terminanfragen: 1" in client.get(reverse("wagtailadmin_home")).content.decode()
    client.post(reverse("appointments_action", args=[appointment.pk, "confirm"]))
    appointment.refresh_from_db()
    assert appointment.status == "confirmed"
