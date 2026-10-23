from django.contrib import admin

from .models import Closure, Service, SpecialHours, WeeklyWindow

admin.site.register([Service, WeeklyWindow, Closure, SpecialHours])
