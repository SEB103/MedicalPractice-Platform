from django.conf import settings
from django.db import models
from django.db.models.functions import Lower


class Patient(models.Model):
    """A patient of the practice; may exist without a website account (see ADR 0001).

    Deliberately stores no medical data and no free-text notes.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Freigabe ausstehend"
        APPROVED = "approved", "Freigegeben"
        REJECTED = "rejected", "Abgelehnt"
        BLOCKED = "blocked", "Gesperrt"

    class Source(models.TextChoices):
        WEBSITE = "website", "Registrierung über die Website"
        PRACTICE = "practice", "Von der Praxis angelegt"

    first_name = models.CharField("Vorname", max_length=100)
    last_name = models.CharField("Nachname", max_length=100)
    birth_date = models.DateField("Geburtsdatum")
    email = models.EmailField("E-Mail", blank=True)
    phone = models.CharField("Telefon", max_length=40, blank=True)
    street = models.CharField("Straße und Hausnummer", max_length=200, blank=True)
    postal_code = models.CharField("PLZ", max_length=10, blank=True)
    city = models.CharField("Ort", max_length=100, blank=True)

    status = models.CharField("Status", max_length=20, choices=Status.choices, default=Status.PENDING)
    source = models.CharField("Herkunft", max_length=20, choices=Source.choices)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        verbose_name="Website-Konto",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="patient",
    )

    created_at = models.DateTimeField("Angelegt am", auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    approved_at = models.DateTimeField("Freigegeben am", null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    account_linked_at = models.DateTimeField("Konto verbunden am", null=True, blank=True)

    class Meta:
        verbose_name = "Patient"
        verbose_name_plural = "Patienten"
        indexes = [models.Index(Lower("last_name"), "birth_date", name="patients_name_birth_idx")]
        permissions = [
            ("approve_patient", "Kann Patienten freigeben, ablehnen und verbinden"),
            ("block_patient", "Kann Patienten sperren"),
        ]

    def __str__(self):
        # Used as label in logs and admin breadcrumbs: never expose personal data here.
        return f"Patient #{self.pk}"
