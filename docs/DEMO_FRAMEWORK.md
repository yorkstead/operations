# Demo and Portfolio Engineering Contract

## Authority and Scope
This document defines the governing engineering rules, safety boundaries, threat model, and taxonomy for demo organizations and public portfolio presentations within Yorkstead Operations.

## 1. Portfolio Taxonomy
The Yorkstead portfolio is organized into four distinct tiers:
1. **Client Work**: Custom commercial engagements solving high-friction operational bottlenecks with measured ROI.
2. **Products**: Deployable commercial software platforms (e.g., `Yorkstead Operations`).
3. **Labs**: Applied industrial R&D, IoT telemetry bridges, edge-device experiments, and advanced automation proofs-of-concept.
4. **Demos**: Live, interactive, fully functioning sandbox environments populated with synthetic operational fixtures.

## 2. Demo Threat Model & Safety Guardrails
All demo environments are untrusted and must operate under strict security boundaries:
- **Tenant Isolation**: Every demo organization record carries `isDemo: true` and an explicit `organizationId`. Demo users cannot read, write, or enumerate production tenant data.
- **Side-Effect Interception**:
  - Email dispatch is routed to the synthetic in-memory/preview adapter; zero external SMTP delivery.
  - External webhooks and API calls are stubbed or routed to synthetic mock endpoints.
  - Payment, credit card, and invoicing actions are intercepted with test-mode handlers; zero live merchant charges.
  - Hardware/IoT writes and PLC control commands are simulated.
- **Visual & Header Labeling**:
  - Every UI screen in a demo organization displays a persistent, high-contrast banner: `DEMO MODE // SYNTHETIC DATA`.
  - API responses include the `X-Yorkstead-Demo: true` header.
- **Deterministic Reset**:
  - Demo organizations can be wiped and re-seeded to a golden baseline snapshot without impacting sibling organizations.
- **Synthetic Data Standards**:
  - All customer names, part numbers, addresses, phone numbers, and pricing fixtures are synthetic.
  - Absolutely zero actual customer PII, real proprietary CAD files, or export-controlled data.

## 3. Public Publication & Storytelling Rules
When documenting solutions, case studies, or demo walkthroughs:
- Lead with **Problem**, **Operational Bottleneck**, **Workflow Solution**, and **Measured Business Impact**.
- Do not lead with technology stacks or framework trivia.
- Never publish fabricated testimonials or unverified predictive accuracy metrics.
