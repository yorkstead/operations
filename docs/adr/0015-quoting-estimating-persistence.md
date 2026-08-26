# ADR 0015: QuoteFlow & Estimating Persistence Architecture

## Context
Sales quoting, cost breakdown estimation (materials, labor, machine time, freight, overhead), target margin pricing, executive margin floor review (< 25%), and one-click quote-to-job conversion previously operated in process memory and mock fixtures. Production manufacturing requires physical quote records in PostgreSQL, immutable revision tracking, integer-cents accounting, and atomic handoff to the live Jobs table.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `quoting_quotes`: Header table tracking sequential `quote_number` (`QTE-YYYY-XXX`), customer details, current revision number, margin threshold percent, executive review flags, status (`draft`, `internal_review`, `approved`, `sent_to_customer`, `accepted`, `declined`, `expired`, `converted_to_job`), and converted job link (`converted_job_id`).
   - `quoting_quote_revisions`: Multi-revision snapshots capturing subtotal, discounts, taxes, total amount in integer cents, overall margin percent, and author attribution.
   - `quoting_quote_line_items`: Line item extensions capturing part descriptions, drawing numbers, quantities, detailed cost breakdowns (JSONB), target margins, unit prices, and total prices in integer cents.

2. **Sequential Quote Numbering**:
   - Quotes follow deterministic sequential numbering per organization: `QTE-YYYY-XXX`.

3. **Pricing Formula & Margin Floor Governance**:
   - Pricing formula: `unitPriceCents = Math.round(totalCostCents / (1 - (targetMarginPercent / 100)))`
   - Quotes with `overallMarginPercent < minMarginThresholdPercent` (default 25%) automatically enter `internal_review` status and set `requiresExecutiveApproval = true`.
   - Approving low-margin quotes requires `quoting:approve_margin` capability.

4. **Atomic Quote-to-Job Conversion**:
   - When a quote is accepted and converted, the system atomically:
     1. Inserts a new production job into `jobs` table with customer details and line item parts.
     2. Sets `converted_job_id` on the quote record and transitions status to `converted_to_job` idempotently.

5. **Audit Logging**:
   - Every quote generation, revision creation, margin override approval, and job conversion appends an immutable record to `audit_events`.

## Status
Accepted — 2026-08-26
