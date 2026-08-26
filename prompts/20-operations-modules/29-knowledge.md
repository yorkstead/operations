# KnowHow

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

Build controlled operational knowledge capture from text, audio/video metadata, photos, and documents; transform reviewed content into versioned procedures linked to equipment, modules, and roles. Search and AI answers must cite approved source passages and surface uncertainty. Do not expose tenant knowledge across organizations.

Acceptance: draft-review-publish-retire lifecycle, provenance, permissions, media security, search, cited answers, feedback, prompt-injection defenses, and deletion/retention behavior are verified.

