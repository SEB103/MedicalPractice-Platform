# Quasar source import (17 October 2026)

Source: `MedicalPractice-Quasar-source (2).zip` (from MedicalPractice project Library).
SHA-256: `d40d39dd55951cb93502d964c1a65c840931f4025fd1ba74e4853b15ba76e29d`.

- Imported the archive's `frontend/**` directly into Product's `frontend/**`.
- Imported top-level `package.json`, `package-lock.json`, and `scripts/**` to the Product root for the npm workspace.
- Imported prototype documentation from the archive under `docs/quasar/**` to preserve existing Product documentation.
- Replaced old frontend scaffold placeholder README with run instructions; preserved prototype README at `docs/quasar/README.md`.
- No built `dist`, local user data, archives, credentials or `node_modules` are committed.
- CI/test result is not implied by this import; run with Node.js 24 and verify before merging.
