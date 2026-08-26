# Authorization

## Model

Authentication establishes identity. Authorization decides whether that identity may perform an action on a resource in an organization. Enforce authorization server-side at every entry point.

Use organization membership plus role/capability policies. Start with roles such as owner, administrator, manager, operator, viewer, and demo visitor, then express module actions as capabilities. Avoid scattering role-name comparisons throughout UI or route code.

## Rules

Deny by default. Verify active membership, organization scope, capability, resource state, and any ownership/location restriction. Background jobs and integrations use scoped service identities. Elevated support access is time-bound, reasoned, audited, and visible.

UI may explain or hide unavailable actions but is never the enforcement layer. Test cross-tenant access, guessed identifiers, stale sessions, removed membership, role changes, and export/file URLs.

