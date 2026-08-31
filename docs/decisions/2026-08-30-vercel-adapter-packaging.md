# Vercel packaging for the standalone Operations repository

Status: Accepted for the owner-requested Vercel deployment of `yorkstead/operations`.

The current deployment target is the Yorkstead Vercel team's `operations`
project. This supersedes the Cloud Run-only hosting restriction in ADR-0027
for this standalone repository. Tenant isolation, private files, server-side
authorization, and separation from the public website are unchanged.

Deployment `dpl_EfK5y1Zn7h1szxo3NarCbQrKhHLo` built commit `424b683`,
installed dependencies and compiled successfully, then failed while packaging
with a missing `.next/next-server.js.nft.json`. This matches the Next.js 16.3
standalone/adapter incompatibility reported at
https://github.com/vercel/next.js/issues/96646.

Use Vercel's normal function packaging when `VERCEL=1`. Retain standalone
output for local/container builds. Trace dependencies from this repository's
directory, not the former monorepo root two directories above it.

No credentials, database schema, application authorization, or global visual
identity change. Rollback is a revert of this configuration commit. Local
build checks and hosted deployment results must be reported separately.
