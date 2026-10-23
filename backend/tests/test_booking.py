"""Schedule, availability and booking. All people are fictional."""

from datetime import UTC, date, time, timedelta

import pytest
from django.db import IntegrityError, transaction
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from appointments import services as booking
from appointments.availability import available_slots, local_dt
from appointments.models import Appointment
from patients import services as patients
from practice.models import Closure, Service, WeeklyWindow

pytestmark = pytest.mark.django_db


@pytest.fixture
def service():
    for weekday in range(5):
        WeeklyWindow.objects.create(weekday=weekday, start=time(9), end=time(12))
    return Service.objects.create(title="Beratung", duration_minutes=30)


@pytest.fixture
def day():
    """A Monday at least three days ahead (patients may change until the day before)."""
    candidate = timezone.localdate() + timedelta(days=3)
    return candidate + timedelta(days=(7 - candidate.weekday()) % 7)


def approved_patient(email="max@example.invalid"):
    patient = patients.register_from_website(
        email=email, password="Demo-Passwort-2026!", first_name="Max",
        last_name="Mustermann", birth_date=date(1980, 5, 17),
    )
    return patients.approve(patient, by=None)


def client_for(patient):
    client = APIClient()
    client.force_authenticate(patient.user)
    return client


def book(client, service, start):
    return client.post(reverse("api-appointments"), {"service": service.pk, "start": start.isoformat()},
                       format="json")


def test_slot_grid_respects_duration_and_buffer(service, day):
    booking.book_by_staff(approved_patient(), service, local_dt(day, time(9)), by=None)
    slots = [s.strftime("%H:%M") for s in available_slots(service, day)]
    assert slots[0] == "09:45"  # 09:00 + 30 min + 10 min pause, next 15-min step
    assert slots[-1] == "11:30"


def test_closure_today_and_horizon_have_no_slots(service, day):
    today = timezone.localdate()
    assert available_slots(service, today) == []
    assert available_slots(service, today + timedelta(days=200)) == []
    Closure.objects.create(start_date=day, end_date=day, reason="Praxisurlaub")
    assert available_slots(service, day) == []


def test_slots_use_berlin_offset_in_winter_and_summer(service):
    winter = available_slots(service, date(2026, 11, 2), today=date(2026, 10, 30))
    summer = available_slots(service, date(2027, 6, 7), today=date(2027, 6, 1))
    assert winter[0].utcoffset() == timedelta(hours=1)
    assert summer[0].utcoffset() == timedelta(hours=2)
    assert winter[0].astimezone(UTC).hour == 8


def test_pending_patient_cannot_book(service, day):
    pending = patients.register_from_website(
        email="neu@example.invalid", password="Demo-Passwort-2026!", first_name="Erika",
        last_name="Musterfrau", birth_date=date(1975, 1, 2),
    )
    response = book(client_for(pending), service, local_dt(day, time(9)))
    assert response.status_code == 403
    assert response.json()["code"] == "patient_not_approved"


def test_double_booking_is_rejected(service, day):
    start = local_dt(day, time(9))
    first = book(client_for(approved_patient()), service, start)
    second = book(client_for(approved_patient("erika@example.invalid")), service, start)
    assert first.status_code == 201 and first.json()["status"] == "requested"
    assert second.status_code == 409 and second.json()["code"] == "slot_unavailable"


def test_database_constraint_prevents_overlap(service, day):
    start = local_dt(day, time(9))
    fields = dict(service=service, status="confirmed", start=start,
                  end=start + timedelta(minutes=30), occupied_until=start + timedelta(minutes=40))
    Appointment.objects.create(**fields)
    with pytest.raises(IntegrityError), transaction.atomic():
        Appointment.objects.create(**{**fields, "start": start + timedelta(minutes=15)})


def test_open_request_limit(service, day):
    client = client_for(approved_patient())
    for hour in (9, 10, 11):
        assert book(client, service, local_dt(day, time(hour))).status_code == 201
    response = book(client, service, local_dt(day + timedelta(days=1), time(9)))
    assert response.status_code == 409
    assert response.json()["code"] == "too_many_open_requests"


def test_cancel_own_frees_slot_and_foreign_is_hidden(service, day):
    start = local_dt(day, time(9))
    owner = approved_patient()
    created = book(client_for(owner), service, start).json()
    stranger = client_for(approved_patient("erika@example.invalid"))
    url = reverse("api-appointment-cancel", args=[created["id"]])
    assert stranger.post(url).status_code == 404
    response = client_for(owner).post(url)
    assert response.status_code == 200 and response.json()["status"] == "cancelled"
    assert start in available_slots(service, day)


def test_reschedule_keeps_original_on_conflict(service, day):
    patient = approved_patient()
    client = client_for(patient)
    original = book(client, service, local_dt(day, time(9))).json()
    booking.book_by_staff(approved_patient("erika@example.invalid"), service,
                          local_dt(day, time(10)), by=None)
    url = reverse("api-appointment-reschedule", args=[original["id"]])

    conflict = client.post(url, {"start": local_dt(day, time(10)).isoformat()}, format="json")
    assert conflict.status_code == 409
    assert Appointment.objects.get(pk=original["id"]).status == "requested"

    moved = client.post(url, {"start": local_dt(day, time(11)).isoformat()}, format="json")
    assert moved.status_code == 201 and moved.json()["replaces"] == original["id"]
    assert Appointment.objects.get(pk=original["id"]).status == "cancelled"


def test_staff_confirm_decline_and_no_show(service, day):
    patient = approved_patient()
    first = booking.request_appointment(patient, service, local_dt(day, time(9)))
    second = booking.request_appointment(patient, service, local_dt(day, time(10)))
    assert booking.confirm(first, by=None).status == "confirmed"
    declined = booking.decline(second, by=None, reason="Bitte wählen Sie einen anderen Tag.")
    assert declined.status == "declined" and declined.decline_reason

    past_start = timezone.now() - timedelta(days=2)
    past = Appointment.objects.create(
        patient=patient, service=service, status="confirmed", start=past_start,
        end=past_start + timedelta(minutes=30), occupied_until=past_start + timedelta(minutes=40),
    )
    assert past.display_status == "completed"
    assert booking.mark_no_show(past, by=None).status == "no_show"


def test_public_availability_contains_only_times(service, day):
    booking.book_by_staff(approved_patient(), service, local_dt(day, time(9)), by=None)
    response = APIClient().get(reverse("api-availability"),
                               {"service": service.pk, "from": day, "to": day})
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"service", "duration_minutes", "days"}
    assert set(body["days"][0]) == {"date", "slots"}
    assert "Mustermann" not in response.content.decode()
