"""Wagtail user admin without privilege escalation for practice staff (see ADR 0002)."""

from django.core.exceptions import PermissionDenied
from wagtail.users.views.users import CreateView, EditView
from wagtail.users.views.users import UserViewSet as WagtailUserViewSet


class NoSuperuserEscalationMixin:
    """Only superusers may grant or edit administrator (superuser) accounts."""

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        if not self.request.user.is_superuser:
            form.fields.pop("is_superuser", None)
        return form


class PracticeUserCreateView(NoSuperuserEscalationMixin, CreateView):
    pass


class PracticeUserEditView(NoSuperuserEscalationMixin, EditView):
    def get_object(self, queryset=None):
        user = super().get_object(queryset)
        if user.is_superuser and not self.request.user.is_superuser:
            raise PermissionDenied
        return user


class UserViewSet(WagtailUserViewSet):
    add_view_class = PracticeUserCreateView
    edit_view_class = PracticeUserEditView
