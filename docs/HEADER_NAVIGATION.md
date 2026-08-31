# Operations header

Updated 2026-08-31. Scope: the shared Operations header only; workspace switching,
notifications, authorization, tenant data, and route destinations are unchanged.

## Layout and behavior

- At 1024px and wider, brand/workspace controls occupy a separate top row.
  Cockpit, Engagements, Jobs, Shopfloor, Inventory, and Analytics occupy the
  navigation row below. The version badge was removed from the header.
- Modules retains every other previous desktop destination, grouped into
  Factory Operations, Business & Knowledge, and Platform & Tools.
- Active links match the current pathname or nested routes. Cockpit matches
  only `/`. When a module is active, its name appears beside Modules.
- The existing Radix dependency provides keyboard navigation, focus restoration,
  Escape, and outside dismissal. Selecting a destination closes the menu.
- Below 1024px, the existing mobile navigation remains available. Below 768px,
  the brand mark appears without its wordmark so workspace controls fit.
- No existing global visual identity was changed. Colors, fonts, logo assets,
  surface tokens, and global styles are unchanged.

## Verification

- Typecheck, lint, production build, and all 15 offline migration checks passed.
- Dependency audit reports one existing moderate transitive esbuild advisory
  (GHSA-67mh-4wv8-2f99); no dependencies or lockfiles were changed.
- Unit/security suite: 324 passed; six existing deployment configuration tests
  fail because this standalone checkout lacks the monorepo-relative files they
  reference. The header does not participate in those assertions.
- `tests/browser/header.e2e.ts` covers desktop control/navigation separation and
  non-overlap at 1024, 1280, 1440, and 1920px; compact controls and mobile menu
  at 320, 360, 390, 640, 768, and 1023px; module keyboard behavior, outside
  dismissal, navigation, and active state. Run with the existing browser suite.
  All three tests passed in three consecutive repeat runs (nine passes). An
  initial focus assertion failed while the build was running; subsequent runs
  passed without changing the assertion or implementation.
- Local browser review used `/demo` and `/login`; no authenticated customer
  workflow was exercised. No live deployment or domain verification performed.

Next review: confirm the six pinned desktop destinations match daily operator
use before changing their order or deploying this header.

## Main integration verification

The newer main-branch theme toggle is preserved in the controls row. The phone
workspace name truncates at 80px on the smallest phones and 110px from 360px
to leave room for that control. The keyboard test waits for the hydrated shell
and establishes keyboard input before checking menu focus.
After integrating main's deployment-test corrections, all 329 unit/security
tests pass; the six failures recorded above describe the pre-integration run.
