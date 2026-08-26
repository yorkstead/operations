# ADR 0009: Inventory Movement Ledger Persistence & Fixed-Scale Quantity Policy

## Status
Accepted

## Context
Following the persistent Jobs (ADR 0007) and ShopFloor (ADR 0008) vertical slices, the Inventory module represents the third highest-value operational foundation. Physical material management requires an immutable movement ledger (receiving, job issue, returns, location transfers, scrap, and cycle-count reconciliations) with strict concurrency locking to guarantee that negative stock is impossible under simultaneous requests.

## Decision
1. **Immutable Inventory Movement Ledger Architecture**:
   - Stock balances are not directly edited. They are derived from immutable, append-only `inventory_movements` records.
   - Movements strictly enforce directional legs via `from_location_id` and `to_location_id` with strictly positive quantities.
   - Reversals and corrections are represented by explicit compensating movements linked to the original movement ID.
2. **Fixed-Scale `numeric(14, 4)` Quantity Policy & Integer Cents Currency**:
   - All financial amounts are stored as integer cents (`standard_cost_cents`, `unit_cost_cents`, `valuation_cents`), eliminating floating-point rounding errors.
   - Quantities are stored in PostgreSQL as `numeric(14, 4)` supporting 4 decimal places for fractional units (such as `FT`, `LBS`, `SHEET`, `EA`).
   - Centralized decimal arithmetic in `modules/inventory/domain/quantity.ts` validates precision, addition, subtraction, and comparison.
3. **PostgreSQL Concurrency Locking & Negative-Stock Prevention**:
   - Every stock-altering mutation executes inside a PostgreSQL database transaction.
   - An `inventory_item_balances` projection table tracks on-hand quantities at `(organization_id, item_id, location_id, lot_id)` granularity and is locked via `SELECT ... FOR UPDATE` before applying any deduction.
   - If `on_hand_quantity < requested_quantity`, the transaction aborts with `InsufficientStockError`, preventing concurrent overdrafts.
4. **Cross-Module Verification with Jobs & ShopFloor**:
   - Issues to Jobs and ShopFloor travelers validate server-side that the referenced `job_id` and `traveler_id` belong to the same active tenant.
5. **Idempotency & Atomic Audit Logging**:
   - All mutating requests require an `Idempotency-Key` header. Duplicate keys replay the original movement without re-deducting stock.
   - Every stock movement automatically writes a corresponding audit event to `audit_events` in the same atomic database transaction.

## Consequences
- Accurate inventory valuation and stock levels are maintained with complete audit traceability.
- Negative stock is mathematically impossible under high concurrency.
- Demo organizations remain completely isolated with zero database side effects.
