# ADR 0008: Shopfloor Digital Traveler Persistence & Station Execution

## Status
Accepted

## Context
Following the completion of the Jobs persistence foundation (ADR 0007), the ShopFloor module is the natural next operational slice. In physical manufacturing and operations, work orders are released to the shopfloor as Digital Travelers composed of sequential station operations (laser cutting, press brake forming, welding, inspection, packaging).

## Decision
1. **Drizzle ORM & PostgreSQL Persistence**:
   - `work_centers`: Master station records with hourly cost rates.
   - `shopfloor_travelers`: Digital traveler aggregate carrying `organization_id`, `job_id`, `traveler_number`, `qr_code_data`, and workflow status.
   - `traveler_operations`: Sequential operation steps (e.g. seq 10, 20, 30) with operator attribution, labor minutes, and scrap tracking.
   - `traveler_blockers`: Exception and friction records alerting dispatch management.
2. **Strict Multi-Tenant Query Boundaries**:
   All database queries filter by `organization_id` derived exclusively from server-verified Better Auth sessions.
3. **Atomic Operations & Audit Logging**:
   Starting an operation, completing a step, reporting a blocker, and resolving blockers execute in atomic database transactions that record immutable audit entries in `audit_events`.
4. **Isolated Demo Mode Support**:
   Demo organizations operate against an in-memory synthetic traveler repository with zero side effects in production customer databases.

## Consequences
- Operators can reliably track real-time machine execution, station transitions, and scrap rates.
- Cross-tenant IDOR access is prevented server-side.
- The Shopfloor terminal UI truthfully reflects persistent database state.
