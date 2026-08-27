# Truthful Production Readiness Baseline & Module Verification Matrix

## 1. Executive Summary & Baseline Classification
This document establishes the **truthful production baseline** for **Yorkstead Operations** (`https://ops.yorkstead.com`). 

The application implements full PostgreSQL relational persistence schemas (Drizzle ORM), 13 database migration files, persistent server-side identity resolution (`IdentityRepository`), Next.js server route handlers, and UI workspaces. Production readiness is currently blocked by unprovisioned remote cloud database connections, unconfigured object storage vaults, and test suites that execute against service instances rather than live database/HTTP infrastructure.

---

## 2. Standard Test & Verification Tier Definitions

To ensure complete engineering transparency, all modules and capabilities are classified across the following formal verification levels:

- **Unit Tested**: Isolated execution of pure domain logic, value objects, schema validations, and financial/quantity calculations (e.g. integer-cents math, fixed-scale decimal quantities, margin formulas) with zero external database, network, or process dependencies.
- **Integration Tested**: Multi-component interaction verified within an automated test harness (e.g., cross-module domain workflows, service-to-repository calls, transaction rollbacks) running either in-memory or against an isolated test database.
- **Database-Integrated**: Repository queries and schema DDLs written with Drizzle ORM against PostgreSQL tables, capable of executing live SQL queries, row locks (`SELECT ... FOR UPDATE`), and atomic transactions when connected to a live database instance.
- **Verified through Authenticated HTTP**: Route handlers tested by issuing HTTP requests with Better Auth headers/cookies to Next.js API endpoints, verifying parsing, middleware, authorization, and HTTP status codes.
- **Verified through a Browser**: Automated (e.g. Playwright) or manual testing of real user journeys in a browser against a running application server, validating UI components, interactive states, forms, and client navigation.
- **Verified Live in Production**: End-to-end operational functionality verified live on `https://ops.yorkstead.com` against provisioned production infrastructure, real databases, object storage, and observability pipelines.
- **Blocked or Simulated**: Features that currently depend on mocked adapters, in-memory stubs, synthetic seed generators, or unprovisioned external cloud services (e.g., S3 storage bucket, live OCR model, external freight carrier APIs).

---

## 3. Truthful Module Production Readiness Matrix

| Rank | Module / Capability | Implemented | Tested in Memory | Database Integrated | Verified via HTTP | Verified in Browser | Verified Live in Prod | Current Baseline Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | **Core Identity & Auth** | Yes | Yes | Yes | Partial | No | No | **DB-Ready / Tested In-Memory** (Persistent `IdentityRepository` with DB schema & Better Auth) |
| **1** | **Jobs Module** | Yes | Yes | Yes | Partial | No | No | **DB-Ready / Tested In-Memory** (Route tests exist; needs live DB verification) |
| **2** | **ShopFloor Module** | Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `ShopfloorService` directly) |
| **3** | **Inventory Module** | Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `InventoryService` directly) |
| **4** | **Quality & NCR** | Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `QualityService` directly) |
| **5** | **Maintenance Fleet** | Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `MaintenanceService` directly) |
| **6** | **Purchasing & Sourcing**| Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `PurchasingService` directly) |
| **7** | **Shipping & Logistics** | Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `ShippingService` directly) |
| **8** | **Packaging & Pallets** | Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `PackagingService` directly) |
| **9** | **QuoteFlow Estimating** | Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `QuoteService` directly) |
| **10**| **File Storage Vault** | Yes | Yes | Yes | No | No | No | **Provider Implemented / Infrastructure Blocked** (S3-compatible direct upload and authenticated retrieval implemented; R2 bucket and malware scanner unconfigured) |
| **11**| **Knowledge Base (SOP)**| Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (Tests call `KnowledgeService` directly) |
| **12**| **Packet Intelligence** | Yes | Yes | Yes | No | No | No | **Blocked / Simulated** (OCR uses synthetic extraction adapter; tests call service) |
| **13**| **Analytics & Reporting**| Yes | Yes | Yes | No | No | No | **DB-Ready / Tested In-Memory** (SQL aggregation written; tests call service) |

---

## 4. Documented Gaps & Known Issues

1. **Database Readiness Reports `UNAVAILABLE`**:
   - The health endpoint (`/api/health/readiness`) checks live PostgreSQL connectivity with a 2-second timeout. When `DATABASE_URL` is offline or pointing to an unstarted local instance, it returns `database: UNAVAILABLE` and `migrations: UNAVAILABLE`, resulting in an HTTP 503 response in production mode.
2. **Migrations Ledger Live Check Requires Remote Database**:
   - Offline CI validates migration file integrity and deterministic SHA-256 hashes (`bun run db:migrate:check-files`). Live migration status (`scripts/migrate.ts --check-live`) requires a connected database to query `application_migrations`.
3. **Storage Infrastructure and Malware Scanning Are Not Configured**:
   - S3-compatible presigned upload, completion verification, and authenticated streaming download paths are implemented. Production still reports `storageVault: NOT_CONFIGURED` until the private R2 bucket is configured. New uploads remain `pending_scan` and cannot be downloaded until a real scanner marks them clean.
4. **Workflow Tests Call Application Services Directly**:
   - The majority of test files in `tests/` instantiate and invoke domain services (`JobService`, `ShopfloorService`, `PurchasingService`, etc.) in-memory. They do not execute HTTP requests against Next.js route handlers with live database transactions.
5. **Lifecycle Test Is an In-Memory Workflow Test**:
   - `tests/e2e-manufacturing-lifecycle.test.ts` exercises domain logic sequentially in-memory within a single Bun process. It is an integration workflow test, not a true end-to-end browser or HTTP test against live infrastructure.
   - A separate Playwright smoke suite now verifies public rendering, measured phone overflow, login form accessibility, and anonymous API denial. Authenticated multi-module browser coverage remains a release blocker.
