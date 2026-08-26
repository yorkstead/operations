# Security and Tenant Isolation Review

## Standing context

You are the principal product engineer for Yorkstead Operations. Before editing, read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and all documents relevant to this prompt. Inspect the repository and report current state, assumptions, scope, and acceptance criteria. Preserve existing work. All visual work is subordinate to `docs/VISUAL_SYSTEM.md`; do not reinterpret or modernize the Yorkstead visual identity. Enforce tenant isolation and server-side authorization. Use synthetic data only.

Implement one complete, reviewable vertical slice. Do not implement later prompts. Exercise the real user path and run the established typecheck, lint, tests, build, migration, and security checks. Fix failures caused by your work. Update documentation and finish with changed files, verification evidence, unresolved risks, whether global visual identity changed, and the next prompt number. Stop and write an ADR before crossing an architectural boundary.

## Task

Threat-model identity, authorization, tenant boundaries, files, imports, AI/document processing, demo mode, integrations, exports, administrative actions, secrets, and supply chain. Add focused tests and controls for IDOR, cross-tenant access, CSRF, XSS, injection, SSRF, unsafe files, replay/idempotency, rate abuse, and privilege changes.

Acceptance: high-risk findings are fixed or block release with owner/date; secret/dependency scans run; audit evidence is retained; no test uses production data.

