"""Versioned API and server-side administration endpoints."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from drf_spectacular.views import SpectacularAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.documents import urls as wagtaildocs_urls


class HealthView(APIView):
    """Public non-sensitive process health endpoint; no patient information."""

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(responses={200: OpenApiTypes.OBJECT})
    def get(self, request):
        return Response({"status": "ok"})


urlpatterns = [
    path("api/v1/health/", HealthView.as_view(), name="api-health"),
    path(
        "api/v1/schema/",
        SpectacularAPIView.as_view(authentication_classes=[], permission_classes=[AllowAny]),
        name="api-schema",
    ),
    path("api/v1/", include("accounts.urls")),
    path("api/v1/", include("appointments.urls")),
    path("api/v1/", include("cms.urls")),
    path("django-admin/", admin.site.urls),
    path("cms/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
