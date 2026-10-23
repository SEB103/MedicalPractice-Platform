from django.urls import path

from . import api

urlpatterns = [
    path("services/", api.ServicesView.as_view(), name="api-services"),
    path("practice/schedule/", api.ScheduleView.as_view(), name="api-schedule"),
    path("availability/", api.AvailabilityView.as_view(), name="api-availability"),
    path("appointments/", api.AppointmentsView.as_view(), name="api-appointments"),
    path(
        "appointments/<int:pk>/cancel/",
        api.AppointmentCancelView.as_view(),
        name="api-appointment-cancel",
    ),
    path(
        "appointments/<int:pk>/reschedule/",
        api.AppointmentRescheduleView.as_view(),
        name="api-appointment-reschedule",
    ),
]
