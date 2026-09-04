# Operations header

Updated 2026-09-04. Scope: the shared Operations header and routing alignment;
Analytics Engine is designated as the primary landing page, and Cockpit, Projects,
and Engagements are relocated to the Modules menu under Executive & Projects.

## Layout and behavior

- At 1024px and wider, brand/workspace controls occupy a separate top row.
  The primary navigation row features Analytics Engine (`/analytics`) as the
  default landing destination.
- Modules retains desktop destinations grouped into Executive & Projects,
  Production & Shopfloor, Sourcing & Quality, and Intelligence & Platform.
- Cockpit (`/cockpit`), Projects (`/projects`), and Engagements (`/engagements`)
  reside under Executive & Projects, marked with passkey authentication badges (`KeyRound`).
- Root path `/` redirects to `/analytics` so public visitors and demo sessions
  land directly on the Analytics Engine without hitting owner login boundaries.
- Active links match the current pathname or nested routes. When a module is active,
  its name appears beside Modules.
- The existing Radix dependency provides keyboard navigation, focus restoration,
  Escape, and outside dismissal. Selecting a destination closes the menu.
- Below 1024px, the mobile navigation panel reflects this structure, highlighting
  Analytics Engine as the Landing Page and grouping Cockpit, Projects, and
  Engagements with passkey badges.
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
