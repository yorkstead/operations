# ADR 0019: Analytics & Executive Reporting Persistence Architecture

## Context
Executive reporting, KPI consolidation, cross-module needs-attention queues, work center capacity signals, and AI planning suggestions previously operated in-memory. Executive decisions require real-time SQL aggregation directly from verified underlying tables, governed metric definitions with complete data lineage per `docs/METRICS.md`, and persistent planning suggestions with human approval governance.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `planning_suggestions`: Persistent suggestions table tracking `title`, `category` (`workcenter_rebalance`, `expedite_procurement`, `preventive_maintenance`), `rationale`, `constraints` (JSONB), `trade_offs` (JSONB), `confidence_score` (`numeric(5, 4)`), `status` (`pending`, `approved`, `dismissed`), `approved_by_user_id`, `approved_by_name`, `approved_at`.

2. **Governed Metric Lineage**:
   - Every metric strictly exposes: `metricKey`, `businessQuestion`, `formula`, `grain`, `sourceOfTruth`, `targetNumeric`, `freshnessTimestamp`, and `knownLimitations`.

3. **Real-Time Cross-Module Reconciliation**:
   - Aggregates verified operational facts across `jobs`, `quality_ncrs`, `maintenance_equipment`, `purchasing_orders`, `shipping_manifests`, `quoting_estimates`, and `inventory_item_balances`.

4. **Human Executive Approval**:
   - AI planning suggestions strictly require human executive authorization (`org:manage_profile`), recording reviewer user attribution and timestamp.

5. **Audit Logging**:
   - Suggestion approvals and dismissals append immutable records to `audit_events`.

## Status
Accepted — 2026-08-26
