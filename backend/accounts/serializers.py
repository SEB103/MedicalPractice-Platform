from datetime import date

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from patients.models import Patient

MIN_BIRTH_DATE = date(1900, 1, 1)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    birth_date = serializers.DateField()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True, default="")
    street = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    postal_code = serializers.CharField(max_length=10, required=False, allow_blank=True, default="")
    city = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    privacy_accepted = serializers.BooleanField()

    def validate_birth_date(self, value):
        if not MIN_BIRTH_DATE <= value <= timezone.localdate():
            raise serializers.ValidationError("Bitte geben Sie ein gültiges Geburtsdatum an.")
        return value

    def validate_privacy_accepted(self, value):
        if value is not True:
            raise serializers.ValidationError("Bitte bestätigen Sie die Datenschutzhinweise.")
        return value

    def validate(self, attrs):
        candidate = get_user_model()(
            email=attrs["email"], first_name=attrs["first_name"], last_name=attrs["last_name"]
        )
        try:
            validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": list(error.messages)}) from error
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(trim_whitespace=False)


class PatientMeSerializer(serializers.ModelSerializer):
    account_linked = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            "first_name",
            "last_name",
            "birth_date",
            "phone",
            "street",
            "postal_code",
            "city",
            "status",
            "account_linked",
        ]
        read_only_fields = ["first_name", "last_name", "birth_date", "status"]

    def get_account_linked(self, patient) -> bool:
        return patient.account_linked_at is not None


class MeSerializer(serializers.Serializer):
    email = serializers.EmailField(read_only=True)
    patient = PatientMeSerializer(read_only=True, allow_null=True)

    def to_representation(self, user):
        return {
            "email": user.email,
            "patient": PatientMeSerializer(getattr(user, "patient", None)).data
            if hasattr(user, "patient")
            else None,
        }


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(trim_whitespace=False)
