from datetime import time

from django.core.management.base import BaseCommand

from practice.models import Service, WeeklyWindow

SERVICES = [
    ("Hausärztliche Beratung", "favorite_border", 30,
     "Raum für Ihre Fragen und eine gemeinsame Einordnung Ihrer gesundheitlichen Anliegen."),
    ("Vorsorge & Prävention", "health_and_safety", 45,
     "Individuelle Beratung zu Vorsorge und gesundheitsbewusster Lebensgestaltung."),
    ("Diagnostik", "monitor_heart", 30,
     "Eine sorgfältige Anamnese bildet die Grundlage für die Planung weiterer Untersuchungen."),
    ("Langfristige Begleitung", "spa", 30,
     "Kontinuierliche persönliche Betreuung und gemeinsam abgestimmte nächste Schritte."),
]
# Weekday 0 = Monday; same demo hours as the Quasar prototype.
HOURS = {
    0: [("09:00", "12:00"), ("14:00", "17:00")],
    1: [("09:00", "12:00"), ("14:00", "17:00")],
    2: [("09:00", "11:00"), ("14:00", "16:00")],
    3: [("09:00", "12:00"), ("14:00", "17:00")],
    4: [("09:00", "12:00")],
}


class Command(BaseCommand):
    help = "Fill an empty development database with fictional services and consultation hours."

    def handle(self, *args, **options):
        if Service.objects.exists() or WeeklyWindow.objects.exists():
            self.stdout.write("Services or hours already exist; nothing changed.")
            return
        for order, (title, icon, minutes, text) in enumerate(SERVICES):
            Service.objects.create(title=title, icon=icon, duration_minutes=minutes,
                                   description=text, sort_order=order)
        for weekday, windows in HOURS.items():
            for start, end in windows:
                WeeklyWindow.objects.create(weekday=weekday, start=time.fromisoformat(start),
                                            end=time.fromisoformat(end))
        self.stdout.write(self.style.SUCCESS("Demo services and hours created."))
