# ADR-0025: Durable Background Jobs for Heavy Processing

- **Status**: ACCEPTED
- **Date**: 2026-08-27
- **Author(s)**: Yorkstead Engineering
- **Approver(s)**: Repository owner
- **Related Prompts / Issues**: Prompt 6 — Separate Heavy Processing From Web Requests
- **Supersedes**: None
- **Superseded By**: None

## Context and Problem Statement

Packet drawing extraction is currently synthetic and fast, but it represents future OCR, drawing analysis, and AI processing that must not consume an HTTP request lifetime. The architecture needs durable progress, retry, recovery, and tenant isolation without introducing a distributed platform disproportionate to the current single workload.

## Decision

Use a tenant-scoped PostgreSQL `background_jobs` table as both the durable job ledger and authoritative queue. HTTP routes create idempotent jobs and return immediately. A separately deployed Bun worker claims rows with `FOR UPDATE SKIP LOCKED`, processes packet extraction, and records progress and a public-safe result. Cloudflare Queues may later send job-ID wake-up hints, but delivery there is never the source of truth.

## Alternatives Considered

1. **Cloudflare Queues as the only queue**: rejected because database creation and message delivery cannot be made atomic without an outbox, and the application must remain portable.
2. **Run extraction inside the Route Handler**: rejected because real OCR/AI work will exceed reasonable request latency and makes retries and recovery unsafe.
3. **A general workflow framework**: rejected because one implemented heavy workload does not justify that operational surface.

## Consequences and Trade-offs

### Positive

- Jobs survive request, process, and optional message-delivery failures.
- Tenant-scoped polling exposes progress without exposing payloads or internal exceptions.
- Retries, idempotency, cancellation before claim, and stale-worker recovery are explicit.

### Negative / Operational Burden

- A worker or scheduled Cloud Run Job must run frequently enough to meet latency targets.
- PostgreSQL polling is appropriate at current volume but must be measured before scaling.

## Architectural & Security Boundaries

- **Modular Monolith & Module Boundaries**: the worker imports the same module application services; it is a separate process, not a new service boundary.
- **Tenant Isolation & Server-Side Authorization**: APIs always filter by active organization and the worker uses the organization stored on the claimed job.
- **Demo Mode Isolation & Safety**: demo extraction remains synthetic and completes in memory; it does not enqueue persistent side effects.
- **Visual System Compliance**: the existing Packet Intelligence card gains only existing Button, Badge, and color tokens plus a compact progress indicator.

## Migration & Rollback Plan

- **Migration Path**: apply migration 0014, deploy the worker image, then deploy the web route that creates jobs. Verify a staging extraction end-to-end before traffic promotion.
- **Rollback / Contingency Plan**: stop job creation first, allow running jobs to finish, roll web traffic back, and retain the additive job table for audit/recovery. Do not drop queued job data during rollback.

## Verification Evidence

- Migration checksum verification, typecheck, lint, tests, production builds, container build, and local worker execution are required before promotion.
