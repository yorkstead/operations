# Yorkstead Operations

The commercial operations application built by **Yorkstead Systems** (`https://yorkstead.com`) for precision manufacturing, commercial fabrication, and field service workflows.

> [!NOTE]
> **Hosting & Deployment**: Deployed on **Vercel** at `https://ops.yorkstead.com`.
> Public website is deployed on **Netlify** at `https://yorkstead.com`.
> Both persistent vertical slices (Jobs + ShopFloor) run on PostgreSQL with Drizzle ORM and Better Auth server-derived tenancy.

---

## Implemented Workflows & Modules

- **Core Persistent Slices (PostgreSQL & Better Auth)**:
  - **Jobs Module (`/jobs`, `/api/jobs`)**: Canonical work order aggregate, revision locks, integer labor hours, and atomic audit logging.
  - **ShopFloor Module (`/shopfloor`, `/api/shopfloor/*`)**: Mobile Digital Traveler dispatch, station timers, blocker signals, and operator attribution.
- **Foundation & Verification**:
  - Architecture Decision Records (`docs/adr/ADR-0001` through `ADR-0008`)
  - Authoritative Design System & Dark/Light Tokens (`docs/VISUAL_SYSTEM.md`)
  - Real-Time Diagnostic Scoring Engine & Printable Executive Audit (`/audit`)
  - Interactive Demo Sandbox with Golden State Reset (`/demo`)
  - Public Demo Health & CORS-Guarded Status (`/api/public/demo-health`)
  - Operational Readiness Endpoint (`/api/health/readiness`)

---

## Toolchain & Quality Gates

- **Runtime & Package Manager**: `bun` (v1.3.14)
- **Framework**: `Next.js 16.3` with Turbopack & React 19
- **Typecheck**: `bun run typecheck` (`tsc --noEmit`)
- **Lint**: `bun run lint` (`eslint .`)
- **Automated Tests**: `bun test` (126 tests across 39 suites)
- **Database Migrations**: `bun run db:migrate:check`
- **Production Build**: `bun run build`

---

## Deployment & Documentation

- See `docs/DEPLOYMENT.md` for live hosting configuration, domain aliases, and endpoint verification.
- See `docs/ARCHITECTURE.md` for domain aggregate boundaries and service design rules.
- See `docs/VISUAL_SYSTEM.md` for authoritative design tokens.
- See `docs/PRODUCTION_READINESS.md` for the module migration matrix.
