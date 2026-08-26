# ADR 0020: Persistent Identity, Tenant Memberships, and Server-Side Session Validation

## Status
Accepted

## Context
Previously, server session resolution authenticated requests via Better Auth but looked up user memberships and active organization contexts through a process-local in-memory `IdentityService`. In serverless and multi-instance production environments (e.g. Vercel / Netlify / container autoscaling), process-local memory is transient, leading to session drift, inability to persist new memberships across instances, and potential security vulnerabilities if client-supplied active organization cookies are not validated against persistent database memberships on every request.

## Decision
1. **Persistent PostgreSQL Identity Boundary**:
   - User identities (`user`), organizations (`organizations`), and tenant memberships (`memberships`) are queried and persisted directly in PostgreSQL tables using Drizzle ORM (`IdentityRepository`).
2. **Server-Side Active Organization Validation**:
   - On every request, `resolveServerSession()` checks the requested active organization against the user's active memberships in PostgreSQL.
   - If the user has no membership in the requested organization, or if the organization is inactive, access is denied (`403 Forbidden`). Client-supplied organization IDs are never trusted without database-backed membership verification.
3. **Single First-Owner Bootstrap Guardrail**:
   - The initial owner provisioning workflow is guarded by a database check (`organizations.isDemo = false`). Once an owner exists, subsequent public bootstrap requests are strictly rejected with an error. Further members must be provisioned via authenticated invitation workflows.
4. **Separation of Demo Sandbox from Production Identity**:
   - Demo organizations (`org_front_range_mfg`, etc.) operate in an isolated sandbox with synthetic state and zero database side-effects. Production tenant requests strictly query persistent PostgreSQL identity tables.
5. **Auditing**:
   - Security-relevant identity events (owner bootstrapping, organization creation, membership removal) write immutable records to `audit_events` with sanitized metadata (no secrets, passwords, or session tokens).

## Consequences
- **Positive**: Durable multi-tenant isolation, safe serverless scaling across independent runtime instances, zero trust in client-supplied tenant cookies, tamper-proof single-owner bootstrap guardrail.
- **Negative**: Adds database queries to session resolution (mitigated via index on `(user_id, organization_id)`).
