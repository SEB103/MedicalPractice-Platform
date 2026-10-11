# Platform architecture (proposed baseline)

Public German-language informational site + CMS content editing + approved-client patient portal and appointments; one private practice per deployed instance.

- **Backend**: Django + DRF + Wagtail; owns auth, patient approval, services/schedule, bookings and data access.
- **CMS**: Wagtail/Django admin may render its own server HTML templates; only public/published content exposed to Quasar as necessary.
- **Frontend**: Vue 3/Quasar/TypeScript; independent client using versioned REST API; no direct DB access.
- **Persistence**: PostgreSQL; database and media outside application images, private per deployment.
- **Security**: server-side object permissions; session/CSRF strategy for web; fake demo data only at first. GDPR/DSGVO and medical confidentiality review mandatory before production.
- **Deployment**: separate frontend assets, Python server, PostgreSQL and reverse proxy via Docker/Compose (planned).
- **GitHub**: separate product Actions CI, Release, GHCR, staging, optional later production approvals.

The repository is currently a **scaffold**. Requirements and architecture will evolve through ADRs in `docs/adr/`.
