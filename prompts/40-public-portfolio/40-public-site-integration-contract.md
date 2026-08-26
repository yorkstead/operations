# Public Site Integration Contract

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

Do not edit `yorkstead.com` in this prompt. Define the boundary and handoff contract for approved public work: canonical demo URLs, status/health, safe embed or deep-link policy, screenshots, metadata, analytics events, taxonomy, claim evidence, and fallback when a demo is unavailable. Document which repository owns each concern.

Acceptance: no shared database/session is required; public pages cannot trigger privileged demo actions; publishing/unpublishing and version compatibility have owners.

