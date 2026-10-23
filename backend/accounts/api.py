"""Authentication and profile endpoints under /api/v1/ (see ADR 0003)."""

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from config.api_errors import InvalidCredentials, InvalidToken
from patients import services

from .authentication import SessionAuthentication401
from .serializers import (
    LoginSerializer,
    MeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    PatientMeSerializer,
    RegisterSerializer,
)

REGISTRATION_RECEIVED = {"detail": "registration_received"}
RESET_REQUESTED = {"detail": "password_reset_requested"}


class AnonymousCsrfView(APIView):
    """Public POST endpoint that still enforces CSRF (DRF skips it for anonymous users)."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        SessionAuthentication401().enforce_csrf(request)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses={200: OpenApiTypes.OBJECT})
    def get(self, request):
        return Response({"detail": "ok"})


class RegisterView(AnonymousCsrfView):
    @extend_schema(request=RegisterSerializer, responses={202: OpenApiTypes.OBJECT})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        data.pop("privacy_accepted")
        # Same answer whether or not the e-mail is already registered (no account enumeration).
        services.register_from_website(**data)
        return Response(REGISTRATION_RECEIVED, status=status.HTTP_202_ACCEPTED)


class LoginView(AnonymousCsrfView):
    @extend_schema(request=LoginSerializer, responses={200: MeSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request._request,
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            raise InvalidCredentials()
        login(request._request, user)
        return Response(MeSerializer(user).data)


class LogoutView(APIView):
    @extend_schema(request=None, responses={204: None})
    def post(self, request):
        logout(request._request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetView(AnonymousCsrfView):
    @extend_schema(request=PasswordResetSerializer, responses={202: OpenApiTypes.OBJECT})
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        form = PasswordResetForm(data=serializer.validated_data)
        if form.is_valid():
            form.save(
                request=request._request,
                subject_template_name="accounts/password_reset_subject.txt",
                email_template_name="accounts/password_reset_email.txt",
                from_email=settings.DEFAULT_FROM_EMAIL,
                extra_email_context={"frontend_base_url": settings.FRONTEND_BASE_URL},
            )
        return Response(RESET_REQUESTED, status=status.HTTP_202_ACCEPTED)


class PasswordResetConfirmView(AnonymousCsrfView):
    @extend_schema(request=PasswordResetConfirmSerializer, responses={204: None})
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        User = get_user_model()
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(data["uid"])))
        except (ValueError, TypeError, OverflowError, User.DoesNotExist) as error:
            raise InvalidToken() from error
        if not default_token_generator.check_token(user, data["token"]):
            raise InvalidToken()
        form = SetPasswordForm(
            user, {"new_password1": data["new_password"], "new_password2": data["new_password"]}
        )
        if not form.is_valid():
            raise ValidationError({"new_password": form.errors.get("new_password2", [])})
        form.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: MeSerializer})
    def get(self, request):
        return Response(MeSerializer(request.user).data)

    @extend_schema(request=PatientMeSerializer, responses={200: MeSerializer})
    def patch(self, request):
        patient = getattr(request.user, "patient", None) if hasattr(request.user, "patient") else None
        if patient is None:
            raise NotFound("Kein Patientenprofil vorhanden.")
        serializer = PatientMeSerializer(patient, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(MeSerializer(request.user).data)
