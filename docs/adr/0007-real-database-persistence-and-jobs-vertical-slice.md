# ADR 0007: Real Database Persistence, Server Tenancy, and Jobs Vertical Slice

## Status
Accepted

## Context
Yorkstead Operations previously operated primarily on in-memory state stores and synthetic fixture mocks. To establish production-shaped multi-tenant engineering foundations without prematurely converting all modules at once, we need one end-to-end vertical slice:
Authenticate → Select Organization → Create Job → Persist in PostgreSQL → Record Audit Event Atomically → Reload and Retrieve → Deny Cross-Tenant Access.

## Decision
1. **Server-Derived Identity & Tenancy Context**:
   The acting user and active organization membership are strictly derived server-side from verified Better Auth session tokens/cookies. Client requests are never allowed to provide or trust a user ID or organization ID directly in request bodies.
2. **Every Tenant-Owned Row Carries `organization_id`**:
   All persisted tenant records (`jobs`, `job_timeline_events`, `job_revisions`, `audit_events`, `memberships`) carry a foreign key or index on `organization_id` which is verified at the database query boundary.
3. **Atomic Transaction for Job Creation & Audit Logging**:
   Every state-altering mutation (job creation, job transition) executes inside an atomic PostgreSQL database transaction ensuring that entity state and immutable audit trail records commit or roll back together.
4. **Immutable Ordered Migrations & Genuine Checksum Runner**:
   Application schema changes are maintained as numbered, sequential SQL files in `migrations/`. `scripts/migrate.ts` verifies and enforces SHA-256 checksums in `--check` mode and records applied migration hashes in `application_migrations`.
5. **Clean Segregation of Synthetic Demo Path**:
   Demo organizations (`org_front_range_mfg`, etc.) remain supported via an isolated mock adapter path that produces zero side effects and prevents cross-tenant data leakage.

## Consequences
- Authentic multi-tenant persistence is established with zero client-side privilege escalation risk.
- Cross-tenant identifier guessing (IDOR) is prevented server-side and tested automatically.
- Future modules (inventory, quality, maintenance, shipping) can cleanly adopt the exact same repository and session context patterns.
