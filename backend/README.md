# MedicalPractice backend — initial tested Django baseline

**Development and CI only. Do not use with real patient data.** This is a minimal functioning backend, not the completed appointment/identity platform.

Stack: **Python 3.12, Django 5.2 LTS, Django REST Framework, Wagtail 7.4 LTS, PostgreSQL 16**.

## What exists

- Health endpoint: `GET /api/v1/health/` → `{"status":"ok"}` (public, no personal data).
- Wagtail admin at `/cms/` (requires authentication); Django admin at `/django-admin/`.
- Safe-by-default DRF permissions: authenticated unless an endpoint explicitly opts out.
- Real PostgreSQL integration tests (Wagtail tables and admin access), no SQLite fallback.
- GitHub workflow `.github/workflows/backend-ci.yml` runs installation, Django checks, missing-migration detection, and pytest on pushes / PRs to `master`.

- Accounts and patients (phase 1): custom e-mail `User`, `Patient` record (website or practice-created), roles `Praxisleitung` / `Empfang`, manual linking of registrations to existing patients (see `docs/adr/0001`–`0003`).
- API under `/api/v1/`: `auth/csrf/`, `auth/register/`, `auth/login/`, `auth/logout/`, `auth/password-reset/`, `auth/password-reset/confirm/`, `me/`; OpenAPI at `/api/v1/schema/` and committed in `docs/api/openapi.yaml`.

Not implemented yet: appointment booking, practice admin screens, public CMS content, production infrastructure. The Quasar demo still uses synthetic local data.

**Custom user model:** databases created before phase 1 must be recreated (development data only): `docker compose -f deployment/compose.dev.yml down -v`, then `up -d` and `migrate`.

Create the doctor account and set its password:

```powershell
python manage.py create_practice_owner --email dr.linden@example.invalid --first-name Anna --last-name Linden
python manage.py changepassword dr.linden@example.invalid
```

After API changes regenerate the schema: `python manage.py spectacular --validate --file ../docs/api/openapi.yaml`.

## Start locally on Windows (PowerShell)

Prerequisites: Docker Desktop with Compose; Python 3.12.

From the product repository root:

```powershell
docker compose -f deployment/compose.dev.yml up -d
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
$env:DJANGO_DEBUG = "1"
$env:POSTGRES_PASSWORD = "local-dev-only"
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Then visit http://127.0.0.1:8000/api/v1/health/ or http://127.0.0.1:8000/cms/.

To test locally (with PostgreSQL container running):

```powershell
python -m pytest -q
python manage.py check
python manage.py makemigrations --check --dry-run
```

Django makes a temporary test database for pytest. In CI all credentials and database data are disposable. `DJANGO_DEBUG=1` enables a **development-only** fallback signing secret. In all other modes, `DJANGO_SECRET_KEY` must be supplied from a secret store. Never expose the development PostgreSQL port beyond localhost or reuse development credentials for a public deployment.

## Next steps

Define bounded applications `accounts`, `services`, `appointments`, `cms`; add migration and authorization tests per feature, a deterministic transitive dependency lock, and local VS Code launch tasks. Review security, DSGVO, medical confidentiality and production requirements before processing any real data.
