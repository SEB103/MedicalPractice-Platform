"""Public schedule/availability and patient appointment endpoints under /api/v1/."""

from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import exceptions, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from patients.models import Patient
from practice.models import Closure, ScheduleSettings, Service, SpecialHours, WeeklyWindow

from . import services
from .availability import availability
from .models import Appointment


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "title", "description", "icon", "duration_minutes"]


class WindowSerializer(serializers.Serializer):
    start = serializers.TimeField(format="%H:%M")
    end = serializers.TimeField(format="%H:%M")


class WeeklyWindowSerializer(WindowSerializer):
    weekday = serializers.IntegerField(help_text="0 = Montag … 6 = Sonntag")


class SpecialHoursSerializer(WindowSerializer):
    date = serializers.DateField()


class ClosureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Closure
        fields = ["start_date", "end_date", "reason"]


class ScheduleSerializer(serializers.Serializer):
    weekly = WeeklyWindowSerializer(many=True)
    closures = ClosureSerializer(many=True)
    special_hours = SpecialHoursSerializer(many=True)
    slot_step_minutes = serializers.IntegerField()
    buffer_minutes = serializers.IntegerField()
    horizon_days = serializers.IntegerField()


class AvailabilityDaySerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.DateTimeField())


class AvailabilitySerializer(serializers.Serializer):
    service = serializers.IntegerField()
    duration_minutes = serializers.IntegerField()
    days = AvailabilityDaySerializer(many=True)


class AppointmentSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    status = serializers.CharField(source="display_status", read_only=True)
    can_change = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ["id", "service", "start", "end", "status", "decline_reason", "replaces", "can_change"]

    def get_can_change(self, appointment) -> bool:
        return services.patient_can_change(appointment)


class BookingSerializer(serializers.Serializer):
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.filter(is_active=True))
    start = serializers.DateTimeField()


class RescheduleSerializer(serializers.Serializer):
    start = serializers.DateTimeField()


def booking_error(error: services.BookingError) -> exceptions.APIException:
    status_code = 403 if isinstance(error, services.PatientNotApproved) else 409
    exc = exceptions.APIException(str(error))
    exc.status_code = status_code
    exc.default_code = error.code
    return exc


class ServicesView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses=ServiceSerializer(many=True))
    def get(self, request):
        return Response(ServiceSerializer(Service.objects.filter(is_active=True), many=True).data)


class ScheduleView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses=ScheduleSerializer)
    def get(self, request):
        rules = ScheduleSettings.load()
        today = timezone.localdate()
        until = today + timedelta(days=rules.horizon_days)
        data = {
            "weekly": WeeklyWindow.objects.all(),
            "closures": Closure.objects.filter(end_date__gte=today, start_date__lte=until),
            "special_hours": SpecialHours.objects.filter(date__gte=today, date__lte=until),
            "slot_step_minutes": rules.slot_step_minutes,
            "buffer_minutes": rules.buffer_minutes,
            "horizon_days": rules.horizon_days,
        }
        return Response(ScheduleSerializer(data).data)


class AvailabilityView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter("service", int, required=True),
            OpenApiParameter("from", str, description="YYYY-MM-DD, default: tomorrow"),
            OpenApiParameter("to", str, description="YYYY-MM-DD, default: end of booking horizon"),
        ],
        responses=AvailabilitySerializer,
    )
    def get(self, request):
        service = get_object_or_404(Service, pk=request.query_params.get("service"), is_active=True)
        today = timezone.localdate()
        horizon = today + timedelta(days=ScheduleSettings.load().horizon_days)
        dates = serializers.DateField()
        try:
            date_from = dates.to_internal_value(request.query_params.get("from") or str(today + timedelta(days=1)))
            date_to = dates.to_internal_value(request.query_params.get("to") or str(horizon))
        except serializers.ValidationError as error:
            raise exceptions.ValidationError({"from/to": error.detail}) from error
        data = {
            "service": service.pk,
            "duration_minutes": service.duration_minutes,
            "days": availability(service, date_from, min(date_to, horizon)),
        }
        return Response(AvailabilitySerializer(data).data)


class ApprovedPatientMixin:
    permission_classes = [IsAuthenticated]

    def patient(self, request) -> Patient:
        patient = getattr(request.user, "patient", None) if hasattr(request.user, "patient") else None
        if patient is None or patient.status != Patient.Status.APPROVED:
            raise booking_error(services.PatientNotApproved())
        return patient

    def own_appointment(self, request, pk) -> Appointment:
        return get_object_or_404(Appointment, pk=pk, patient=self.patient(request))


class AppointmentsView(ApprovedPatientMixin, APIView):
    @extend_schema(responses=AppointmentSerializer(many=True))
    def get(self, request):
        items = Appointment.objects.filter(patient=self.patient(request)).select_related("service")
        return Response(AppointmentSerializer(items, many=True).data)

    @extend_schema(request=BookingSerializer, responses={201: AppointmentSerializer})
    def post(self, request):
        patient = self.patient(request)
        serializer = BookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            appointment = services.request_appointment(
                patient, serializer.validated_data["service"], serializer.validated_data["start"]
            )
        except services.BookingError as error:
            raise booking_error(error) from error
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class AppointmentCancelView(ApprovedPatientMixin, APIView):
    @extend_schema(request=None, responses=AppointmentSerializer)
    def post(self, request, pk):
        appointment = self.own_appointment(request, pk)
        try:
            services.cancel_by_patient(appointment, appointment.patient)
        except services.BookingError as error:
            raise booking_error(error) from error
        return Response(AppointmentSerializer(appointment).data)


class AppointmentRescheduleView(ApprovedPatientMixin, APIView):
    @extend_schema(request=RescheduleSerializer, responses={201: AppointmentSerializer})
    def post(self, request, pk):
        original = self.own_appointment(request, pk)
        serializer = RescheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if original.service is None:
            raise booking_error(services.NotChangeable())
        try:
            new = services.request_appointment(
                original.patient,
                original.service,
                serializer.validated_data["start"],
                replaces=original,
            )
        except services.BookingError as error:
            raise booking_error(error) from error
        return Response(AppointmentSerializer(new).data, status=status.HTTP_201_CREATED)
