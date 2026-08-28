# Architecture & System Design: Yorkstead Operations

## Direction

Yorkstead Operations (`ops.yorkstead.com`) is a production-ready modular monolith: one unified deployment unit on Vercel with strongly separated domain and infrastructure modules. It functions as the internal ERP and software delivery control plane for Yorkstead Systems (Tenant 0) while providing isolated synthetic demo sandboxes for sales presentations.

---

## Tenant 0 & Multi-Tenant Model

- **Tenant 0 (Root Internal Production Tenant)**: `org_yorkstead_systems` (`slug: yorkstead`, `is_demo: false`).
  - Owner / Super-Admin: Brandon (`brandon@yorkstead.com`, `usr_brandon_operator`).
  - Live client contracts, software deliverables, financial quoting, and DevOps consoles.
- **Sales Demo Sandboxes (`is_demo: true`)**:
  - `demo_mile_high_signworks`: Architectural signage & crane dispatch.
  - `demo_summit_facility`: Multi-site facility maintenance & equipment telemetry.
  - `demo_front_range_mfg`: CNC machining & shopfloor travelers.
- **Zero-Contamination Policy**: Production tenant data cannot be wiped, seeded, or reset by demo routines.

---

## Layers

- `app/`: routing, request boundaries, page composition
- `components/`: cockpit, engagements, quoting, and shell presentation components
- `modules/<name>/domain`: entities, value objects, policies, domain events
- `modules/<name>/application`: commands, queries, workflows, ports
- `modules/<name>/infrastructure`: persistence and external adapters
- `lib/`: technical utilities with no business ownership
- `db/`: shared database mechanics and migrations

---

## Core Domain Modules

1. **`core`**: Organizations, users/memberships, passkey identity, authorization capabilities, and session resolution.
2. **`engagements`**: Client software delivery lifecycle (6 stages), milestone tasks, SOW checklist, Cloudflare R2 file vault, and secrets store.
3. **`quoting`**: Consulting cost models (`discovery_audit`, `custom_software_milestone`, `monthly_sla_retainer`), margin policy governance, payment milestones, and R2 PDF proposal generator.
4. **`demo`**: Guided scenario manifests, ephemeral in-memory sandbox provisioning, and deterministic resets.

---

## Deployment & Public Site Relationship

`https://yorkstead.com` (`apps/website` on Netlify) and `https://ops.yorkstead.com` (`apps/operations` on Vercel) deploy independently with clear architectural boundaries. Lead inquiries captured on the public site write to Neon PostgreSQL and populate the operator intake pipeline in Yorkstead Operations.
