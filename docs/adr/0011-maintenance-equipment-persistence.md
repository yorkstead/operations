# ADR 0011: Maintenance & Equipment Persistence Architecture

## Context
Work center machines (fiber lasers, press brakes, CNC mills, compressors) and facility equipment previously operated on in-memory maps and static mock fixtures. Production manufacturing requires physical asset tracking in PostgreSQL, preventive maintenance scheduling, machine downtime tracking with non-overlapping open interval guarantees, emergency work order automation, and return-to-service capability governance.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `equipment_assets`: Master registry for plant assets, containing unique `asset_tag` per tenant organization, manufacturer, model/serial numbers, work center routing, criticality level, QR data, and PM dates.
   - `maintenance_downtime_intervals`: Immutable logging of downtime events with categories (`unplanned_breakdown`, `planned_preventive`, `tooling_failure`, `operator_error`, `waiting_for_parts`), start/resolve timestamps, and duration calculation.
   - `maintenance_work_orders`: Corrective and preventive work order tracking, labor minutes, replacement parts consumed, and authorized sign-off.

2. **Downtime Overlap Prevention Guardrail**:
   - Only one unresolved downtime interval (`resolved_at IS NULL`) may exist per equipment asset at any given time. Attempting to report downtime on an already-down machine is rejected server-side to prevent metrics distortion.

3. **Emergency Work Order Automation**:
   - When an unplanned breakdown or tooling failure is logged, an emergency corrective work order (`corrective_emergency`, priority `emergency`) is atomically created within the same database transaction.

4. **Return-to-Service Authorization Governance**:
   - Operators and shopfloor technicians can report machine breakdowns (`shopfloor:execute_station`).
   - Authorizing machine return-to-service and restoring equipment status to `operational` requires the `quality:manage_schedules` capability.

5. **Audit Logging**:
   - Every downtime event, work order dispatch, and return-to-service authorization automatically appends an immutable record to `audit_events`.

## Status
Accepted — 2026-08-26
