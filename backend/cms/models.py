"""Editable public website content. Empty fields fall back to the prototype texts in the frontend."""

import re

from django.core.exceptions import ValidationError
from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseGenericSetting, register_setting
from wagtail.fields import StreamField

from .blocks import GalleryImageBlock, LegalSectionBlock, SectionBlock, ValueBlock

IMAGE_FK = dict(null=True, blank=True, on_delete=models.SET_NULL, related_name="+")


@register_setting(icon="home")
class SiteContent(BaseGenericSetting):
    specialty = models.CharField("Fachrichtung", max_length=120, blank=True)
    headline = models.CharField("Leitsatz", max_length=160, blank=True)
    intro = models.TextField("Einleitung (Startseite)", blank=True)
    hero_eyebrow = models.CharField("Startseite: Kopfzeile", max_length=120, blank=True)
    hero_lead = models.CharField("Startseite: Titel", max_length=120, blank=True)
    hero_emphasis = models.CharField("Startseite: Hervorhebung", max_length=120, blank=True)
    hero_note = models.CharField("Startseite: Hinweis unter dem Bild", max_length=160, blank=True)
    hero_image = models.ForeignKey("wagtailimages.Image", verbose_name="Startseite: Bild", **IMAGE_FK)
    portrait = models.ForeignKey("wagtailimages.Image", verbose_name="Porträt (Über mich)", **IMAGE_FK)
    values = StreamField([("value", ValueBlock())], blank=True, verbose_name="Werte (Startseite)")
    about = StreamField([("section", SectionBlock())], blank=True, verbose_name="Über mich")
    gallery = StreamField([("image", GalleryImageBlock())], blank=True, verbose_name="Praxisbilder")

    panels = [
        MultiFieldPanel([FieldPanel("specialty"), FieldPanel("headline"), FieldPanel("intro")], "Praxis"),
        MultiFieldPanel(
            [
                FieldPanel("hero_eyebrow"),
                FieldPanel("hero_lead"),
                FieldPanel("hero_emphasis"),
                FieldPanel("hero_note"),
                FieldPanel("hero_image"),
            ],
            "Startseite",
        ),
        FieldPanel("values"),
        FieldPanel("portrait"),
        FieldPanel("about"),
        FieldPanel("gallery"),
    ]

    class Meta:
        verbose_name = "Website-Inhalte"


@register_setting(icon="mail")
class PracticeContact(BaseGenericSetting):
    location_label = models.CharField("Standortbezeichnung", max_length=160, blank=True)
    address = models.CharField("Adresse", max_length=200, blank=True)
    address_verified = models.BooleanField(
        "Adresse geprüft (Kartenlinks anzeigen)", default=False
    )
    place_id = models.CharField("Google Place ID (optional)", max_length=200, blank=True)
    phone = models.CharField("Telefon", max_length=40, blank=True)
    phone_notice = models.CharField("Hinweis zum Telefon", max_length=200, blank=True)
    email = models.EmailField("E-Mail", blank=True)
    telephone_hours = models.CharField("Telefonzeiten", max_length=200, blank=True)

    class Meta:
        verbose_name = "Kontakt"


@register_setting(icon="view")
class Appearance(BaseGenericSetting):
    class Palette(models.TextChoices):
        WALDGRUEN = "waldgruen", "Waldgrün"
        PFLAUME = "pflaume", "Pflaume"
        STAHLBLAU = "stahlblau", "Stahlblau"
        CUSTOM = "custom", "Eigene Farbe"

    palette = models.CharField("Farbpalette", max_length=20, choices=Palette.choices, default=Palette.WALDGRUEN)
    custom_primary = models.CharField(
        "Eigene Farbe (HEX, z. B. #356653)", max_length=7, default="#356653"
    )

    def clean(self):
        if not re.fullmatch(r"#[0-9a-fA-F]{6}", self.custom_primary or ""):
            raise ValidationError({"custom_primary": "Bitte eine Farbe im Format #RRGGBB angeben."})

    class Meta:
        verbose_name = "Erscheinungsbild"


class FaqItem(models.Model):
    question = models.CharField("Frage", max_length=200)
    answer = models.TextField("Antwort")
    sort_order = models.PositiveSmallIntegerField("Reihenfolge", default=0)

    class Meta:
        verbose_name = "FAQ-Eintrag"
        verbose_name_plural = "FAQ"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.question


class LegalPage(models.Model):
    class Slug(models.TextChoices):
        IMPRESSUM = "impressum", "Impressum"
        DATENSCHUTZ = "datenschutz", "Datenschutz"
        PATIENTENDATENSCHUTZ = "patientendatenschutz", "Patienteninformation zum Datenschutz"
        BARRIEREFREIHEIT = "barrierefreiheit", "Barrierefreiheit"

    slug = models.CharField("Seite", max_length=40, choices=Slug.choices, unique=True)
    title = models.CharField("Titel", max_length=160)
    intro = models.TextField("Einleitung", blank=True)
    sections = StreamField([("section", LegalSectionBlock())], blank=True, verbose_name="Abschnitte")

    class Meta:
        verbose_name = "Rechtliche Seite"
        verbose_name_plural = "Rechtliche Seiten"
        ordering = ["slug"]

    def __str__(self):
        return self.get_slug_display()
