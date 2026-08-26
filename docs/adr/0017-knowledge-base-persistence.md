# ADR 0017: Knowledge Base & SOP Persistence Architecture

## Context
Standard operating procedures (SOPs), machine setup checklists, equipment troubleshooting guides, and AI-cited shopfloor search previously operated in-memory. Shopfloor execution requires version-controlled SOPs in PostgreSQL, multi-step structured safety procedures, formal engineering review workflows, and grounded cited search with uncertainty detection.

## Decisions

1. **Schema & Tenancy Scoping**:
   - `knowledge_articles`: Root procedure tracking sequential `article_code` (`KNOW-YYYY-XXX`), category (`standard_operating_procedure`, `equipment_troubleshooting`, `safety_protocol`, `quality_standard`, `onboarding_training`), title, tags (JSONB), equipment links (JSONB), module links (JSONB), target roles (JSONB), and status (`draft`, `under_review`, `published`, `retired`).
   - `knowledge_revisions`: Immutable revision snapshots tracking title, content overview, changelog, reviewer user attribution, approval timestamp, and publish timestamp.
   - `knowledge_steps`: Ordered procedure steps with step numbers, instructions, media URLs, and safety warning callouts.

2. **Sequential Procedure Numbering**:
   - Procedures follow deterministic sequential codes per organization: `KNOW-YYYY-XXX`.

3. **Multi-Step Safety Callouts**:
   - Every procedure step supports dedicated `safetyWarning` callouts to highlight Lockout/Tagout (LOTO), pinch point, and electrical hazards.

4. **Grounded Cited Search**:
   - Search queries match against titles, contents, and procedure steps, returning exact passage citations, relevance scores, and explicit uncertainty flags when confidence < 0.35.

5. **Audit Logging**:
   - Article draft creation, revision submissions, publishing approvals, and query lookups append immutable records to `audit_events`.

## Status
Accepted — 2026-08-26
