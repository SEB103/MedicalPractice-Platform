"""Local development helpers. All accounts are fictional."""

import pytest
from django.contrib.auth import get_user_model
from django.core.management import CommandError, call_command

from practice.management.commands import seed_demo_accounts

pytestmark = pytest.mark.django_db


def test_demo_accounts_need_debug_and_write_logins(settings, tmp_path, monkeypatch):
    login_file = tmp_path / ".env.demo-login"
    monkeypatch.setattr(seed_demo_accounts, "LOGIN_FILE", login_file)
    settings.DEBUG = False
    with pytest.raises(CommandError):
        call_command("seed_demo_accounts")

    settings.DEBUG = True
    call_command("seed_demo_accounts")
    call_command("seed_demo_accounts")  # idempotent

    users = get_user_model().objects
    assert users.get(email="dr.linden@example.invalid").groups.filter(name="Praxisleitung").exists()
    assert users.get(email="empfang@example.invalid").groups.filter(name="Empfang").exists()
    assert "DEMO_PATIENT_PASSWORD=" in login_file.read_text(encoding="utf-8")
