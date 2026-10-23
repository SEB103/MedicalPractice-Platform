from drf_spectacular.authentication import SessionScheme


class Session401Scheme(SessionScheme):
    """Describe SessionAuthentication401 as the standard cookie session scheme in OpenAPI."""

    target_class = "accounts.authentication.SessionAuthentication401"
