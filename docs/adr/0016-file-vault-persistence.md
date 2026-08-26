# ADR 0016: File Storage & Document Vault Persistence Architecture

## Context
Technical drawings (CAD/DXF/STEP), CNC router G-code files, customer purchase orders, quality inspection photos, and compliance certs previously relied on in-memory maps and synthetic download URLs. Production operations requires authenticated tenant-scoped PostgreSQL metadata, presigned S3/GCS upload and download URLs with 15-minute TTLs, path traversal containment, and malware/quarantine safety flags.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `file_vault_records`: Tracks `id`, `organization_id`, `uploaded_by_user_id`, `uploaded_by_name`, `filename`, `mime_type`, `size_bytes` (`bigint`), `storage_key`, `checksum_sha256`, `status` (`clean`, `quarantined`, `pending_scan`, `deleted`), `quarantine_reason`, `entity_type`, and `entity_id`.

2. **Storage Key Isolation Standard**:
   - Storage keys follow strict tenant prefixing: `tenants/<organizationId>/vault/<timestamp>_<sanitizedFilename>`.

3. **Strict Path Containment**:
   - File uploads and URL generators reject path traversal substrings (`..`, `\`, leading slashes).

4. **Expiring Signed URLs**:
   - Presigned upload and authorized download tokens carry a default 15-minute expiration (900 seconds TTL).

5. **Quarantine Governance**:
   - Quarantined files cannot be downloaded by general operators. Quarantining and unquarantining requires `org:manage_profile` administrative capability.

6. **Audit Logging**:
   - Every file upload preparation, authorized download generation, quarantine event, and deletion appends an immutable record to `audit_events`.

## Status
Accepted — 2026-08-26
