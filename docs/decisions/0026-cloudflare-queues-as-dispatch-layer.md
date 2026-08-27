# ADR-0026: Cloudflare Queues as a Dispatch Layer

- **Status**: ACCEPTED
- **Date**: 2026-08-27
- **Author(s)**: Yorkstead Engineering
- **Approver(s)**: Repository owner
- **Related Prompts / Issues**: Prompt 7 — Cloudflare Queues Integration
- **Supersedes**: None
- **Superseded By**: None

## Context and Problem Statement

ADR-0025 established PostgreSQL as the durable job ledger and queue. Interactive asynchronous work benefits from explicit dispatch, buffering, provider retries, and dead-letter handling, while heavy compute remains better suited to Cloud Run than Workers.

## Decision

Adopt Cloudflare Queues behind the provider-neutral job queue port as an at-least-once dispatch layer. The web producer uses the authenticated Queues REST API after committing the PostgreSQL job. A Cloud Run Job uses Cloudflare's HTTP pull consumer API and acknowledges or retries leases after claiming the referenced durable row. Messages contain only versioned identifiers and optional R2 keys. PostgreSQL remains authoritative and direct database draining remains the outage fallback.

## Alternatives Considered

1. **Cloudflare Worker consumer calling a public Cloud Run endpoint**: rejected because it creates an inbound processor surface and additional cross-cloud authentication work.
2. **Cloudflare Queue as the sole job state**: rejected because it cannot provide the tenant-scoped progress, result, audit, and transaction semantics already stored in PostgreSQL.
3. **Google Cloud Tasks/Pub/Sub**: portable queue ports allow this later, but Cloudflare Queues is the requested dispatch provider and supports secure outbound pull from Cloud Run.

## Consequences and Trade-offs

### Positive

- No unrestricted processing endpoint exists.
- Duplicate/lost dispatch cannot duplicate or lose the durable job.
- Queue buffering, delayed retry, and DLQ operations are available without moving compute into Workers.

### Negative / Operational Burden

- Cloud Run Job scheduling controls latency because HTTP pull is short polling.
- Separate least-privilege producer and consumer tokens must be rotated and monitored.
- Queue backlog and PostgreSQL job state must be observed together.

## Architectural & Security Boundaries

- **Modular Monolith & Module Boundaries**: business handlers know only the generic queue port; the Cloudflare adapter stays under infrastructure.
- **Tenant Isolation & Server-Side Authorization**: queue messages cannot authorize work; the durable organization-scoped row controls processing.
- **Demo Mode Isolation & Safety**: demo requests retain the in-memory completion path and never dispatch.
- **Visual System Compliance**: no visual identity or UI behavior changes are introduced.

## Migration & Rollback Plan

- **Migration Path**: provision queues/DLQ and tokens, verify the pull worker in staging, then switch worker and web runtime configuration from `database` to `cloudflare` separately.
- **Rollback / Contingency Plan**: restore `QUEUE_PROVIDER=database`; reconcile in-flight and dead-letter messages before removing queue resources.

## Verification Evidence

- Unit tests cover strict messages, authenticated push, pull decoding, and acknowledgement. Full repository gates and a worker image build are required; live provider delivery remains a staging gate.
