# Review corrections — 2026-10-17

Implemented:
- Standard palettes remain applicable after invalid custom HEX; persisted HEX is normalized.
- Preview button/text colors match standard light/dark palettes.
- Drafts validate medical profile and service ID; color changes preserve selected appointments.
- Service API rejects foreign-profile services and profile changes during asynchronous requests.
- Existing name-only appointments can still be moved; new bookings use catalog services.
- Stable service URLs with backwards-compatible numeric URLs.
- FAQ and Praxis & Ablauf start with viewing dates and explain requests versus confirmation.
- Dashboard excludes appointments whose start time has passed in Europe/Berlin; its heading
  distinguishes pending requests from confirmed appointments. Clock refreshes while page is open.
- Contact and calendar weekly hours share one source.
- tel: normalization removes international optional trunk zero; clearly labeled fictional
  reserved telephone demonstrates the link without using someone's real number.

Validation: TypeScript, ESLint, 73 tests and production build.
New page tests exercise palette recovery/persistence/reset, booking selection through login
and submission, profile-draft rejection and preservation across color changes.
Page tests use Vue Test Utils with native control substitutes for Quasar controls. They verify
page bindings and workflow, not Quasar popup behavior, browser layout or accessibility compliance.

Still open: desktop/tablet/mobile visual checks, real Quasar keyboard interactions, screen
reader and zoom tests, rendered contrast/state checks. Browser QA tool unavailable in this run.
No claim of full WCAG 2.2 AA compliance. No real booking backend or protected owner administration.
