# ADR-0024: S3-Compatible Private Object Storage

- **Status**: ACCEPTED
- **Date**: 2026-08-27
- **Author(s)**: Codex / Engineering
- **Approver(s)**: Repository owner, approved through Infrastructure Abstraction Prompt 2
- **Related Prompts / Issues**: Infrastructure Abstraction Layer
- **Supersedes**: ADR-0023
- **Superseded By**: None

## Context and Problem Statement

ADR-0023 selected private Vercel Blob for the initial file-vault implementation. The approved target architecture removes Vercel as a required runtime or storage provider, uses Cloudflare R2 for private objects, and requires provider calls to remain outside business logic. The existing browser, upload completion, download, deletion, and readiness paths imported Vercel SDKs directly.

## Decision

Adopt a provider-neutral `ObjectStorage` interface backed by an S3-compatible adapter configured with generic `S3_*` environment variables. Cloudflare R2 is the first target provider, but business modules and HTTP lifecycle rules do not use Cloudflare terminology or APIs.

The interface provides `putObject`, `getObject`, `deleteObject`, `getObjectUrl`, `objectExists`, object metadata inspection, and bounded object listing. Browser uploads use short-lived presigned HTTP PUT URLs. Downloads continue through the authenticated application. PostgreSQL remains authoritative for tenant ownership, expected size/type/checksum, lifecycle state, and audit history.

No queue provider is selected by this decision.

## Alternatives Considered

1. **Keep Vercel Blob behind a new wrapper**: lowers immediate migration work but retains the prohibited infrastructure dependency.
2. **Proxy all object bytes through Cloud Run**: offers a simple protocol but increases application bandwidth, duration, memory, and upload-limit pressure.
3. **Hardwire an R2-specific SDK/binding**: works on Workers but couples business and runtime code to one provider and does not fit the Cloud Run target cleanly.

## Consequences and Trade-offs

### Positive

- R2 support uses a standard S3-compatible protocol.
- Direct uploads preserve the existing 25 MB behavior without proxying bytes through the application.
- Provider credentials, signing, and SDK types remain in `lib/infrastructure/storage`.
- Unit and route tests can replace the interface without provider credentials.

### Negative / Operational Burden

- The AWS S3 client and presigner add dependencies.
- Bucket CORS, credentials, lifecycle, retention, and object reconciliation require external configuration.
- Object deletion and metadata soft deletion cannot form one distributed transaction; operations must remain ordered and observable.
- Malware scanning remains unconfigured, so uploaded files remain `pending_scan` and unavailable.

## Architectural & Security Boundaries

- **Modular Monolith & Module Boundaries**: Storage is a technical adapter; core file metadata and lifecycle rules remain in the core module.
- **Tenant Isolation & Server-Side Authorization**: Only authenticated server routes construct tenant-prefixed keys and issue presigned URLs. Completion, download, and deletion re-read tenant-scoped metadata.
- **Demo Mode Isolation & Safety**: Demo organizations continue using the explicit synthetic adapter and cannot reach production object storage.
- **Visual System Compliance**: No global visual identity changes are required.

## Migration & Rollback Plan

- **Migration Path**: Configure a private R2 bucket and least-privilege credentials; verify CORS and the complete lifecycle in staging; inventory Vercel objects; copy objects without deleting sources; reconcile key, size, metadata record, and checksum where available; switch reads/writes only after exact reconciliation.
- **Rollback / Contingency Plan**: Disable new uploads and return traffic to the verified Vercel deployment while source objects remain retained. Database migrations are not required by this adapter change. Do not delete or revoke the source store until the observation window and explicit approval are complete.

## Verification Evidence

- Direct `@vercel/blob` imports and the package dependency were removed.
- Storage, environment, runtime, typecheck, tests, lint, and production build evidence is recorded in the phase handoff.

