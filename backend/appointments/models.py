from django.conf import settings
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import DateTimeRangeField, RangeOperators
from django.db import models
from django.utils import timezone

ACTIVE_STATUSES = ("requested", "confirmed", "blocked")


class TsTzRange(models.Func):
    function = "TSTZRANGE"
    output_field = DateTimeRangeField()


class Appointment(models.Model):
    """One booked, requested or blocked time span. ``occupied_until`` includes the pause after it."""

    class Status(models.TextChoices):
        REQUESTED = "requested", "Termin angefragt"
        CONFIRMED = "confirmed", "Termin bestätigt"
        DECLINED = "declined", "Termin abgelehnt"
        CANCELLED = "cancelled", "Termin abgesagt"
        NO_SHOW = "no_show", "Nicht erschienen"
        BLOCKED = "blocked", "Zeit blockiert"

    patient = models.ForeignKey(
        "patients.Patient",
        verbose_name="Patient",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="appointments",
    )
    service = models.ForeignKey(
        "practice.Service", verbose_name="Terminart", null=True, blank=True, on_delete=models.PROTECT
    )
    start = models.DateTimeField("Beginn")
    end = models.DateTimeField("Ende")
    occupied_until = models.DateTimeField("Belegt bis")
    status = models.CharField("Status", max_length=20, choices=Status.choices)
    decline_reason = models.CharField("Hinweis an den Patienten", max_length=200, blank=True)
    replaces = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL, related_name="replaced_by"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Termin"
        verbose_name_plural = "Termine"
        ordering = ["start"]
        constraints = [
            ExclusionConstraint(
                name="appointments_no_overlap",
                expressions=[(TsTzRange("start", "occupied_until"), RangeOperators.OVERLAPS)],
                condition=models.Q(status__in=ACTIVE_STATUSES),
            ),
            models.CheckConstraint(
                condition=models.Q(end__gt=models.F("start"), occupied_until__gte=models.F("end")),
                name="appointments_valid_span",
            ),
        ]
        indexes = [models.Index(fields=["start"]), models.Index(fields=["status", "start"])]

    @property
    def display_status(self) -> str:
        now = timezone.now()
        if self.status == self.Status.CONFIRMED and self.end <= now:
            return "completed"
        if self.status == self.Status.REQUESTED and self.start <= now:
            return "expired"
        return self.status

    def __str__(self):
        return f"Termin #{self.pk}"
