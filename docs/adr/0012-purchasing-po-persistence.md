# ADR 0012: Purchasing & Vendor Sourcing Persistence Architecture

## Context
Raw material sourcing, vendor catalogs, purchase order (PO) generation, and dock receiving previously operated in process memory and mock fixtures. Production manufacturing requires physical supplier records in PostgreSQL, multi-line purchase orders with integer-cents accounting, multi-tier spend approval thresholds ($5,000 manager authorization), and atomic dock receiving integration into the immutable inventory movement ledger.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `purchasing_vendors`: Vendor master records, payment terms, currency, and contact emails per tenant organization.
   - `purchasing_purchase_orders`: Header table tracking sequential `po_number` (`PO-YYYY-XXX`), financial breakdown (`subtotal_cost_cents`, `shipping_cost_cents`, `tax_cost_cents`, `total_cost_cents`), status (`draft`, `pending_approval`, `approved`, `sent_to_vendor`, `partially_received`, `received_complete`, `cancelled`), and approver attribution.
   - `purchasing_po_line_items`: Individual PO items with item codes, quantities ordered/received, integer-cents unit costs, and optional link to production Jobs (`linked_job_id`).
   - `purchasing_receiving_receipts`: Dock delivery records capturing packing slip numbers, items received, and receiving operator.
   - `purchasing_material_shortages`: Signals tracking material deficits against active job demand.

2. **Spend Threshold Governance**:
   - POs with total cost exceeding 500,000 integer cents ($5,000.00) automatically require manager sign-off (`requires_manager_approval = true`, `status = 'pending_approval'`).
   - Issuing a PO with `pending_approval` status is blocked until approved by a user with `purchasing:approve_po`.

3. **Dock Receiving & Inventory Ledger Integration**:
   - When items are received on a dock receipt, the system atomically:
     1. Creates an immutable `inventory_movements` ledger entry (`movementType: 'receive'`).
     2. Updates derived `inventory_item_balances` in PostgreSQL with row-level locking.
     3. Increments `quantity_received` on corresponding PO line items and transitions PO status to `partially_received` or `received_complete`.

4. **Financial Integer Cents**:
   - All unit costs, item extensions, shipping fees, tax calculations, and committed spend metrics are stored and computed in integer cents.

5. **Audit Logging**:
   - Every PO creation, approval, vendor transmission, and receiving receipt appends an immutable record to `audit_events`.

## Status
Accepted — 2026-08-26
