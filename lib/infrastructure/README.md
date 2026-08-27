# Infrastructure Layer

Provider SDKs and runtime details terminate in this directory. Business modules depend on the interfaces exported here rather than provider APIs.

## Boundaries

- `storage/`: provider-neutral object operations and an S3-compatible adapter. Cloudflare R2 is supported through generic `S3_*` configuration.
- `database/`: PostgreSQL pool construction used by Drizzle and Better Auth. Neon remains compatible through `DATABASE_URL`.
- `queue/`: provider-neutral message contract. No production queue is selected or configured yet; synchronous behavior is unchanged.
- `runtime/`: portable timeouts and documented ephemeral-filesystem characteristics. Request code does not use local files for durable state.
- `env/`: separately validates server secrets and browser-visible configuration.

## Storage lifecycle

Production uploads use a direct-to-object-storage sequence:

1. The authenticated application validates tenant, MIME type, size, and checksum and persists `pending_scan` metadata.
2. The storage adapter creates a short-lived presigned write URL for the tenant-prefixed key.
3. The browser uploads directly with HTTP `PUT`.
4. The authenticated completion endpoint checks object metadata against the database record.
5. The object remains unavailable until an independent scanner marks it `clean`.

Downloads stream through the authenticated application so tenant and lifecycle checks cannot be bypassed. Deletion removes the object before soft-deleting its database metadata.

## Runtime findings

- No Edge runtime declarations, Vercel request headers, runtime `/tmp` use, or durable local-file writes are present.
- Build/migration scripts use the repository filesystem, but request-time business logic does not.
- The application targets the Node.js runtime. Cloud Run request timeout, concurrency, and memory limits remain deployment configuration and must be measured in the container phase.
- Database and storage readiness calls use explicit portable timeouts.

