# ADR 0021: Atomic PostgreSQL Migration Execution, Advisory Locking, and Readiness Gating

## Status
Accepted

## Context
Previously, the migration runner split SQL files on semicolons and executed individual statements sequentially outside an atomic transaction. This naive splitting could fail on procedural SQL, multi-line functions, triggers, or comments containing semicolons, and left the database in a partially-applied corrupted state if an intermediate statement failed. Additionally, concurrent deployments on serverless platforms (e.g. Vercel / Netlify / autoscaled containers) risked racing migrations without synchronization locks.

## Decision
1. **Atomic Transaction Execution**:
   - Each migration file is executed as a single uninterrupted script inside a dedicated PostgreSQL transaction (`BEGIN; ... <migration_sql> ... INSERT INTO application_migrations ... COMMIT;`).
   - If any statement inside a migration fails, the entire migration and ledger insertion are automatically rolled back (`ROLLBACK;`), preventing partial schema corruption.
2. **PostgreSQL Advisory Locking**:
   - The runner acquires a 32-bit PostgreSQL advisory lock (`pg_try_advisory_lock(883749219)`) before inspecting or applying migrations.
   - If another runner holds the lock, the process fails safely rather than causing race conditions or deadlocks. The lock is released in a `finally` block upon completion.
3. **Checksum Drift & Sequence Validation**:
   - Applied migrations are strictly immutable. If a recorded migration's checksum differs from the local file, or if a migration is missing or reordered, the runner aborts with an explicit drift error.
4. **Readiness Endpoint Gating**:
   - `/api/health/readiness` accurately distinguishes:
     - `database: UNAVAILABLE` (database offline or unreachable)
     - `migrations: BEHIND` (reachable but pending unapplied migrations)
     - `migrations: MISMATCH` (checksum drift or altered recorded migrations)
     - `migrations: CURRENT` (all 13 expected migrations applied and matching)
5. **CI Service Verification**:
   - GitHub Actions CI boots an isolated PostgreSQL 17 service container and executes `bun run db:migrate` twice to enforce atomic application and idempotency.

## Consequences
- **Positive**: Zero partial migrations, concurrent execution safety, deterministic checksum auditing, and truthful health readiness reporting.
- **Negative**: Requires transactional DDL support (fully supported by PostgreSQL).
