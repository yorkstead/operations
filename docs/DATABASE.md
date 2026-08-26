# Database

## Principles

Use PostgreSQL unless an ADR selects otherwise. Migrations are ordered, reviewed, forward-safe, and tested against an empty database and a representative prior schema. Never edit an applied migration.

Every tenant-owned row includes `organization_id` and every unique constraint/index reflects tenant scope where required. Foreign keys, check constraints, explicit enums/reference tables, and transaction boundaries protect invariants. Store timestamps in UTC and present them in organization-local time.

## Data ownership

Each table has one owning module. Cross-module references use stable IDs and documented contracts. Avoid generic JSON for core relational facts; JSON is acceptable for versioned external payloads or genuinely variable configuration with validation.

## Operational requirements

Document backup, restore, retention, archival, deletion, seed, and rollback behavior before production. Demo seeds are deterministic and contain synthetic data only. Production migrations must not depend on demo data.

## Migration checklist

Record purpose, affected tables, lock/rewrite risk, backfill strategy, compatibility window, observability, rollback/roll-forward plan, and verification query.

