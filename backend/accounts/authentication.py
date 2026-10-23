from rest_framework.authentication import SessionAuthentication


class SessionAuthentication401(SessionAuthentication):
    """Session auth that answers anonymous requests with 401 instead of DRF's default 403.

    The frontend relies on 401 to detect an expired session.
    """

    def authenticate_header(self, request):
        return "Session"
