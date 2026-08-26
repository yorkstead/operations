# Standing Engineering Instructions

These instructions apply to Gemini and every human or automated contributor.

## Authority and reading order

Before work, read this file, the requested prompt, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and relevant module documentation. Existing repository decisions and accepted ADRs are authoritative. A prompt may narrow this contract but may not silently override it.

## Naming and brand authority

- **Company Name**: `Yorkstead Systems`
- **Short Brand Name**: `Yorkstead`
- **Commercial Platform**: `Yorkstead Operations`
- **Public Company Website**: `https://yorkstead.com` (`yorkstead-website`, Netlify: `yorkstead`)
- **Operations Application**: `https://ops.yorkstead.com` (`yorkstead-operations`, Vercel: `yorkstead-operations`)
- **Package Namespace**: `@yorkstead`
- **Retired Brand Names**: `4TWENTY`, `4twentydev`, `4twentyops`, `Groundline`, `RivetWorks`, and `rivetworks.software` are retired from customer-facing branding and should only appear in historical records or migration decision notes.

## Working method

1. Inspect repository status, current implementation, tests, and relevant documentation before editing.
2. Summarize the current state, assumptions, intended slice, and acceptance criteria.
3. Preserve sound existing work and make the smallest coherent, reviewable change.
4. Do not add adjacent features, speculative abstractions, or a new design language.
5. Exercise the actual user path, not only isolated helpers.
6. Run typecheck, lint, relevant tests, build, and security checks established by the repository.
7. Fix failures caused by the change. Clearly distinguish pre-existing failures.
8. Update documentation and record changed assumptions.
9. Report files changed, verification evidence, unresolved risks, and the recommended next prompt.

## Stop conditions

Stop feature work and write an ADR when a request conflicts with architecture, tenant isolation, authorization, data ownership, demo safety, or visual-system rules. Stop and request a decision when destructive migration, customer-data access, billing, or irreversible external action is required.

## Architecture rules

- Build a modular monolith with explicit module boundaries and one deployable application until evidence justifies extraction.
- Every tenant-owned record carries an organization boundary enforced server-side.
- Server-side authorization is mandatory; hidden UI is not authorization.
- Business rules live in modules, not route handlers or visual components.
- Cross-module writes use explicit application services and transactions.
- External integrations are adapters with timeouts, retries, idempotency, observability, and safe failure behavior.
- Files are private by default and accessed through authorized, expiring URLs.
- Audit security-sensitive and operationally meaningful events.
- Treat demo organizations as untrusted and isolated from production customers and side effects.

## Visual rule

All visual work is subordinate to `docs/VISUAL_SYSTEM.md`. The existing `yorkstead-website` appearance is authoritative during the brand and hosting migration. Extend it; do not reinterpret, modernize, or overwrite it. Report whether any global visual identity changed. The expected answer is: “No existing global visual identity was changed.”

## Data and security

Never commit secrets, production exports, customer documents, personal data, or live credentials. Use synthetic fixtures. Validate input at trust boundaries. Deny by default. Avoid logging secrets or document contents. Use least privilege and record sensitive administrative actions.

## Quality bar

New behavior requires proportionate automated tests. Critical workflows require integration or end-to-end coverage. Include accessibility, narrow-screen, empty, loading, error, and permission-denied states. Performance claims and business metrics require measured evidence.

## Git discipline

Keep commits small and descriptive. Do not rewrite shared history, discard unrelated changes, or combine multiple prompts in one unreviewable commit. Every phase checkpoint must leave the repository buildable and documented.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