6. **Synthetic Fixture Read Contamination Removed (Code Verified)**:
   - Repository and in-memory service read paths no longer invoke legacy seed helpers. Empty tenant workspaces return empty results, while test fixtures require explicit test-runtime setup and demo seeding requires `isDemo: true`.
   - This is verified by source-contract and service tests. PostgreSQL query/write-count verification remains part of the database integration release gate.
7. **API Error Disclosure Boundary Implemented (Code Verified)**:
   - API route failures now pass through one structured response boundary that returns stable public error codes and correlation IDs without returning exception messages, database details, credentials, tenant identifiers, or stack traces.
   - Sanitized structured server logs retain the correlation ID for investigation. Source-contract and behavior tests enforce the boundary; production log transport and alerting still require hosted verification.

---

## 5. Release-Blocker Checklist (Ordered by Severity)

### P0 — Release Blockers (Must resolve before any live production deployment)
- [ ] **P0-1: Live Database Provisioning & Migration Execution**
  - Provision production PostgreSQL database (Neon / Supabase / RDS).
  - Execute `bun run db:migrate` against the live connection.
  - Verify `/api/health/readiness` returns HTTP 200 with `status: "READY"`, `database: "CONNECTED"`, `migrations: "CURRENT"`.
- [ ] **P0-2: Production Environment & Secret Configuration**
  - Configure production `BETTER_AUTH_SECRET` (high-entropy >= 32 character key).
  - Configure HTTPS endpoints for `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`.
  - Validate that `lib/env.ts` `validateProductionRuntime` passes without errors.

### P1 — Critical Blockers (Required for production functional integrity)
- [ ] **P1-1: Production Cloud Storage Vault Configuration**
  - Configure a private R2 bucket, least-privilege S3-compatible credentials, and exact origin CORS policy.
  - Configure a malware-scanning adapter and an authorized clean/quarantine completion transition.
  - Verify `/api/health/readiness` reports `storageVault: "CONNECTED"` through a non-destructive capability check.
- [ ] **P1-2: Database-Backed HTTP Integration Test Suite**
  - Create integration test runner executing against a real PostgreSQL test database.
  - Exercise API route handlers (`/api/jobs/*`, `/api/shopfloor/*`, `/api/inventory/*`, etc.) with authentic session cookies.
  - CI now includes a first PostgreSQL identity-repository persistence/IDOR test and browser smoke suite. The authenticated route matrix is not yet complete.

### P2 — High Priority (Architectural & Data Hygiene)
- [x] **P2-1: Remove Synthetic Seeding from Read Query Paths**
  - Remove `ensureSeededData` calls from repository `find` and `list` methods.
  - Relocate synthetic fixture seeding exclusively to explicit onboarding or demo setup endpoints.
- [x] **P2-2: Prevent Internal Error Disclosure from API Routes**
  - Centralize safe client error responses with stable codes and request correlation IDs.
  - Redact sensitive values from structured server diagnostics and enforce the rule with source-contract tests.

### P3 — Medium Priority (Operational Quality & External Integrations)
- [ ] **P3-1: End-to-End Browser Automation Suite**
  - Implement Playwright test suite verifying critical operator journeys (login, job creation, traveler execution, dispatch) on desktop and narrow-screen layouts.
- [ ] **P3-2: Live External Adapters (OCR & Freight Tracking)**
  - Integrate live Document AI / OCR extraction service for engineering drawings.
  - Integrate live carrier tracking APIs for shipping manifest updates.

---

## 6. Required Production Environment Configuration

| Variable Name | Required Scope | Production Rule / Validation | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Server | Must be `"production"` | Activates production optimizations, strict health gates, and caching. |
| `NEXT_PUBLIC_APP_NAME` | Client/Server | Defaults to `"Yorkstead Operations"` | Application display name. |
| `NEXT_PUBLIC_APP_URL` | Client/Server | Must use `https://` (e.g. `https://ops.yorkstead.com`) | Public application base URL. |
| `DATABASE_URL` | Server | Remote PostgreSQL connection string with SSL/TLS | Primary relational data store connection. |
| `BETTER_AUTH_SECRET` | Server | Cryptographic random secret >= 32 characters | Session signing and token hashing. |
| `BETTER_AUTH_URL` | Server | Must use `https://` (e.g. `https://ops.yorkstead.com`) | Auth callback and token verification root. |
| `S3_ENDPOINT` | Server | HTTPS S3-compatible endpoint | Object storage API endpoint. |
| `S3_REGION` | Server | Defaults to `auto` | S3 signing region. |
| `S3_BUCKET` | Server | Private bucket only | Stores tenant-prefixed file objects. |
| `S3_ACCESS_KEY_ID` | Server | Least-privilege secret; never exposed to the client | Signs object operations. |
| `S3_SECRET_ACCESS_KEY` | Server | Least-privilege secret; never exposed to the client | Signs object operations. |

---

## 7. Assumptions & Unresolved Risks

1. **Local Test Environment Assumption**:
   - All automated tests currently execute in-memory or against synthetic mocks without requiring live external network connectivity or local PostgreSQL daemons.
2. **Demo Sandbox Assumption**:
   - Demo organizations (`org_demo_*`) are explicitly designed to execute in-memory with zero side effects, allowing safe demonstration workflows without database dependencies.
3. **External Service Fallback Risk**:
   - Drawing OCR extraction and cited SOP search currently operate via local deterministic heuristic parsers; live cloud model outages will require graceful degradation to these fallback parsers.
