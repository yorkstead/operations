# ADR 0005: Isolated Demo Organization Framework & Deterministic Reset

## Status
Accepted

## Context
Yorkstead Operations requires realistic, interactive sales and customer demonstrations of the complete operations platform (Jobs, Shopfloor, Inventory, Quality, Maintenance, Shipping, Quotes, Purchasing, KnowHow, and Analytics) without exposing any real customer data, live production credentials, or generating external side effects (live emails, payment charges, hardware control writes).

## Decision
1. **Isolated Synthetic Tenants**:
   Every demo scenario executes inside a dedicated organization record flagged with `isDemo: true`. Demo organizations are partitioned by standard tenant isolation rules and are strictly segregated from production customer organizations.
2. **Deterministic Versioned Seeds**:
   Scenarios are defined via declarative manifests (`DemoScenarioManifest`) with fixed synthetic records (customers, parts, machines, work orders, BOMs, and inspection criteria).
3. **Idempotent Self-Service Reset**:
   Demo organizations can be reset to their golden state at any time via `resetDemoOrganization`. To prevent abuse, reset requests are rate-limited per user/session.
4. **Side-Effect Interception & Preview Adapters**:
   External integrations (email, payment, webhooks) are intercepted by synthetic in-memory preview adapters that log the outbound payload for review without transmitting data outside the host environment.
5. **Persistent Visual Watermark**:
   Demo organizations display a prominent top watermark banner (`DEMO MODE // SYNTHETIC DATA`) to guarantee visual transparency.

## Consequences
- Prospective buyers and evaluators can safely test destructive mutations and workflow state transitions without risking production data integrity.
- Zero risk of outbound email spam or accidental live merchant charges during demos.
- Single-command reset enables reproducible regression testing and predictable demo presentations.
