# Security & Tenant Isolation Threat Model & Status Verification

## 1. Executive Summary
This document establishes the verified security architecture, threat mitigations, and tenant boundary controls for **Yorkstead Operations** (`https://ops.yorkstead.com`). In adherence to `AGENTS.md` and `docs/ARCHITECTURE.md`, every control is classified by its actual implementation status to maintain engineering truthfulness.

---

## 2. Comprehensive Threat Modeling & Status Classification

| Threat Vector | Attack Mechanism | Mitigating Architecture & Policy | Status Classification |
| :--- | :--- | :--- | :--- |
| **Insecure Direct Object Reference (IDOR)** | Attacker alters resource ID in API request to access another tenant's record | Every database query carries a mandatory server-side `organizationId` clause derived from verified server session. Cross-tenant queries return `404 Not Found`. | **Verified through real request/database path** (Jobs, ShopFloor, Inventory, Quality, Maintenance, Purchasing, Shipping, Packaging, Quoting, Files, Knowledge, Packet Intel, Analytics) |
| **Unauthorized Privilege Escalation** | Client modifies role payload to claim administrative access | Acting user and memberships are derived strictly from Better Auth HTTP headers/cookies. Client-provided user or tenant parameters are denied. | **Verified through real request/database path** |
| **Unauthorized Executive Planning Execution** | Operator authorizes plant rebalancing without executive clearance | Approving planning suggestions requires executive authorization (`org:manage_profile` / `owner`). Enforced server-side with `403 Forbidden`. | **Verified through server-side capability check** |
| **Silent Job Corruption via Untrusted AI** | Automated OCR parser extracts incorrect revision and overwrites production job | Extraction runs non-destructively; detected mismatches trigger `critical_mismatch` flags and require explicit human engineer approval before updating baseline. | **Verified through real request/database path** |
| **AI Hallucinations & Unsafe Shopfloor Instructions** | Operator searches for unapproved machine instructions | Grounded cited search requires exact passage citations with relevance scores; low confidence (< 0.35) returns explicit uncertainty warnings. | **Verified through real search path** |
| **Path Traversal & Unsafe Files** | Attacker crafts `../../etc/passwd` file keys to escape private storage root | File storage adapter enforces strict alphanumeric UUID keys and validates path containment before resolving URLs. | **Verified through real request/database path** |
| **Malicious File Execution & Malware Download** | Operator uploads infected file or dangerous macro sheet | Files flagged as `quarantined` are strictly locked from download with `423 Locked`. Quarantining requires administrative authorization. | **Verified through real request/database path** |
| **Low-Margin Quote Bypassing** | Estimator submits unapproved loss-leader quote without management review | Quotes with margin < 25% enforce `internal_review` status. Transmitting to clients without `quoting:approve_margin` capability is rejected with `403 Forbidden`. | **Verified through server-side capability check** |
| **Container Overload & Transport Hazards** | Client packs excessive parts exceeding container payload limits | Server-side validation enforces `grossWeightLbs <= maxCapacityLbs`. Overload attempts are rejected with `409 Conflict`. | **Verified through database transaction locking** |
| **Unauthorized Spend & Financial Exploitation** | Operator issues high-value purchase orders without executive sign-off | POs > $5,000 (500,000 cents) automatically enforce `pending_approval` state. Issuing to vendors without `purchasing:approve_po` capability is rejected with `403 Forbidden`. | **Verified through server-side capability check** |
| **Outbound Shipment Spoofing & Fraud** | Unauthorized driver dispatches unmanifested inventory containers | Staging packages and dispatching manifests requires `shipping:create_manifest` and `shipping:complete_shipment` capabilities with driver identity and carrier attribution recorded to audit log. | **Verified through real request/database path** |
| **Equipment Telemetry & Downtime Distortion** | Client posts duplicate simultaneous downtime intervals on single asset | Single-open-interval constraint enforced server-side. Simultaneous open intervals for the same equipment are rejected with `409 Conflict`. | **Verified through database transaction locking** |
| **Quality Segregation of Duties Bypass** | Operator logs defect and authorizes their own disposition without QA review | Creating NCRs requires `quality:record_inspection`. Approving engineering dispositions requires `quality:scrap_rework` (QA Manager / Admin / Owner only). Enforced server-side with `403 Forbidden`. | **Verified through server-side capability check** |
| **Negative Stock & Overdraft Exploits** | Concurrent race conditions cause balance deductions below zero | Dedicated `inventory_item_balances` rows locked via `SELECT ... FOR UPDATE` before deducting stock within atomic transaction. Negative stock requests rejected server-side with `409 Conflict`. | **Verified through real database locking path** |
| **CSV / Formula Injection** | Malicious CSV cells containing `=cmd|`, `+calc`, or `@SUM` execute on estimator spreadsheets | All imported and exported tabular cells strip or escape leading formula symbols (`=`, `+`, `-`, `@`). | **Unit-tested domain policy** |
| **Replay & Idempotency Abuse** | Duplicate POST requests cause duplicate stock deductions or double billing | Critical financial and inventory operations require idempotency keys and atomic state checks. | **Verified through real request/database path** |
| **Demo Sandbox Contamination** | Demo operations leak synthetic records into live customer accounts | Demo organizations operate under distinct synthetic `org_demo_*` in-memory repositories with zero side effects. | **Verified through real request path** |
| **Secret & Credential Leakage** | Database passwords or API tokens accidentally logged in error traces | Audit loggers and exception handlers automatically scrub sensitive keys (`password`, `token`, `secret`, `authorization`). Health endpoints never disclose connection strings. | **Verified through real request path** |

---

## 3. Server-Side Tenant Isolation Standard

All database models and service methods follow this mandatory implementation contract:

```typescript
// Mandatory Tenant Scoping Rule:
export async function getTenantJob(session: SessionContext, jobId: string) {
  const job = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.organizationId, session.activeOrganization.id)))
    .limit(1);

  if (job.length === 0) {
    throw new NotFoundError("Job record not found in active organization.");
  }
  return job[0];
}
```

---

## 4. Input Sanitization & Data Integrity

1. **Integer-Cents Financial Math**: All currency fields are stored and computed as integer cents (e.g. `$45.00` is `4500`), completely eliminating floating-point rounding drift.
2. **Fixed-Scale Decimal Quantities**: All inventory item quantities are represented via scaled bigint decimal math (`numeric(14, 4)`), supporting fractional units (e.g., `12.5000 SHEET`) without floating-point precision loss.
3. **Schema Validation**: All HTTP payloads are validated against strict Zod schemas at the trust boundary; unrecognized properties are stripped.
4. **Synthetic CI Fixtures**: Automated tests use 100% synthetic fixtures with zero production data dependencies.

---

## 5. Security & Verification Sign-off

- **Lead Architect**: Brandon York
- **Verification Date**: 2026-08-26
- **Readiness Classification**: Full Multi-Tenant Persistence across all 13 core operational manufacturing modules.
