# ADR 0006: Public Site Integration Boundary and Cross-Repository Contract

## Status
Accepted

## Context
Yorkstead operates two distinct web properties:
1. `yorkstead.com`: The static public company marketing and solutions website (`yorkstead-website`).
2. `ops.yorkstead.com`: The dynamic multi-tenant industrial operations application and deterministic demo sandbox (`yorkstead-operations`).

We require a clear architectural handoff, deep-linking specification, and data boundary that prevents security vulnerabilities, eliminates cross-site credential leakage, and ensures graceful fallback when sandbox environments are resetting.

## Decision
1. **Decoupled Architecture**:
   `yorkstead-website` and `yorkstead-operations` remain separate repositories and separate deployments. No direct database, ORM, or credential sharing is permitted.
2. **Public Health & Manifest Contract**:
   `yorkstead-operations` provides an unauthenticated, rate-limited public endpoint at `/api/public/demo-health` exposing scenario availability, canonical deep-links, and version status.
3. **Safe Deep Linking & Frame Ancestor Controls**:
   All public links into demo workflows use canonical URL parameters (`/demo?scenario=<slug>`). Direct frame embedding is restricted to `https://yorkstead.com` via strict CSP headers.
4. **Offline Static Fallbacks**:
   When live demo sandboxes are inaccessible, public pages fall back to static screenshot carousels and verified metric summaries.
5. **No Broken Links**:
   Retired demo scenarios must redirect gracefully to the root demo hub.

## Consequences
- Clean separation of concerns between marketing presentation and transactional backend logic.
- Total protection against credential leakage from marketing site dependencies.
- Reliable evaluator experience during automated sandbox resets.
