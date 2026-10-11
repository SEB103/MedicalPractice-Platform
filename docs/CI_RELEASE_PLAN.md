# Planned CI and release workflow (derived from ReqDeck principles)

Current `.github/workflows/scaffold-ci.yml` checks the **structural starting point only**.

Target pipeline after actual application initialization:

1. Product metadata version validation and comparison to release tag `vX.Y.Z`.
2. Backend Python formatting/lint, Django system/migration checks, pytest with PostgreSQL.
3. Frontend TS type check, ESLint, Vitest, Quasar build and browser E2E with fictional fixtures.
4. Integration and OpenAPI contract checks.
5. Canonical verified production artifacts: Django image + built Quasar static assets; scans and immutable image digests.
6. Manual non-publishing release `workflow_dispatch` dry-run as in ReqDeck.
7. Tag-driven GitHub Release with artifacts, GHCR publication after all required checks succeed.
8. Staging deployment and smoke tests; production ONLY with explicit approval and rollout/backup/restore plan.

Do not add YAML jobs pretending these steps are implemented before app/build tooling exists. GitHub Pages may host static demo only, never Django/PostgreSQL.
