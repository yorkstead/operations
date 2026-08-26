# Visual Preservation Baseline

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

Treat the existing `yorkstead-website` repository as read-only. Inspect its global CSS/tokens, typography, navigation, buttons, cards, forms, tables, responsive behavior, motion, logos, and representative pages. Update `docs/VISUAL_SYSTEM.md` with an evidence-based token/pattern inventory and provenance. Capture reference screenshots only if the repository provides an approved workflow. Do not modify or copy implementation from the marketing repository and do not create UI in this repository.

Acceptance: the visual contract is specific enough to verify future work; accessibility defects are distinguished from preferences; intentional gaps are listed; the marketing repo remains unchanged.

