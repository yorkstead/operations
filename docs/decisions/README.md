# Architecture Decision Records (ADRs)

Architecture Decision Records capture significant architectural, structural, security, data-boundary, and operational decisions in Yorkstead Operations.

## When to write an ADR

Write an ADR when:
- Selecting or modifying frameworks, databases, or runtime toolchains
- Introducing, removing, or redefining a module boundary
- Changing tenant isolation, authentication, or authorization models
- Establishing data migration, backup, or deletion policies
- Introducing external integration patterns, protocols, or third-party dependencies
- Encountering an architectural conflict or requirement not covered by existing decisions
- Deviating from existing patterns established in `AGENTS.md` or `docs/ARCHITECTURE.md`

## ADR Lifecycle

1. **PROPOSED**: Drafted during a prompt session or design review when an architectural question arises. Implementation that depends on the decision must pause until reviewed.
2. **ACCEPTED**: Approved by the repository owner/lead engineer. The decision is authoritative and binding for future prompts.
3. **REJECTED**: Considered but discarded with clear reasoning recorded.
4. **SUPERSEDED**: Replaced by a newer ADR (e.g., `Superseded by ADR-0005`).
5. **DEPRECATED**: No longer applicable due to system evolution.

## Numbering and File Format

- Files are named `NNNN-short-title.md` with zero-padded 4-digit numbers (e.g., `0001-engineering-contract-and-governance.md`).
- Use `template.md` as the starting point for every new record.

## Index of Decisions

| ADR | Title | Status | Date |
| --- | --- | --- | --- |
| [0001](0001-engineering-contract-and-governance.md) | Engineering Contract, Governance, and Decision Workflow | ACCEPTED | 2026-08-24 |
| [0002](0002-platform-foundation-and-toolchain.md) | Platform Foundation, Runtime Stack, and Toolchain | ACCEPTED | 2026-08-25 |
| [0020](0020-persistent-identity-and-tenant-membership.md) | Persistent Identity and Tenant Membership | ACCEPTED | 2026-08-26 |
| [0021](0021-atomic-database-migrations-and-readiness.md) | Atomic Database Migrations and Readiness | ACCEPTED | 2026-08-26 |
| [0022](0022-decouple-synthetic-seeding-from-read-paths.md) | Decouple Synthetic Seeding from Read Query Paths | ACCEPTED | 2026-08-26 |
| [0023](0023-private-object-storage-provider.md) | Private Object Storage Provider | SUPERSEDED | 2026-08-26 |
| [0024](0024-s3-compatible-private-object-storage.md) | S3-Compatible Private Object Storage | ACCEPTED | 2026-08-27 |
| [0025](0025-durable-background-jobs.md) | Durable Background Jobs for Heavy Processing | ACCEPTED | 2026-08-27 |
| [0026](0026-cloudflare-queues-as-dispatch-layer.md) | Cloudflare Queues as a Dispatch Layer | ACCEPTED | 2026-08-27 |
