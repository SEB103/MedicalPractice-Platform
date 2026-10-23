"""Uniform API error envelope: ``{"code": str, "message": str, "fields": dict}`` (see ADR 0003)."""

from rest_framework import exceptions, status
from rest_framework.views import exception_handler


class InvalidCredentials(exceptions.APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "invalid_credentials"
    default_detail = "E-Mail-Adresse oder Passwort ist nicht korrekt."


class InvalidToken(exceptions.APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_code = "invalid_token"
    default_detail = "Der Link ist ungültig oder abgelaufen."


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    if isinstance(exc, exceptions.ValidationError):
        data = response.data
        fields = data if isinstance(data, dict) else {"non_field_errors": data}
        body = {"code": "validation_error", "message": "Bitte prüfen Sie Ihre Eingaben.", "fields": fields}
    elif isinstance(exc, (exceptions.NotAuthenticated, exceptions.AuthenticationFailed)):
        body = {"code": "not_authenticated", "message": "Bitte melden Sie sich an.", "fields": {}}
    else:
        detail = getattr(exc, "detail", "")
        body = {
            "code": getattr(exc, "default_code", "error"),
            "message": str(detail),
            "fields": {},
        }
    response.data = body
    return response
