# ADR 0010: Quality & Non-Conformance (NCR) Persistence Architecture

## Context
Quality inspection procedures (First Article Inspection, In-Process checks, Final Acceptance, Dock Receiving) and Non-Conformance Reports (NCRs) previously operated on browser fixtures and in-memory process maps. For production manufacturing, physical inspections must be persisted in PostgreSQL, segregated by tenant organization, and subject to strict segregation of duties between operator inspection logging and engineering/QA disposition approval.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `quality_inspection_records`: Stores individual inspection events, sample sizes, pass/fail counts, and serialized checklist measurements with mandatory `organization_id` foreign keys and indexes.
   - `quality_non_conformance_reports`: Tracks material defects, severity tiers (`minor`, `major`, `critical`), containment actions, engineering dispositions (`use_as_is`, `rework`, `scrap_and_remake`, `return_to_vendor`), and root-cause analyses.

2. **Segregation of Duties Enforcement**:
   - Creating an inspection or raising an initial NCR requires `quality:record_inspection` capability (granted to operators and QA inspectors).
   - Approving an engineering disposition or closing an NCR requires `quality:scrap_rework` capability (restricted to QA Managers, Admins, and Owners).
   - Operators cannot disposition or close their own raised defect reports without authorized QA sign-off.

3. **Financial Integer Cents**:
   - Scrap losses, remake costs, and labor rework impact are represented and calculated in integer cents (`scrapCostCents`, `remakeCostCents`).

4. **Cross-Module Linkage & Traceability**:
   - NCRs reference `job_id`, `traveler_id`, and `traveler_operation_id` for digital traveler traceability.
   - Scrapped quantities link into the Inventory movement ledger under `scrap` movement types.

5. **Audit Logging**:
   - Every inspection completion, NCR creation, disposition change, and closure automatically appends an immutable record to `audit_events`.

## Status
Accepted — 2026-08-26
