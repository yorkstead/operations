# Architecture

## Direction

Use a production-ready modular monolith: one application and deployment unit with strongly separated business modules. This reduces operational overhead while keeping future service extraction possible.

## Layers

- `app/`: routing, request boundaries, page composition
- `modules/<name>/domain`: entities, value objects, policies, domain events
- `modules/<name>/application`: commands, queries, workflows, ports
- `modules/<name>/infrastructure`: persistence and external adapters
- `modules/<name>/ui`: module-specific presentation
- `components/`: stable cross-module visual primitives
- `lib/`: technical utilities with no business ownership
- `db/`: shared database mechanics and migrations

Create subfolders only when implementation needs them.

## Core ownership

Core owns organizations, users/memberships, roles/capabilities, customers, vendors, locations, feature entitlements, files metadata, notifications, integrations, and shared identifiers. Business modules own their records and rules.

Modules may read another module through a public query contract. Cross-module mutations go through explicit services or events; never reach into another module’s private tables from route code.

## Required boundaries

Organization context must be explicit in every tenant operation. Use transactions for workflows that must succeed atomically. Prefer an outbox for reliable asynchronous side effects. Use stable IDs, UTC storage, clear money/quantity units, and immutable operational event records where appropriate.

## Deployment relationship

`yorkstead.com` (`yorkstead-website`) and `ops.yorkstead.com` (`yorkstead-operations`) deploy independently. Public pages link to safe demo entry points or approved screenshots. No shared database or implicit session.

## Decision records
 
Create `docs/decisions/NNNN-title.md` before resolving architectural conflicts. Include context, decision, alternatives, consequences, migration/rollback, and status. See [`docs/decisions/README.md`](decisions/README.md) for the active index and [`docs/decisions/template.md`](decisions/template.md) for the standard format.
