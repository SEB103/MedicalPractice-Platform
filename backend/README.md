# Django backend — to be initialized

Technology choice: Django + Django REST Framework + Wagtail + PostgreSQL.

Initialize a real Python project here with pinned compatible package versions, dependency lock, configuration module, Django apps, tests and manage.py. This scaffold intentionally has no fake Django source.

Planned bounded domains: `accounts`, `services`, `appointments`, `cms`; authentication, Wagtail admin and Django Admin are permitted to use their own templates.

All patient records in this public repository and its test fixtures must be synthetic. Never store private DB dumps, secrets or patient documents in Git. Keep backend business rules and authorization server-side.
