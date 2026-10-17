# MedicalPractice — Quasar frontend

Vue 3 + TypeScript + Quasar 2 prototype imported from the Sites source snapshot (2), 17 October 2026.

Run from the Product repository root with **Node.js 24.x**:

```bash
npm ci
npm run dev --workspace frontend
```

For validation: `npm run check`, `npm run lint --workspace frontend`, `npm test`, `npm run build`.

The application is a demonstration with synthetic data and localStorage state, **not a production medical service**. Django/Wagtail and secure server-side authorization are not implemented. See [`docs/quasar/README.md`](../docs/quasar/README.md) and [`docs/quasar/ARCHITECTURE.md`](../docs/quasar/ARCHITECTURE.md).
