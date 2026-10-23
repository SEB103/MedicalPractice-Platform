"""Create fictional demo accounts for local development (never in production)."""

import secrets
from datetime import date
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError

from accounts.roles import EMPFANG, PRAXISLEITUNG
from patients import services
from patients.models import Patient

LOGIN_FILE = Path(settings.BASE_DIR) / ".env.demo-login"

STAFF = [
    ("DEMO_LOGIN", "dr.linden@example.invalid", "Anna", "Linden", PRAXISLEITUNG),
    ("DEMO_RECEPTION", "empfang@example.invalid", "Paula", "Empfang", EMPFANG),
]
PATIENT = ("DEMO_PATIENT", "lena.probe@example.invalid", "Lena", "Probe", date(1988, 4, 12))


def read_logins() -> dict[str, str]:
    if not LOGIN_FILE.exists():
        return {}
    pairs = (line.split("=", 1) for line in LOGIN_FILE.read_text(encoding="utf-8").splitlines() if "=" in line)
    return {key.strip(): value.strip() for key, value in pairs}


class Command(BaseCommand):
    help = "Create fictional doctor, reception and patient accounts; passwords go to .env.demo-login."

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Demo accounts are only allowed with DJANGO_DEBUG=1.")
        User = get_user_model()
        logins = read_logins()
        created = []

        for prefix, email, first, last, role in STAFF:
            if User.objects.filter(email__iexact=email).exists():
                continue
            password = secrets.token_urlsafe(12)
            user = User.objects.create_user(email, password, first_name=first, last_name=last)
            user.groups.add(Group.objects.get(name=role))
            logins.update({f"{prefix}_EMAIL": email, f"{prefix}_PASSWORD": password})
            created.append(email)

        prefix, email, first, last, birth = PATIENT
        if not User.objects.filter(email__iexact=email).exists():
            password = secrets.token_urlsafe(12)
            patient = services.register_from_website(
                email=email, password=password, first_name=first, last_name=last, birth_date=birth
            )
            services.approve(patient, by=None)
            logins.update({f"{prefix}_EMAIL": email, f"{prefix}_PASSWORD": password})
            created.append(email)

        # A practice-created record plus a matching pending registration shows the linking workflow.
        if not Patient.objects.filter(last_name="Mustermann", source=Patient.Source.PRACTICE).exists():
            services.create_by_staff(
                by=None, first_name="Max", last_name="Mustermann", birth_date=date(1980, 5, 17),
                phone="+49 30 23125 000",
            )
        if not User.objects.filter(email__iexact="max.mustermann@example.invalid").exists():
            services.register_from_website(
                email="max.mustermann@example.invalid", password=secrets.token_urlsafe(16),
                first_name="Max", last_name="Mustermann", birth_date=date(1980, 5, 17),
            )

        LOGIN_FILE.write_text(
            "# Local demo logins (fictional, development only, ignored by Git)\n"
            + "".join(f"{key}={value}\n" for key, value in logins.items()),
            encoding="utf-8",
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created: {', '.join(created)}"))
        self.stdout.write(f"Logins: {LOGIN_FILE}")
