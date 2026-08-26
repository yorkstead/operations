# ADR 0014: Packaging & Palletization Persistence Architecture

## Context
Packaging container registries, tare/net/gross weight calculations, capacity overload constraints, job part packing, tamper-evident container sealing, and shipping label barcodes previously operated in process memory and mock fixtures. Production manufacturing requires container records in PostgreSQL, strict weight limit enforcement, traceability to job lots, and operator sealing sign-offs.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `packaging_specifications`: Standard container specs (box sizes, pallet specs, max capacity, tare weights, cushioning/banding requirements).
   - `packaging_units`: Container records tracking sequential `package_number` (`PKG-YYYY-XXX` or `PALLET-YYYY-XXX`), container type (`box`, `crate`, `pallet`, `bundle`, `tote`), gross/tare/net weights (`numeric(10,2)`), max capacity, status (`in_pack`, `ready_for_inspection`, `sealed_ready_for_shipping`, `quarantined`), label barcode URI, and sealing attribution.
   - `packaged_items`: Line items packed into container with job links, part descriptions, quantities, unit weights, and lot numbers.

2. **Sequential Container Numbering**:
   - Pallets: `PALLET-YYYY-XXX`
   - Boxes/crates/totes/bundles: `PKG-YYYY-XXX`

3. **Capacity Guardrail**:
   - When packing parts into a container, `grossWeightLbs = tareWeightLbs + netWeightLbs`.
   - If `grossWeightLbs > maxCapacityLbs`, the transaction is aborted with a Capacity Violation error to prevent physical overloads.

4. **Tamper-Evident Sealing & Label Generation**:
   - Sealing stamps `status = 'sealed_ready_for_shipping'`, records operator attribution and timestamp, and generates a deterministic barcode URI (`yorkstead://package/<packageNumber>`).

5. **Audit Logging**:
   - Container creation, part packing, and container sealing append immutable records to `audit_events`.

## Status
Accepted — 2026-08-26
