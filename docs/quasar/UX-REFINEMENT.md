# UX refinement — 17 October 2026

## Base and scope
Continues the saved Sites version 6 (source commit 141acf6d8e6e8aa251abfd729b23081a3c7780de).
The attached source ZIP was an older 22-test version; using it alone would have lost the already delivered schedule and design changes.
Vue 3, TypeScript, Quasar 2, CLI/Vite, Router, Pinia, layouts and patient workflows are retained. No dependencies added. No Django backend or real owner authentication added.

## Delivered
- Primary homepage action opens `/termine`: appointment type → nearest five available dates → date/time → review → request. Account access is requested only when submitting; existing demo account rules remain explicitly provisional.
- A draft stays in Pinia while navigating to login and between steps. It is not medical data, is not persisted, and is revalidated against current availability. A reload starts a fresh draft. Explicit service links and rescheduling take precedence over old drafts.
- Quasar calendar retains durations, working windows, breaks, closures, holiday examples and buffer rules. Date buttons and time ranges are larger; unavailable dates remain disabled. Dashboard mini-calendar retained.
- Status labels explicitly distinguish Termin angefragt / Termin bestätigt / Termin abgesagt. Submitting does not imply practice confirmation. Rescheduling still atomically cancels the old appointment only when a new pending request is successfully saved (demo policy).
- Contact & Anfahrt and opening hours are prominent. `practice-config.ts` is the single practice address/contact source, including consultation and phone hours. Email links use example.invalid; no real recipient. No number was supplied, so phone stays unconfigured instead of inventing a callable number. A configured number automatically produces tel: links.
- Google Maps URLs use api=1, encoded address, optional verified Place ID and no origin. No maps or geolocation load automatically. At the user’s explicit request, the verified public Rathaus Göppingen address (Hauptstraße 1, 73033 Göppingen, Deutschland) is the demo map destination. All address displays label it as the town hall, not a practice. No municipal phone or email is used. The verification gate still blocks unverified future addresses. Address source: https://www.goeppingen.de/GP/kontakt.html Reference: https://developers.google.com/maps/documentation/urls/get-started
- Three original palettes retain their light/dark values but are selected as Waldgrün / Pflaume / Stahlblau. Color no longer changes medical text, services or specialty.
- A separate appearance store persists owner-demo choices under `medicalpractice-appearance-v1`. On first use, it maps the old profile choice to the matching palette without altering the old `medicalpractice-quasar-v1` data. Invalid appearance data falls back safely. Existing `state.theme` remains a legacy field name for the *medical profile only*, preserving compatibility.
- Owner-demo page `/demo/erscheinungsbild` has QColor, HEX validation, independent previews, apply and reset. Custom colors derive separate light/dark surfaces and primary colors, maintaining at least 4.5:1 for tested foreground/surface combinations. Extreme colors may be visibly adapted for readability.
- Public and patient settings expose only Hell / Dunkel / System. Role switches, medical profile changes, failure/conflict injection and reset are in the separate development page. Pending patients can no longer approve themselves from their patient page.
- Existing serif headings, SVG fix, responsive navigation, reduced-motion rules, focus behavior, CMS media contracts, informational pages and clearly marked legal drafts retained.

## Future API contract (draft, not implemented)
`GET /api/v1/practice/appearance` → Appearance `{ version: 1, palette, customPrimary }` plus revision/ETag.
`PATCH /api/v1/practice/appearance` → validated configuration, authenticated owner/authorized admin only; use If-Match/revision to reject concurrent changes. Visitors have read-only access. Reject invalid colors server-side and apply the same contrast policy.
`GET /api/v1/practice/contact` → PracticeContact (`address`, `addressVerified`, optional verified `placeId`, optional `phone`, `email`, consultation and phone hours).
Keep medical content (`PracticeTheme` legacy identifier), site appearance, user display mode and authenticated identity as independent resources. Wagtail edits practice data; Django enforces authorization. localStorage is a demo adapter, not a global multiuser settings service or a security boundary. `AppearanceApi` and `PracticeConfigApi` TypeScript interfaces document these integration points.

## Checks and limits
TypeScript/vue-tsc, ESLint and all 67 automated tests passed. Includes the original 42 checks and 25 new checks: extreme custom colors in both modes, safe migration, independent content/palette, storage failures, map URL encoding and demo-address blocking, phone links, unauthorized booking rejection, conflict-safe rescheduling, pending status and cancellation releasing a slot.
Production build is checked for this release. See VALIDATION.md.
Browser interaction and visual QA at 390/768/1440/1920 px remain unperformed: the required control-browser capability is unavailable in this managed environment. Token tests do not establish WCAG 2.2 AA compliance or verify all rendered Quasar states. Keyboard dialogs, browser back/forward, System mode live updates, mobile wrapping and all six palettes still need visual acceptance. No claim of completed browser/device testing.

## Acceptance walkthrough
1. Open homepage as visitor; use Termin vereinbaren, choose service, one of the nearest days and a time; go back and forward between steps.
2. Review, enter demo account, confirm only a pending request is created. Check Dashboard, details, cancel and rebook.
3. Reschedule an existing appointment; simulate conflict or connection error from owner-demo tools and verify the old record remains active. Return to the calendar, then retry.
4. Register and inspect pending state; browsing stays possible, submission is blocked. Change demo role only on the developer page.
5. In owner-demo settings apply each standard color, then extreme custom colors; check public pages and portal, reload, and change medical profile independently.
6. Confirm telephone is unconfigured, email is explicitly synthetic and Maps buttons open the clearly labeled Rathaus Göppingen demo destination. No external map loads before clicking.
7. Check keyboard focus and dialog return, mobile layout, reduced motion, refresh and browser history, including direct hash URLs and System mode changes.
