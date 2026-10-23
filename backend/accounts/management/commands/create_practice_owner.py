from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError

from accounts.roles import PRAXISLEITUNG


class Command(BaseCommand):
    help = "Create the practice owner (doctor) account in the Praxisleitung group."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--first-name", required=True)
        parser.add_argument("--last-name", required=True)

    def handle(self, *args, email, first_name, last_name, **options):
        User = get_user_model()
        if User.objects.filter(email__iexact=email).exists():
            raise CommandError("A user with this e-mail address already exists.")
        user = User.objects.create_user(
            email=email, password=None, first_name=first_name, last_name=last_name
        )
        user.groups.add(Group.objects.get(name=PRAXISLEITUNG))
        self.stdout.write(
            self.style.SUCCESS(
                f"Created {user.email}. Set the password with: "
                f"python manage.py changepassword {user.email}"
            )
        )
