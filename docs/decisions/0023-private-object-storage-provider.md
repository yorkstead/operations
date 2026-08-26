# ADR-0023: Private Object Storage Provider

- **Status**: ACCEPTED
- **Date**: 2026-08-26
- **Author(s)**: Codex / Engineering
- **Approver(s)**: Repository owner, approved 2026-08-26
- **Related Prompts / Issues**: Path to Production Prompt 5 - Real Private Files Vault
- **Supersedes**: None; refines ADR-0016
- **Superseded By**: None

## Context and Problem Statement

ADR-0016 requires private tenant-scoped object storage, authorized expiring access, quarantine governance, and audit logging, but it does not select a provider. The current adapter returns synthetic URLs and stores no file bytes. Yorkstead Operations deploys on Vercel, so the provider decision determines the client upload protocol, credential model, health checks, local test adapter, deletion semantics, and operational ownership.

## Proposed Decision

Adopt **private Vercel Blob** as the first production object-storage adapter, behind the existing `FileStoragePort`.

- Store objects with private access and tenant-prefixed paths: `tenants/<organizationId>/vault/<uploadId>/<sanitizedFilename>`.
- Issue short-lived client-upload authorization only after authenticated server-side tenant and capability checks.
- Persist metadata initially as `pending_scan`; do not mark an object `clean` merely because upload completed.
- Verify upload completion, expected size, pathname, and checksum before advancing lifecycle state.
- Serve downloads through an authenticated application route that rechecks tenant ownership and status before retrieving the private blob.
- Keep synthetic storage restricted to explicit tests and demo tenants.
- Keep the port provider-neutral so an S3-compatible adapter can replace Vercel Blob without changing business services.

This decision does not claim malware scanning is configured. Until a scanner adapter is selected and healthy, production uploads remain `pending_scan` and downloads fail closed.

## Alternatives Considered

1. **Cloudflare R2 through an S3-compatible adapter**: Lower-egress economics and broad portability, but requires separate account, bucket, endpoint, IAM, CORS, signing, and operational configuration. This remains the preferred alternative if existing R2 infrastructure should be reused.
2. **AWS S3**: Mature security, lifecycle, and malware-scanning integrations, but adds a separate cloud control plane and greater configuration burden for the current Vercel deployment.
3. **Continue with the synthetic adapter**: Rejected for production because it persists no bytes and provides nonfunctional URLs.

## Consequences and Trade-offs

### Positive

- Fits the current Vercel deployment and managed-secret workflow.
- Supports private objects and large client uploads without proxying bytes through the application server.
- Retains a provider-neutral domain port.

### Negative / Operational Burden

- Introduces a Vercel-specific infrastructure adapter and `BLOB_READ_WRITE_TOKEN`.
- Private retrieval is mediated by the application, with associated transfer and runtime costs.
- Malware scanning still requires a separate adapter and operational service.

## Architectural & Security Boundaries

- **Modular Monolith & Module Boundaries**: Provider code remains in core infrastructure behind `FileStoragePort`; route handlers orchestrate but do not own storage rules.
- **Tenant Isolation & Server-Side Authorization**: Every prepare, completion, download, quarantine, and deletion request resolves the authenticated organization server-side and validates the tenant-prefixed object path.
- **Demo Mode Isolation & Safety**: Demo organizations continue using an explicit synthetic adapter and cannot write to the production blob store.
- **Visual System Compliance**: No global visual identity change is required.

## Migration & Rollback Plan

- **Migration Path**: Add the private Blob adapter and environment validation; implement prepare/completion/download/delete flows; update the browser to transfer real bytes; add lifecycle and IDOR tests; configure the Blob store only after explicit production approval.
- **Rollback / Contingency Plan**: Disable new uploads, retain PostgreSQL metadata, and switch the port binding back to a fail-closed unavailable adapter. Existing private objects remain untouched until an authorized migration or deletion plan is approved.

## Verification Evidence

- Current live readiness reports `storageVault: NOT_CONFIGURED`.
- Current synthetic adapter generates URLs under `storage.synthetic.ops.yorkstead.com` and does not accept uploaded bytes.
- Current browser upload flow registers metadata without transferring the selected file.
- Provider-specific implementation and live capability evidence are pending approval of this ADR.
