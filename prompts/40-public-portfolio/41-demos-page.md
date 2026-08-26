# Public /demos Experience

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

In the separate `yorkstead-website` repository only after explicit scope/approval, build or refine `/demos` using its existing components and visual system. Present honest, working demo cards with industry, operational problem, workflows shown, maturity, data disclaimer, availability, and clear launch path. Consume only the approved integration contract.

Acceptance: links/fallbacks, analytics, metadata, accessibility, mobile layout, loading/unavailable states, and claim labels are verified; no operations code or data is copied into the public repo.

