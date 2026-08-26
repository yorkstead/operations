# ADR 0013: Shipping & Outbound Logistics Persistence Architecture

## Context
Outbound logistics, Bill of Lading (BOL) manifest creation, carrier coordination, multi-stop route dispatching, and Proof of Delivery (POD) sign-offs previously operated in process memory and mock fixtures. Production manufacturing requires physical bill-of-lading documents in PostgreSQL, package weight rollup calculations, driver and carrier attribution, and digital signature records.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `shipping_manifests`: Manifest headers tracking sequential `manifest_number` (`BOL-YYYY-XXX`), carrier type (`dedicated_flatbed`, `ltl_freight`, `parcel_express`, `customer_will_call`, `hotshot_courier`), carrier name, tracking/PRO numbers, driver name, trailer/plate numbers, total packages, gross weight (`numeric(10, 2)`), status (`draft_manifest`, `staged_for_loading`, `dispatched_in_transit`, `delivered`, `cancelled`), and dispatch timestamps.
   - `shipping_stops`: Multi-stop route waypoints capturing destination customer names, addresses, stop sequence, assigned package numbers (JSONB), contact phone, delivery notes, stop status (`pending` / `delivered`), recipient signature, and timestamp.
   - `shipping_manifest_packages`: Cross-reference junction associating packaging container units with manifests and weights.

2. **Sequential Bill of Lading (BOL) Numbering**:
   - Manifest numbers follow deterministic sequential numbering per organization: `BOL-YYYY-XXX`.

3. **Logistics State Machine**:
   - `draft_manifest`: Initial manifest created with destination stops and carrier information.
   - `staged_for_loading`: Sealed packages attached and gross weight calculated.
   - `dispatched_in_transit`: Stamped with driver name, trailer/plate number, and dispatching user attribution.
   - `delivered`: Stamped with recipient digital sign-off and delivered timestamp.

4. **Audit Logging**:
   - Every manifest generation, package loading, carrier dispatch, and delivery confirmation appends an immutable record to `audit_events`.

## Status
Accepted — 2026-08-26
