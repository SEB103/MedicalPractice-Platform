from django.urls import path

from . import api

urlpatterns = [
    path("auth/csrf/", api.CsrfView.as_view(), name="api-csrf"),
    path("auth/register/", api.RegisterView.as_view(), name="api-register"),
    path("auth/login/", api.LoginView.as_view(), name="api-login"),
    path("auth/logout/", api.LogoutView.as_view(), name="api-logout"),
    path("auth/password-reset/", api.PasswordResetView.as_view(), name="api-password-reset"),
    path(
        "auth/password-reset/confirm/",
        api.PasswordResetConfirmView.as_view(),
        name="api-password-reset-confirm",
    ),
    path("me/", api.MeView.as_view(), name="api-me"),
]
