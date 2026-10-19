# GitHub Pages: MedicalPractice Quasar Demo

This repository contains a **synthetic demonstration** of a medical practice. GitHub Pages serves only the built Quasar static SPA; it does **not** provide Django, PostgreSQL, a production login, or real appointments. **Do not enter real patient or health information** in the demo.

## Live URL

When GitHub Pages has been enabled and a deployment has completed successfully:

https://seb103.github.io/MedicalPractice-Platform/

The frontend uses Vue Router hash mode so routes such as `/#/termine` can work on static hosting. The deployment build sets `MEDICALPRACTICE_BASE_PATH=/MedicalPractice-Platform/` to load JavaScript, CSS, and public SVG images under the project subpath. Local builds still use `/` by default.

## One-time setup (repository owner)

1. Open [Settings > Pages](https://github.com/SEB103/MedicalPractice-Platform/settings/pages).
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open [Actions](https://github.com/SEB103/MedicalPractice-Platform/actions/workflows/pages.yml) and inspect the latest run. If the workflow did not start after enabling Pages, use **Run workflow** on `master`.
4. When both jobs pass, open the live URL above.

The GitHub integration used for source edits cannot directly change Pages repository settings. The owner performs the one-time Pages configuration via the GitHub UI. The site is not considered published until GitHub reports a successful Pages deployment.

## CI and deployment

Workflow: `.github/workflows/pages.yml`.

- On pull requests to `master`: `npm ci`, typecheck, lint, Vitest, Quasar build; no publication.
- On pushes to `master` and manual workflow dispatch: the same checks, then upload `frontend/dist/spa` and deploy to GitHub Pages.
- Uses Node.js 24 and root `package-lock.json` through npm workspaces.
- Deployment uses GitHub's official Pages artifact and deployment actions, with scoped `pages: write` and `id-token: write` permissions.
- `.github/workflows/scaffold-ci.yml` remains a separate Product structural check; it is **not** the Quasar test suite.

If publication fails, inspect the Actions log. Verify that Pages Source is **GitHub Actions**, that workflow permissions and deployment environment policy permit a deployment, and that the project URL contains the `/MedicalPractice-Platform/` prefix.

For actual medical-practice deployment, use a separately secured server for Django/DRF, Wagtail and PostgreSQL, with appropriate access control, data protection, backups and operational review.
