"""Integration tests using a real PostgreSQL service in CI."""

import pytest
from django.db import connection
from django.urls import reverse
from wagtail.models import Page


@pytest.mark.django_db
def test_postgresql_is_live_and_wagtail_migrations_are_installed():
    # This must fail rather than silently substitute SQLite if PostgreSQL is missing.
    assert connection.vendor == "postgresql"
    with connection.cursor() as cursor:
        cursor.execute("SELECT current_database()")
        assert cursor.fetchone()[0].startswith("test_")
    # Accessing this table proves Wagtail's real database migrations succeeded.
    assert Page.objects.count() >= 1


@pytest.mark.django_db
def test_wagtail_admin_requires_login(client):
    response = client.get(reverse("wagtailadmin_home"))
    assert response.status_code == 302
    assert "/cms/login/" in response["Location"]
