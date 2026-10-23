# MedicalPractice — Quasar frontend

Vue 3 + TypeScript + Quasar 2 prototype imported from the Sites source snapshot (2), 17 October 2026.

Run from the Product repository root with **Node.js 24.x**:

```bash
npm ci
npm run dev --workspace frontend
```

For validation: `npm run check`, `npm run lint --workspace frontend`, `npm test`, `npm run build`.

The application is a demonstration with synthetic data and localStorage state, **not a production medical service**. Django/Wagtail and secure server-side authorization are not implemented. See [`docs/quasar/README.md`](../docs/quasar/README.md) and [`docs/quasar/ARCHITECTURE.md`](../docs/quasar/ARCHITECTURE.md).

## Real API mode (Django backend)

By default the app runs on mock data (static GitHub Pages demo). To use the Django API under `/api/v1/`
(session cookie + CSRF through the dev-server proxy), start the backend on `127.0.0.1:8000` (see
`backend/README.md`) and run:

```powershell
$env:MEDICALPRACTICE_API = "http"
npm.cmd run dev --workspace frontend
```

Open http://localhost:9000. `MEDICALPRACTICE_API_TARGET` changes the proxied backend URL. In real API mode
demo controls are hidden; registration, login, password reset, booking, cancelling and rescheduling use
the server. Public texts, images, contact data, FAQ, legal pages and the colour palette come from the CMS
(`/api/v1/content/`); fields left empty in Wagtail show the prototype texts.
