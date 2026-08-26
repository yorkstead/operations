# Accessibility and Performance Hardening

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

Audit all shipped flows against WCAG 2.2 AA intent, keyboard/screen-reader use, focus, contrast, reduced motion, zoom, narrow screens, slow/failed networks, and large realistic datasets. Establish measured budgets for page weight, interaction latency, database queries, and critical background work.

Acceptance: automated and manual evidence is recorded; critical defects are fixed; budgets run in CI where practical; optimization preserves behavior and visual identity.

