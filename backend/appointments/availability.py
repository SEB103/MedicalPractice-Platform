"""Free-slot calculation over all practice appointments (Europe/Berlin wall time)."""

from datetime import date, datetime, time, timedelta

from django.utils import timezone

from practice.models import Closure, ScheduleSettings, Service, SpecialHours, WeeklyWindow

from .models import ACTIVE_STATUSES, Appointment


def local_dt(day: date, at: time) -> datetime:
    return datetime.combine(day, at, tzinfo=timezone.get_default_timezone())


def windows_for(day: date) -> list[tuple[time, time]]:
    if Closure.objects.filter(start_date__lte=day, end_date__gte=day).exists():
        return []
    special = list(SpecialHours.objects.filter(date=day).values_list("start", "end"))
    if special:
        return special
    return list(WeeklyWindow.objects.filter(weekday=day.weekday()).values_list("start", "end"))


def is_bookable_day(day: date, today: date, rules: ScheduleSettings) -> bool:
    return today < day <= today + timedelta(days=rules.horizon_days)


def available_slots(
    service: Service, day: date, *, today: date | None = None, exclude: Appointment | None = None
) -> list[datetime]:
    """Start times on ``day`` where ``service`` plus the pause fits without overlapping."""
    rules = ScheduleSettings.load()
    today = today or timezone.localdate()
    if not is_bookable_day(day, today, rules):
        return []
    duration = timedelta(minutes=service.duration_minutes)
    occupied = duration + timedelta(minutes=rules.buffer_minutes)
    step = timedelta(minutes=rules.slot_step_minutes)
    day_start, day_end = local_dt(day, time.min), local_dt(day + timedelta(days=1), time.min)
    busy = Appointment.objects.filter(
        status__in=ACTIVE_STATUSES, start__lt=day_end, occupied_until__gt=day_start
    )
    if exclude is not None:
        busy = busy.exclude(pk=exclude.pk)
    busy_spans = list(busy.values_list("start", "occupied_until"))

    slots = []
    for window_start, window_end in windows_for(day):
        start, limit = local_dt(day, window_start), local_dt(day, window_end)
        while start + duration <= limit:
            if not any(start < b_end and start + occupied > b_start for b_start, b_end in busy_spans):
                slots.append(start)
            start += step
    return slots


def availability(service: Service, date_from: date, date_to: date) -> list[dict]:
    today = timezone.localdate()
    days = []
    day = date_from
    while day <= date_to:
        slots = available_slots(service, day, today=today)
        if slots:
            days.append({"date": day, "slots": slots})
        day += timedelta(days=1)
    return days
