# Contributing to Yorkstead Operations

This document establishes the contribution workflow, Definition of Done, verification reporting standards, and checkpoint governance for human and automated contributors.

---

## 1. Authority and Reading Order

Every contributor must read files in this exact order before beginning any implementation:

1. `AGENTS.md`: Standing engineering instructions and non-negotiable rules.
2. `docs/VISUAL_SYSTEM.md`: Authoritative visual identity and UI constraints.
3. `docs/ARCHITECTURE.md`: Modular monolith layers, data ownership, and boundaries.
4. **Active Prompt File** (e.g., `prompts/00-foundation/01-visual-preservation-baseline.md`): Single prompt executed in the current session.
5. **Relevant Module Docs** (e.g., `modules/<name>/README.md`, `docs/AUTHORIZATION.md`, `docs/DATABASE.md`, etc.).

---

## 2. Contribution Lifecycle

For every prompt session:

```
[Inspect Repo & Docs]
         |
         v
[Summarize State, Assumptions & Acceptance Criteria]
         |
         v
[Check for Architecture / Boundary Conflicts]
   |-- Conflict Detected ---> [STOP: Author ADR in docs/decisions/] ---> [Owner Approval]
   +-- No Conflict
         |
         v
[Implement Single Vertical Slice (Smallest Coherent Change)]
         |
         v
[Execute Verification (Real Path, Typecheck, Lint, Tests, Build, A11y, Mobile)]
         |
         v
[Update Relevant Documentation]
         |
         v
[Output Standardized Verification Report]
```

### Stop Conditions & ADR Protocol
Stop immediately and author a new ADR in `docs/decisions/` (following `docs/decisions/template.md`) when a task requires:
- Framework or database changes not approved in an ADR.
- Modifying cross-module boundaries or bypassing public query contracts.
- Altering tenant isolation or server-side authorization models.
- Destructive migrations, external live credentials, or customer data access.
- Changes conflicting with `docs/VISUAL_SYSTEM.md`.

---

## 3. Definition of Done (DoD)

A prompt or feature is complete ONLY when all the following criteria are satisfied:

- [ ] **Single Slice Scope**: Exactly one prompt implemented without speculative future abstractions or extraneous features.
- [ ] **Server-Side Authorization**: Every tenant mutation and query enforces `organization_id` and capability checks on the server.
- [ ] **Modular Isolation**: Business rules reside in domain/application layers of the owning module, not in UI components or route handlers.
- [ ] **Synthetic Data Only**: Fixtures and seeds use synthetic data; no live credentials, customer PII, or production dumps exist.
- [ ] **Real User Path Exercised**: The end-to-end user workflow was executed and verified, including loading, empty, error, and narrow-screen states.
- [ ] **Automated Checks Pass**: Typecheck, lint, formatting, unit/integration tests, and build execute cleanly without unhandled errors (when toolchain is established).
- [ ] **Visual Preservation Verified**: Rendered pages match Yorkstead.DEV conventions without unauthorized theme, font, or color redesigns.
- [ ] **Documentation Updated**: All relevant markdown files, architecture references, and ADR indices reflect the change.
- [ ] **Standardized Report Generated**: Verification report contains exact commands, evidence, risks, visual status, and next prompt.

---

## 4. Standardized Verification Report Format

Every session completion report must adhere to this exact structure:

```markdown
### Verification Report: [Prompt Name / Number]

1. **Current State & Scope Summary**:
   - Concise summary of what was delivered in this vertical slice.
2. **Files Changed / Created**:
   - List of all modified, created, or deleted files with markdown links.
3. **Automated Verification Evidence**:
   - Exact command lines executed and output status (typecheck, lint, unit tests, integration tests, build).
4. **Manual & Real-Path Verification Evidence**:
   - Desktop and mobile viewport observations.
   - Tested states (happy path, validation error, permission denied, loading, empty).
5. **Global Visual Identity Declaration**:
   - Explicit confirmation: *"No existing global visual identity was changed."* (or details of approved extensions).
6. **Unresolved Risks & Assumptions**:
   - Known limitations, pending migrations, or assumptions requiring owner confirmation.
7. **Recommended Next Prompt**:
   - Exact prompt file path and title to be executed next.
```

---

## 5. Phase Checkpoint Policy

The implementation roadmap in `prompts/PROMPTS_README.md` defines mandatory **Phase Checkpoints**:

1. **Checkpoint 1** (after `00-foundation/02-platform-foundation.md`): Baseline stack, tooling, and build pipeline locked.
2. **Checkpoint 2** (after `10-core-platform/15-configuration-and-admin.md`): Core organizations, identity, roles, and admin foundation verified.
3. **Checkpoint 3** (after `20-operations-modules/22-job-packet-intelligence.md`): Core shopfloor, inventory, and traveler workflows proven.
4. **Checkpoint 4** (after `30-demo-framework/32-front-range-manufacturing.md`): First end-to-end interactive manufacturing demo verified.
5. **Checkpoint 5** (after `40-public-portfolio/43-work-page.md`): Public portfolio alignment and demo deep-links verified.
6. **Checkpoint 6** (after `60-hardening/64-portfolio-review-and-handoff.md`): Full platform readiness, accessibility, security, and handoff complete.

### Checkpoint Rules
- **Do not advance past a checkpoint without explicit user approval.**
- At every checkpoint, run the full verification suite across all delivered modules.
- Re-validate tenant isolation, demo side-effect containment, and performance benchmarks.
