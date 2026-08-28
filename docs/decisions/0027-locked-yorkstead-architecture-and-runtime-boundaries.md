# ADR-0027: Locked Yorkstead Platform Architecture and Runtime Boundaries

- **Status**: ACCEPTED
- **Date**: 2026-08-28
- **Author(s)**: Yorkstead Engineering
- **Approver(s)**: Lead Architect / Repository Owner
- **Related Prompts / Issues**: Yorkstead Consolidation Prompt Series (Prompts 1 & 2)
- **Supersedes**: ADR-0006 (public site integration contract)
- **Superseded By**: None

---

## Context and Problem Statement

The Yorkstead platform consists of two distinct Next.js applications:
1. `apps/website` (`yorkstead.com`): The public marketing, conversion authority, lead intake surface, and the private owner Command Center at `/dashboard`.
2. `apps/operations` (`ops.yorkstead.com`): The internal modular monolith operations ERP and synthetic demo sandbox runtime.

During historical development and hosting transitions, disparate statements accumulated regarding Netlify, Vercel, Cloudflare Pages/Workers, and Google Cloud Run. Additionally, accidental deployment configurations (such as attempting to run `apps/operations` on Cloudflare Pages) caused deployment failures and violated core architecture rules.

A definitive, immutable architecture decision is required to lock runtime boundaries, hosting platforms, data isolation, and deployment discipline.

---

## Decision

### 1. Locked Domain & Application Roles

- **`yorkstead.com`**:
  - The single visible customer-facing Yorkstead website.
  - Houses all sales material, service explanations, industrial automation cases, quoting models, demo introductions, engagement paths, and contact intake.
  - Hosts the private `/dashboard` route as the private owner Command Center.
  - Approved for deployment exclusively to a Cloudflare Worker edge runtime.
- **`ops.yorkstead.com`**:
  - The protected Yorkstead Operations application, customer ERP, and synthetic demo runtime.
  - Approved for deployment exclusively to **Google Cloud Run** as an intact Next.js modular monolith container (`docker/operations.Dockerfile`).
  - Strict prohibition: **Do not deploy Yorkstead Operations to Cloudflare Workers or Cloudflare Pages.**

### 2. Strict Boundary Isolation

- **Application & Deployment**: `apps/website` and `apps/operations` remain separate applications with independent build pipelines, deployment configurations, and failure domains.
- **Merge Prohibition**: **Do not merge `apps/website` and `apps/operations` into a single application** without an explicit, approved architectural decision.
- **Authentication & Sessions**: Separate authentication boundaries, cookie sessions, and WebAuthn Relying Party IDs (`yorkstead.com` vs `ops.yorkstead.com`). No shared session tokens or shared session cookies.
- **Database & Storage**: Independent Neon PostgreSQL databases. No shared relational schemas or shared database access credentials across applications.
- **Environment & Secrets**: Distinct environment variable sets, secret managers, and runtime execution contexts.

### 3. Public Demo vs Protected Demo Execution

- Public website pages on `yorkstead.com` display high-converting product explanations, static demo walkthroughs, and engagement introductions.
- Interactive, multi-tenant synthetic sandboxes (`demo_mile_high_signworks`, `demo_summit_facility`, `demo_front_range_mfg`) execute strictly inside `apps/operations` on Cloud Run under isolated tenant policies with deterministic golden resets.

### 4. Cloudflare Platform Responsibilities

- Cloudflare provides authoritative DNS, TLS termination, CDN caching, Web Application Firewall (WAF), rate limiting, and request routing for both `yorkstead.com` and `ops.yorkstead.com`.
- For `ops.yorkstead.com`, Cloudflare acts strictly as a reverse proxy forwarding requests to the Google Cloud Run origin.

### 5. Historical vs Authoritative State

- Historical statements referencing Netlify as the production website host or Vercel as the operations host represent legacy pre-migration baselines.
- Vercel is decommissioned (`yorkstead-operations.vercel.app` returns `DEPLOYMENT_NOT_FOUND`).
- The authoritative target is Cloudflare Workers (`yorkstead.com`) and Google Cloud Run behind Cloudflare (`ops.yorkstead.com`). Operational state must be recorded separately from this target decision and supported by dated deployment and live-route evidence.

---

## Architectural & Security Invariants

1. **Modular Monolith Integrity**: Yorkstead Operations remains a single deployable modular monolith. Do not prematurely decompose modules into microservices.
2. **Tenant Isolation**: Every database query and business mutation in `apps/operations` is strictly bounded by `session.activeOrganization.id` verified server-side.
3. **Demo Isolation & Safety**: Demo tenants cannot write production objects, execute external side effects (e.g. real emails or charges), or modify Tenant 0 records.
4. **Private Files Default**: File storage (Cloudflare R2 via S3 API) stores private objects accessible only through authorized, time-limited presigned URLs.
5. **Audit Trail**: Security-sensitive administrative and operational actions generate structured audit log entries.

---

## Release, Rollback, and Verification Gates

All production promotions must satisfy the following gates:

1. **Local & CI Verification**:
   - `git diff --check` passes with no whitespace or merge artifacts.
   - `bun run typecheck` passes across both workspaces.
   - `bun run test` passes (unit and vertical-slice tests).
   - Container builds (`docker/operations.Dockerfile` and `docker/worker.Dockerfile`) succeed.
2. **Deterministic Migrations**:
   - Database migrations are hashed and validated in `migrations-manifest.ts` before container release.
3. **Health & Liveness Probes**:
   - `/api/health/live`: Process-level liveness probe returning HTTP 200 without external dependency checks.
   - `/api/health/readiness`: Verifies database connectivity, migration alignment, storage vault status, and tenant isolation policies before receiving traffic.
4. **Rollback Discipline**:
   - Cloud Run revisions are immutable and tagged by Git commit SHA, allowing instant 1-click rollback via traffic splitting or revision reactivation.
   - Cloudflare DNS and routing configurations must maintain documented fallback origins until stabilization windows conclude.

---

## Verification Evidence

- At the time of the decision, Cloud Run staging service `yorkstead-operations-staging` was available at `https://yorkstead-operations-staging-zb3wrmhsja-uc.a.run.app`; its deployed image and health must be re-checked for each release.
- A staging process health probe returned HTTP 200. This did not prove production-domain routing, database readiness, authentication, or demo behavior.
- Cloudflare authoritative DNS verified for `yorkstead.com` (`lara.ns.cloudflare.com`, `langston.ns.cloudflare.com`).
