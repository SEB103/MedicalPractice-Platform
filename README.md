# Medical Practice Platform — Quasar demo and Django development baseline

**Status: working Quasar static demo on GitHub Pages and initial Django backend with PostgreSQL CI tests. Not a production medical application.**

This repository is intended to become a reusable, open-source, **single-practice** web platform:
- Backend: Python, Django, Django REST Framework, Wagtail, PostgreSQL.
- Frontend: Vue 3 + Quasar CLI (Vite) + TypeScript, independently consuming REST/JSON.
- API: planned versioned `/api/v1/` with OpenAPI contract.
- Tests: Django/pytest, Quasar/Vitest, Playwright later; GitHub CI/CD grows with implementation.
- Demo: entirely fictional people and content; **not for real patient/health data before security, legal and operational review**.

The product repository is **independent from AI tools**. It builds, tests and deploys without Claude Code. Claude Code workspace is a separate GitHub repository, locally checked out one directory above as `../`.

## Already cloned this repository from GitHub?

Copy the **contents** of the scaffold archive's `MedicalPractice-Platform/` directory
into your existing `project/` checkout. Keep the existing `.git/` directory and
GitHub-generated `LICENSE`; do not initialize a new Git repository. Review staged
files before committing. See `docs/REPOSITORY_POLICY.md`.

## Starting from this scaffold

1. Establish your two GitHub repositories independently; do not use Git submodules.
2. Extend the initial Django/DRF/Wagtail backend under `backend/`; see `backend/README.md`. Add a transitive dependency lock before deployment.
3. Develop the existing Quasar frontend under `frontend/` using Quasar CLI and TypeScript; keep its package lockfile.
4. Use the existing local PostgreSQL Compose service and backend tests; extend the API contract and test fixtures as features are implemented.
5. Do not enable production deployment until security, DSGVO, backup and authorization reviews have passed.

CI validates the scaffold, builds and tests Quasar, and runs Django/DRF/Wagtail tests against PostgreSQL. See `backend/README.md` and `docs/GITHUB_PAGES.md`.

## Repository convention

`backend/`, `frontend/`, `.github/`, `deployment/`, `packaging/`, `docs/`, `tests/` belong to this repo. `.claude`, local AI tickets/generated docs, database and secrets never do. See `.gitignore` and `docs/REPOSITORY_POLICY.md`.

## Versioning

`packaging/product.json` is planned as the single source of **product** version `0.0.1`. API version `/api/v1/` is independent. The application may be released only when real builds and tests have been implemented and verified; the scaffold version is not a release.

## License

Starter template is distributed under MIT for reusability. Reassess license dependencies and policies before distributing full Wagtail/Quasar application; do not copy ReqDeck GPL project code into it.

## Run locally from VS Code (one click)

Requirements: Docker Desktop (running), Python 3.12+, Node.js 24+, VS Code with the recommended extensions
(Python/debugpy). Open the repository folder in VS Code and use **Run and Debug** (Ctrl+Shift+D); choose an
entry in the dropdown at the top and press ▶:

1. **⚙ Einrichten (einmalig)** — creates `backend/.venv`, installs Python and npm packages.
2. **⚙ Demo-Daten anlegen** — starts PostgreSQL, applies migrations, adds fictional services/hours and demo
   accounts (passwords in the ignored file `backend/.env.demo-login`).
3. **▶ Praxis starten (alles)** — every time: PostgreSQL + migrations, Django with debugger
   (http://127.0.0.1:8000/cms/) and the Quasar site in real API mode (http://localhost:9000, opens
   automatically). Stop everything with ■.

**⚠ Datenbank zurücksetzen** deletes and recreates the **local** test database after typing `JA`.
The same steps work in a terminal: `node scripts/dev.mjs setup|seed|reset`. Development only — no real
patient data.
