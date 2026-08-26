# Synthetic Data Remediation & Cleanliness Guide

## 1. Principle of Zero Implicit Writes on Read
In **Yorkstead Operations**, ordinary queries (`list*`, `get*`, `find*`, `metrics*`) must perform pure read operations against the database. An empty production customer organization must return zero records (`[]`) without silently inserting demo records, sample work centers, or placeholder quotes.

---

## 2. Demo Seeding Guardrails
- Synthetic demo data may **only** be seeded into organizations explicitly classified as demo environments (`isDemo: true` or verified demo slug prefix).
- Seeding requests targeting production customer organizations (`isDemo: false`) are rejected with an explicit HTTP 403 / Domain error.
- All seeding operations are tenant-scoped, idempotent (safe to rerun without duplicating records), and audited in `audit_events`.

---

## 3. Remediation Procedure for Contaminated Organizations
If a production customer organization was inadvertently seeded with synthetic records during development:

1. **Non-Destructive Diagnosis**:
   - Run `demoSeedingService.auditOrganizationContamination(session)` or query the diagnostic audit tool.
   - Identify synthetic fixtures by known seed identifiers (e.g. `seed_`, `DWG-2026-999`, `cust_apex_aero`, `PKG-SEED-01`).
2. **Review & Customer Confirmation**:
   - **Do NOT run automated destructive deletions on production databases**.
   - Generate a remediation briefing detailing the identified fixture keys and review with the customer / lead operator.
3. **Targeted Cleanup**:
   - Execute authorized, tenant-scoped administrative removal exclusively for the confirmed synthetic record IDs within a discrete transaction.
