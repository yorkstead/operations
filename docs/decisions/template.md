# ADR-NNNN: [Short Descriptive Title]

- **Status**: [PROPOSED | ACCEPTED | REJECTED | SUPERSEDED | DEPRECATED]
- **Date**: YYYY-MM-DD
- **Author(s)**: [Name / Role]
- **Approver(s)**: [Name / Role]
- **Related Prompts / Issues**: [e.g., `prompts/00-foundation/02-platform-foundation.md`]
- **Supersedes**: [None | ADR-XXXX]
- **Superseded By**: [None | ADR-YYYY]

## Context and Problem Statement

Describe the context, operational need, architectural tension, or business driver that requires a decision. What constraints or non-negotiables apply?

## Decision

State the specific decision clearly and concisely. Detail what is being adopted, altered, or prohibited.

## Alternatives Considered

1. **Alternative A**: Description, pros, and why it was not selected.
2. **Alternative B**: Description, pros, and why it was not selected.

## Consequences and Trade-offs

### Positive
- [Beneficial outcome]

### Negative / Operational Burden
- [Trade-off or ongoing overhead]

## Architectural & Security Boundaries

- **Modular Monolith & Module Boundaries**: [How does this decision respect module isolation?]
- **Tenant Isolation & Server-Side Authorization**: [How is organization-scoped access guaranteed?]
- **Demo Mode Isolation & Safety**: [Does this affect demo organizations or side-effect interception?]
- **Visual System Compliance**: [Does this comply with `docs/VISUAL_SYSTEM.md`?]

## Migration & Rollback Plan

- **Migration Path**: [Steps required to adopt the decision]
- **Rollback / Contingency Plan**: [Steps if the decision must be reverted]

## Verification Evidence

- [Command, test, or inspection performed to validate this decision]
