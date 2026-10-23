"""Public, read-only website content for the Quasar frontend (editorial data only, no patient data)."""

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from practice.models import Service

from .models import Appearance, FaqItem, LegalPage, PracticeContact, SiteContent

RENDITIONS = ("width-480", "width-960", "width-1600")


def image_dto(image, caption: str = "") -> dict | None:
    if image is None:
        return None
    renditions = {}
    for spec in RENDITIONS:
        rendition = image.get_rendition(spec)
        renditions[rendition.width] = {
            "url": rendition.url,
            "width": rendition.width,
            "height": rendition.height,
        }
    focal = None
    if image.focal_point_x is not None and image.width and image.height:
        focal = {
            "x_percent": round(image.focal_point_x / image.width * 100, 1),
            "y_percent": round(image.focal_point_y / image.height * 100, 1),
        }
    return {
        "id": image.pk,
        "alt": getattr(image, "description", "") or image.title,
        "caption": caption,
        "renditions": sorted(renditions.values(), key=lambda r: r["width"]),
        "focal_point": focal,
    }


def sections(stream) -> list[dict]:
    return [
        {"heading": block.value["heading"], "paragraphs": list(block.value["paragraphs"])}
        for block in stream
    ]


class ContentView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses={200: OpenApiTypes.OBJECT})
    def get(self, request):
        site = SiteContent.load(request_or_site=request)
        contact = PracticeContact.load(request_or_site=request)
        appearance = Appearance.load(request_or_site=request)
        return Response(
            {
                "site": {
                    "specialty": site.specialty,
                    "headline": site.headline,
                    "intro": site.intro,
                    "hero": {
                        "eyebrow": site.hero_eyebrow,
                        "lead": site.hero_lead,
                        "emphasis": site.hero_emphasis,
                        "note": site.hero_note,
                        "image": image_dto(site.hero_image),
                    },
                    "portrait": image_dto(site.portrait),
                    "values": [dict(block.value) for block in site.values],
                    "about": sections(site.about),
                    "gallery": [
                        image_dto(block.value["image"], block.value["caption"])
                        for block in site.gallery
                    ],
                },
                "contact": {
                    "location_label": contact.location_label,
                    "address": contact.address,
                    "address_verified": contact.address_verified,
                    "place_id": contact.place_id,
                    "phone": contact.phone,
                    "phone_notice": contact.phone_notice,
                    "email": contact.email,
                    "telephone_hours": contact.telephone_hours,
                },
                "appearance": {
                    "palette": appearance.palette,
                    "custom_primary": appearance.custom_primary,
                },
                "faq": [{"q": item.question, "a": item.answer} for item in FaqItem.objects.all()],
                "legal": {
                    page.slug: {
                        "title": page.title,
                        "intro": page.intro,
                        "sections": [dict(block.value) for block in page.sections],
                    }
                    for page in LegalPage.objects.all()
                },
                "services": [
                    {
                        "id": str(service.pk),
                        "introduction": service.introduction,
                        "sections": sections(service.sections),
                        "preparation": [
                            line.strip() for line in service.preparation.splitlines() if line.strip()
                        ],
                    }
                    for service in Service.objects.filter(is_active=True)
                ],
            }
        )
