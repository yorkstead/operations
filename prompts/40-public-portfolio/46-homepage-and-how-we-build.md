# Homepage and How We Build

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

In `yorkstead-website`, integrate the proven positioning, demos, work, platform, and workflow-audit paths into the current homepage and a concise `/how-we-build` narrative. Preserve the existing homepage identity; make minimal changes around clear hierarchy, trust, and next action.

Acceptance: no generic redesign; client/product/demo/lab labels are honest; contact/audit conversions are measurable; performance, metadata, accessibility, responsive behavior, and existing routes are verified.

