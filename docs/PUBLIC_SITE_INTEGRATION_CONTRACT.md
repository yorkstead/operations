# Public Site Integration Contract

## Authority & Cross-Repository Boundary
This document governs the integration contract, ownership boundary, and handoff protocols between the public corporate website (`https://yorkstead.com`, repository: `yorkstead-website`) and the operations application (`https://ops.yorkstead.com`, repository: `yorkstead-operations`).

---

## 1. Repository Ownership Matrix

| Concern / Responsibility | Owning Repository | Deployment Target | Authority |
| :--- | :--- | :--- | :--- |
| **Public Company Website** | `yorkstead-website` | `https://yorkstead.com` (Netlify) | Authoritative public marketing, case studies, solutions narrative, and contact intake. |
| **Operations Platform & Demos** | `yorkstead-operations` | `https://ops.yorkstead.com` (Netlify / Vercel) | Authoritative multi-tenant ERP/MES engine, domain APIs, deterministic demo sandboxes, and database. |
| **Demo Status & Manifest API** | `yorkstead-operations` | `https://ops.yorkstead.com/api/public/demo-health` | Public unauthenticated read-only endpoint reporting scenario availability and health. |
| **Brand Styling & Monogram** | Shared / `docs/VISUAL_SYSTEM.md` | Both | Authoritative visual system; zero unauthorized drift. |

---

## 2. Security & Data Isolation Boundaries

1. **Zero Shared Databases & Sessions**:
   - The public website (`yorkstead.com`) possesses **zero database credentials, connection strings, ORM access, or direct storage secrets**.
   - No user session tokens, session cookies, or JWT signing keys are shared across the `yorkstead.com` and `ops.yorkstead.com` domains.
2. **Privilege Boundary**:
   - Public pages can never invoke privileged administrative or destructive actions (such as dropping databases or executing live payments).
   - Demo resets triggered from the public site must pass through the authenticated rate-limited demo boundary on `ops.yorkstead.com`.
3. **CORS & Frame Policy**:
   - API endpoints under `/api/public/*` only allow CORS requests originating from `https://yorkstead.com` (and `http://localhost:3000` in development).
   - Embedded frames (if enabled) are guarded by `Content-Security-Policy: frame-ancestors 'self' https://yorkstead.com`.

---

## 3. Canonical Demo URLs & Deep Linking

- **Canonical Demo Hub**: `https://ops.yorkstead.com/demo`
- **Supported Scenario Deep Links**:
  - Front Range Precision Manufacturing: `https://ops.yorkstead.com/demo?scenario=front-range-manufacturing`
  - Summit Facility Services: `https://ops.yorkstead.com/demo?scenario=summit-facility-services`
  - Mile High Signworks: `https://ops.yorkstead.com/demo?scenario=mile-high-signworks`
  - Peak Mobile Detail: `https://ops.yorkstead.com/demo?scenario=peak-mobile-detail`

---

## 4. Public Demo Health & Status Manifest

The operations platform exposes a lightweight JSON health manifest at `GET /api/public/demo-health`:
```json
{
  "status": "operational",
  "version": "1.0.0",
  "timestamp": "2026-08-25T21:45:00.000Z",
  "scenarios": [
    {
      "slug": "front-range-manufacturing",
      "name": "Front Range Precision Manufacturing",
      "status": "available",
      "canonicalUrl": "https://ops.yorkstead.com/demo?scenario=front-range-manufacturing",
      "storyStageCount": 4
    }
  ]
}
```

---

## 5. Offline & Unavailability Fallback Contract

When `ops.yorkstead.com` is undergoing scheduled database maintenance or deterministic seed rebuilds:
1. `yorkstead.com` falls back gracefully to high-density static case study breakdowns, UI walkthrough screenshots, and workflow step diagrams.
2. The user is presented with an operational badge: `[DEMO SANDBOX REFRESHING // STATIC PREVIEW ACTIVE]`.
3. Zero blank screens, broken frames, or uncaught JavaScript exceptions.

---

## 6. Version Compatibility & Governance

- **Publishing & Unpublishing Scenarios**:
  - Introducing or retiring a demo scenario requires updating both the scenario manifest in `yorkstead-operations` and the showcase cards in `yorkstead-website`.
  - Deprecated scenario slugs must return a `308 Permanent Redirect` to `https://ops.yorkstead.com/demo` rather than a `404 Not Found`.
