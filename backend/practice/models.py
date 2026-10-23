from django.core.exceptions import ValidationError
from django.db import models
from wagtail.contrib.settings.models import BaseGenericSetting, register_setting
from wagtail.fields import StreamField

from cms.blocks import SectionBlock


class Service(models.Model):
    """Appointment type offered by the practice (e.g. "Erstgespräch")."""

    title = models.CharField("Bezeichnung", max_length=120)
    description = models.TextField("Beschreibung", blank=True)
    icon = models.CharField("Icon (Material Icons)", max_length=60, blank=True)
    duration_minutes = models.PositiveSmallIntegerField("Dauer (Minuten)", default=30)
    is_active = models.BooleanField("Buchbar", default=True)
    sort_order = models.PositiveSmallIntegerField("Reihenfolge", default=0)
    introduction = models.TextField("Detailseite: Einleitung", blank=True)
    sections = StreamField(
        [("section", SectionBlock())], blank=True, verbose_name="Detailseite: Abschnitte"
    )
    preparation = models.TextField("Detailseite: Vorbereitung (ein Hinweis pro Zeile)", blank=True)

    class Meta:
        verbose_name = "Terminart"
        verbose_name_plural = "Terminarten"
        ordering = ["sort_order", "id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(duration_minutes__gte=5, duration_minutes__lte=240),
                name="practice_service_duration_range",
            )
        ]

    def __str__(self):
        return self.title


class WeeklyWindow(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Montag"
        TUESDAY = 1, "Dienstag"
        WEDNESDAY = 2, "Mittwoch"
        THURSDAY = 3, "Donnerstag"
        FRIDAY = 4, "Freitag"
        SATURDAY = 5, "Samstag"
        SUNDAY = 6, "Sonntag"

    weekday = models.PositiveSmallIntegerField("Wochentag", choices=Weekday.choices)
    start = models.TimeField("Beginn")
    end = models.TimeField("Ende")

    class Meta:
        verbose_name = "Sprechzeit"
        verbose_name_plural = "Sprechzeiten"
        ordering = ["weekday", "start"]

    def clean(self):
        if self.start >= self.end:
            raise ValidationError("Das Ende muss nach dem Beginn liegen.")

    def __str__(self):
        return f"{self.get_weekday_display()} {self.start:%H:%M}–{self.end:%H:%M}"


class Closure(models.Model):
    """Closed day(s): holidays, vacation, absences."""

    start_date = models.DateField("Von")
    end_date = models.DateField("Bis")
    reason = models.CharField("Hinweis", max_length=120, blank=True)

    class Meta:
        verbose_name = "Schließzeit"
        verbose_name_plural = "Schließzeiten"
        ordering = ["start_date"]

    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError("Das Enddatum darf nicht vor dem Startdatum liegen.")

    def __str__(self):
        return f"{self.start_date}–{self.end_date} {self.reason}".strip()


class SpecialHours(models.Model):
    """Consultation window on one date; all windows of that date replace the weekly hours."""

    date = models.DateField("Datum")
    start = models.TimeField("Beginn")
    end = models.TimeField("Ende")

    class Meta:
        verbose_name = "Abweichende Sprechzeit"
        verbose_name_plural = "Abweichende Sprechzeiten"
        ordering = ["date", "start"]

    def clean(self):
        if self.start >= self.end:
            raise ValidationError("Das Ende muss nach dem Beginn liegen.")

    def __str__(self):
        return f"{self.date} {self.start:%H:%M}–{self.end:%H:%M}"


@register_setting(icon="date")
class ScheduleSettings(BaseGenericSetting):
    slot_step_minutes = models.PositiveSmallIntegerField("Raster (Minuten)", default=15)
    buffer_minutes = models.PositiveSmallIntegerField("Pause nach einem Termin (Minuten)", default=10)
    horizon_days = models.PositiveSmallIntegerField("Buchbar bis (Tage im Voraus)", default=90)
    max_open_requests = models.PositiveSmallIntegerField(
        "Max. offene Anfragen pro Patient", default=3
    )

    class Meta:
        verbose_name = "Terminregeln"
