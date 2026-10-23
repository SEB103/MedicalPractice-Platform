from django.urls import path

from .api import ContentView

urlpatterns = [path("content/", ContentView.as_view(), name="api-content")]
