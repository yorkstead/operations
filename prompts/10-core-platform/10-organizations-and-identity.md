# Organizations and Identity

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

Implement organization tenancy, user identity, invitations, memberships, active-organization selection, session handling, and organization lifecycle. Provide secure owner bootstrap without leaving public signup open indefinitely. Use neutral ports for email delivery.

Acceptance: invitation, acceptance, sign-in/out, organization switch, membership removal, expired invitation, and disabled account paths work; session/cookie settings are production-safe; cross-tenant tests prove isolation.

