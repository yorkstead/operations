# ADR-0001: Engineering Contract, Governance, and Decision Workflow

- **Status**: ACCEPTED
- **Date**: 2026-08-24
- **Author(s)**: Principal Product Engineer / Gemini
- **Approver(s)**: Repository Owner
- **Related Prompts / Issues**: `prompts/00-foundation/00-engineering-contract.md`
- **Supersedes**: None
- **Superseded By**: None

## Context and Problem Statement

Yorkstead Operations requires a disciplined engineering contract and governance model to coordinate single-prompt autonomous implementation runs, multi-tenant security guarantees, domain boundaries, and visual fidelity with Yorkstead.DEV.

Without an explicit decision workflow and binding contract:
1. Contributors could introduce out-of-scope abstractions, premature dependencies, or speculative implementations.
2. Architectural tensions (e.g., cross-module coupling, unauthorized route handlers, unisolated demo side effects) could bypass review.
3. Visual identity could drift away from the authoritative Yorkstead.DEV standard.
4. Completion reporting would lack standardized verification evidence.

## Decision

1. **Authority & Reading Order**: `AGENTS.md` and `docs/VISUAL_SYSTEM.md` are standing, inviolable rules. Prompts narrow scope but cannot override core contracts. Reading order is strictly: `AGENTS.md` -> `docs/VISUAL_SYSTEM.md` -> `docs/ARCHITECTURE.md` -> Active Prompt -> relevant module documentation.
2. **Modular Monolith Architecture**: Maintain a single deployable application with strict module boundaries (`modules/<name>/domain`, `application`, `infrastructure`, `presentation`). Cross-module mutations require explicit application services; direct cross-module database access is prohibited.
3. **Tenant Isolation & Security**: Every tenant-owned record must include an `organization_id` enforced server-side. Deny by default. UI visibility is presentation only, never security.
4. **Demo Environment Safety**: Demo organizations are untrusted, deterministic, synthetic, and strictly isolated from production side effects (email, SMS, payments, carriers intercepted/simulated).
5. **Visual System Preservation**: Subordinate to `docs/VISUAL_SYSTEM.md`. The Yorkstead appearance is authoritative; extend without redesigning or introducing foreign styles.
6. **Decision Log & Stop Conditions**: Stop immediately and write an ADR when an instruction creates architectural conflicts, tenant boundary issues, destructive migrations, or irreversible actions.
7. **Single Vertical Slice Discipline**: Execute exactly one numbered prompt per session. No speculative code or dependencies. Verify the full user path and provide a standardized verification report.

## Alternatives Considered

- **Ad-hoc Prompt Execution without ADR Process**: Rejected because multi-step agent workflows accumulate unrecorded assumptions and silent architectural drift.
- **Microservices Architecture**: Rejected because a modular monolith provides optimal operational simplicity, transaction integrity, and lower overhead for the platform's current phase while preserving future extraction paths.

## Consequences and Trade-offs

### Positive
- Strict isolation, predictable reviewable changes, and zero speculative bloat.
- Consistent user experience and visual harmony across Yorkstead products.
- Standardized verification gates prevent unverified regressions from advancing past phase checkpoints.

### Negative / Operational Burden
- Requires strict stop-and-ADR discipline when encountering unmodeled edge cases.

## Architectural & Security Boundaries

- **Modular Monolith & Module Boundaries**: Enforced at directory and API levels.
- **Tenant Isolation & Server-Side Authorization**: Mandatory `organization_id` filters and server-side capability checks.
- **Demo Mode Isolation & Safety**: Dedicated synthetic scenarios with mocked side effects.
- **Visual System Compliance**: Strictly preserves existing Yorkstead.DEV design tokens and aesthetics.

## Migration & Rollback Plan

- **Migration Path**: Applied to all current and future prompts in `prompts/`.
- **Rollback / Contingency Plan**: Governed by updating or superseding this ADR through explicit owner approval.

## Verification Evidence

- Verified repository audit against `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, `docs/ARCHITECTURE.md`, and `prompts/00-foundation/00-engineering-contract.md`.
- Established decision log in `docs/decisions/` and contribution workflow in `docs/CONTRIBUTING.md`.
