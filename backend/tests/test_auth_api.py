"""Auth and /me API. All people and addresses are fictional."""

import pytest
from django.core import mail
from django.urls import reverse
from rest_framework.test import APIClient

from patients import services
from patients.models import Patient

PASSWORD = "Demo-Passwort-2026!"
REGISTRATION = {
    "email": "max@example.invalid",
    "password": PASSWORD,
    "first_name": "Max",
    "last_name": "Mustermann",
    "birth_date": "1980-05-17",
    "privacy_accepted": True,
}


@pytest.fixture(autouse=True)
def _no_throttle_state(settings):
    from django.core.cache import cache

    cache.clear()


def csrf_client():
    client = APIClient(enforce_csrf_checks=True)
    client.get(reverse("api-csrf"))
    client.credentials(HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)
    return client


def make_patient(email="max@example.invalid"):
    return services.register_from_website(
        email=email, password=PASSWORD, first_name="Max", last_name="Mustermann",
        birth_date="1980-05-17",
    )


@pytest.mark.django_db
def test_login_without_csrf_token_is_rejected():
    make_patient()
    response = APIClient(enforce_csrf_checks=True).post(
        reverse("api-login"), {"email": "max@example.invalid", "password": PASSWORD}, format="json"
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_login_with_csrf_then_me_returns_pending_status():
    make_patient()
    client = csrf_client()
    response = client.post(
        reverse("api-login"), {"email": "MAX@example.invalid", "password": PASSWORD}, format="json"
    )
    assert response.status_code == 200
    me = client.get(reverse("api-me")).json()
    assert me["email"] == "max@example.invalid"
    assert me["patient"]["status"] == "pending"


@pytest.mark.django_db
def test_register_response_identical_for_existing_email():
    client = csrf_client()
    first = client.post(reverse("api-register"), REGISTRATION, format="json")
    second = client.post(reverse("api-register"), REGISTRATION, format="json")
    assert first.status_code == second.status_code == 202
    assert first.json() == second.json()
    assert Patient.objects.count() == 1


@pytest.mark.django_db
def test_register_rejects_future_birth_date_and_missing_privacy():
    data = {**REGISTRATION, "birth_date": "2999-01-01", "privacy_accepted": False}
    response = csrf_client().post(reverse("api-register"), data, format="json")
    assert response.status_code == 400
    body = response.json()
    assert body["code"] == "validation_error"
    assert {"birth_date", "privacy_accepted"} <= set(body["fields"])


@pytest.mark.django_db
def test_me_anonymous_returns_401_envelope():
    response = APIClient().get(reverse("api-me"))
    assert response.status_code == 401
    assert response.json()["code"] == "not_authenticated"


@pytest.mark.django_db
def test_login_blocked_user_same_error_as_wrong_password():
    patient = make_patient()
    services.block(patient, by=None)
    client = csrf_client()
    blocked = client.post(
        reverse("api-login"), {"email": "max@example.invalid", "password": PASSWORD}, format="json"
    )
    wrong = client.post(
        reverse("api-login"), {"email": "max@example.invalid", "password": "falsch"}, format="json"
    )
    assert blocked.status_code == wrong.status_code == 400
    assert blocked.json() == wrong.json()
    assert blocked.json()["code"] == "invalid_credentials"


@pytest.mark.django_db
def test_patch_me_changes_phone_not_birth_date():
    patient = make_patient()
    client = APIClient()
    client.force_authenticate(patient.user)
    response = client.patch(
        reverse("api-me"), {"phone": "+49 30 23125 000", "birth_date": "1990-01-01"}, format="json"
    )
    assert response.status_code == 200
    patient.refresh_from_db()
    assert patient.phone == "+49 30 23125 000"
    assert str(patient.birth_date) == "1980-05-17"


@pytest.mark.django_db
def test_password_reset_sends_mail_only_for_known_email():
    make_patient()
    client = csrf_client()
    known = client.post(reverse("api-password-reset"), {"email": "max@example.invalid"}, format="json")
    unknown = client.post(
        reverse("api-password-reset"), {"email": "niemand@example.invalid"}, format="json"
    )
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()
    assert len(mail.outbox) == 1
    assert "#/passwort-neu?uid=" in mail.outbox[0].body
