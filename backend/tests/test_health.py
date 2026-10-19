"""Small real API-level smoke tests; all values are synthetic."""

from django.urls import reverse
from rest_framework.test import APIClient


def test_health_endpoint_is_public_and_has_no_sensitive_fields():
    response = APIClient().get(reverse("api-health"))
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response["Content-Type"].startswith("application/json")


def test_health_endpoint_cannot_modify_data():
    response = APIClient().post(reverse("api-health"), {"status": "updated"}, format="json")
    assert response.status_code == 405
