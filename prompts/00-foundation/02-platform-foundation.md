# Platform Foundation

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

Propose the smallest supported production stack for a Windows-first workflow and Vercel-compatible deployment, using the documented Yorkstead conventions as context. Prefer a current Next.js App Router, TypeScript, React, Tailwind, PostgreSQL, a typed ORM, and a proven authentication library only after verifying compatibility. Record the choice and rejected alternatives in an ADR. Then scaffold only the foundation needed to render a branded shell, connect to a local/test database, validate environment variables, and run all quality commands.

Do not build business modules. Keep dependencies minimal and pinned through the selected package manager.

Acceptance: fresh install, dev start, typecheck, lint, unit test, build, migration check, and audit commands work; the shell has accessible desktop/mobile navigation and loading/error boundaries; no secret is committed; setup is documented.

