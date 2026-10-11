# Medical Practice Platform — public demo scaffold

**Status: initial repository template (NOT a functioning web application).**

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
2. Create actual backend under `backend/` with a documented environment and pinned dependencies; use verified Django/Wagtail/DRF compatible releases.
3. Create actual Quasar application under `frontend/` using official Quasar CLI with TypeScript; keep package lockfile.
4. Add local PostgreSQL Compose service, test fixtures, OpenAPI, CI tests and version parity.
5. Do not enable production deployment until security, DSGVO, backup and authorization reviews have passed.

CI currently validates only **scaffold structure** and metadata — NOT an imaginary Django or Vue build.

## Repository convention

`backend/`, `frontend/`, `.github/`, `deployment/`, `packaging/`, `docs/`, `tests/` belong to this repo. `.claude`, local AI tickets/generated docs, database and secrets never do. See `.gitignore` and `docs/REPOSITORY_POLICY.md`.

## Versioning

`packaging/product.json` is planned as the single source of **product** version `0.0.1`. API version `/api/v1/` is independent. The application may be released only when real builds and tests have been implemented and verified; the scaffold version is not a release.

## License

Starter template is distributed under MIT for reusability. Reassess license dependencies and policies before distributing full Wagtail/Quasar application; do not copy ReqDeck GPL project code into it.
