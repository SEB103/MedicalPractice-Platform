"""Public CMS content API and editor permissions. All content is fictional."""

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework.test import APIClient
from wagtail.images.models import Image
from wagtail.images.tests.utils import get_test_image_file

from accounts.roles import EMPFANG, PRAXISLEITUNG
from cms.models import FaqItem, LegalPage, SiteContent
from patients import services as patients
from practice.models import Service

pytestmark = pytest.mark.django_db


def staff(role, email):
    user = get_user_model().objects.create_user(email, "Demo-Passwort-2026!")
    user.groups.add(Group.objects.get(name=role))
    return user


def test_content_api_is_public_and_works_with_empty_content():
    patients.register_from_website(email="max@example.invalid", password="Demo-Passwort-2026!",
                                   first_name="Max", last_name="Mustermann", birth_date="1980-05-17")
    response = APIClient().get(reverse("api-content"))
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"site", "contact", "appearance", "faq", "legal", "services"}
    assert body["site"]["headline"] == "" and body["faq"] == []
    assert "Mustermann" not in response.content.decode()


def test_edited_content_and_images_are_published():
    image = Image.objects.create(title="Wartebereich", file=get_test_image_file(), focal_point_x=320,
                                 focal_point_y=120, focal_point_width=10, focal_point_height=10)
    site = SiteContent.load()
    site.headline = "Medizin mit Zeit."
    site.hero_image = image
    site.save()
    FaqItem.objects.create(question="Wie vereinbare ich einen Termin?", answer="Online.")
    LegalPage.objects.create(slug="impressum", title="Impressum")
    service = Service.objects.create(title="Beratung", introduction="Zeit für Ihre Fragen.",
                                     preparation="Versichertenkarte\n\nMedikamentenliste")

    body = APIClient().get(reverse("api-content")).json()

    assert body["site"]["headline"] == "Medizin mit Zeit."
    hero = body["site"]["hero"]["image"]
    assert hero["alt"] and hero["renditions"][0]["url"].startswith("/media/")
    assert hero["focal_point"] == {"x_percent": 50.0, "y_percent": 25.0}
    assert body["faq"] == [{"q": "Wie vereinbare ich einen Termin?", "a": "Online."}]
    assert body["legal"]["impressum"]["title"] == "Impressum"
    detail = next(s for s in body["services"] if s["id"] == str(service.pk))
    assert detail["preparation"] == ["Versichertenkarte", "Medikamentenliste"]


def test_only_doctor_edits_website_content(client):
    doctor = staff(PRAXISLEITUNG, "dr.linden@example.invalid")
    reception = staff(EMPFANG, "empfang@example.invalid")
    site_url = reverse("wagtailsettings:edit", args=["cms", "sitecontent"])
    faq_url = reverse("wagtailsnippets_cms_faqitem:list")

    client.force_login(doctor)
    page = client.get(site_url, follow=True)
    assert page.status_code == 200 and "sitecontent" in page.request["PATH_INFO"]
    assert client.get(faq_url).status_code == 200
    assert client.get(reverse("wagtailimages:index")).status_code == 200

    client.force_login(reception)
    assert "sitecontent" not in client.get(site_url, follow=True).request["PATH_INFO"]
    assert client.get(faq_url).status_code != 200
