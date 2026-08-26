# ADR 0018: Packet Intelligence & Engineering Drawings Persistence Architecture

## Context
Job packet document management, CAD/drawing OCR extraction, drawing revision discrepancy auditing (e.g. Drawing Rev B vs Customer PO Rev A), and department packet bundling previously operated in-memory. Shopfloor execution requires persistent PostgreSQL document metadata records, automated inconsistency detection that does not silently overwrite job truth, human engineer sign-off workflows, and department-specific packet views.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `job_packet_documents`: Document registry tracking `job_id`, `job_number`, `file_name`, `file_storage_key`, `file_size_bytes` (`bigint`), `mime_type`, `document_type` (`engineering_drawing`, `purchase_order`, `specification_sheet`, `material_cert`, `inspection_report`, `cad_archive`), `extraction_status` (`pending`, `extracting`, `extracted`, `approved`, `rejected`, `flagged_inconsistency`), `ai_model_used`, `extracted_entities` (JSONB), `inconsistencies` (JSONB), `human_reviewer_id`, `human_reviewer_name`, `human_approved_at`, `uploaded_at`.

2. **Non-Destructive Inconsistency Auditing**:
   - Extraction compares detected drawing metadata against job baseline truth. Discrepancies (e.g., drawing `REV B` vs job `REV A`, PO quantity `150` vs job `100`) flag `critical_mismatch` and transition status to `flagged_inconsistency` rather than silently mutating job truth.

3. **Human Engineer Sign-Off**:
   - Resolving inconsistencies requires explicit human approval with reviewer user attribution and timestamp.

4. **Department Packet Bundling**:
   - Assembles structured department packet manifests (`shopfloor`, `quality`, `purchasing`, `shipping`) containing tailored document subsets and verification checklists.

5. **Audit Logging**:
   - Document ingestion, extraction runs, inconsistency flags, and human sign-offs append immutable records to `audit_events`.

## Status
Accepted — 2026-08-26
