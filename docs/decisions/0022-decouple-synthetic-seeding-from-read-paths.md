# ADR 0022: Decouple Synthetic Seeding from Read Query Paths

## Status
Accepted

## Context
Previously, several repositories and domain services contained `ensureSeededData` or `ensure*Seeded` methods that automatically inserted synthetic records (such as sample files, placeholder quotes, default equipment, or seed purchase orders) whenever a read query returned empty results. This behavior contaminated new production customer organizations upon their first page view and violated the architectural principle of zero side-effects on read paths.

## Decision
1. **Zero Side-Effects on Read**:
   - All `ensureSeededData` calls are removed from repository `find`, `get`, `list`, and `metrics` methods.
   - Reading an empty customer organization returns empty results without performing database writes.
2. **Explicit Demo Seeding Service**:
   - Synthetic data generation is consolidated into `DemoSeedingService.seedDemoOrganization()`.
   - Seeding requires explicit execution and strictly checks `isDemo: true`. Seeding production organizations (`isDemo: false`) is rejected with a forbidden error.
3. **Idempotency & Tenant Scoping**:
   - Demo seeding operations are idempotent, strictly scoped to the active tenant ID, and logged to `audit_events`.
4. **Non-Destructive Remediation**:
   - Established `docs/SYNTHETIC_DATA_REMEDIATION.md` outlining the diagnostic inspection procedure without running destructive automated cleanups.

## Consequences
- **Positive**: Clean production tenant isolation, zero synthetic contamination on customer page loads, auditable and safe demo environments.
- **Negative**: Demo tenants must be explicitly seeded during bootstrap or sandbox initialization.
