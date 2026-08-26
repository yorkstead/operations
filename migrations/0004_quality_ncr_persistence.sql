-- Migration 0004: Quality Inspection Records and Non-Conformance Reports (NCR) Persistence
CREATE TABLE IF NOT EXISTS "quality_inspection_records" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "inspection_type" text NOT NULL, -- first_article, in_process, final_acceptance, receiving_dock
  "job_id" text NOT NULL REFERENCES "jobs"("id") ON DELETE RESTRICT,
  "job_number" text NOT NULL,
  "part_description" text NOT NULL,
  "traveler_operation_id" text,
  "inspector_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "inspector_name" text NOT NULL,
  "status" text NOT NULL, -- passed, failed, passed_with_concession
  "sample_size" integer NOT NULL,
  "passed_quantity" integer NOT NULL,
  "failed_quantity" integer NOT NULL,
  "checklist" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "ncr_id" text,
  "completed_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "quality_non_conformance_reports" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "ncr_number" text NOT NULL,
  "job_id" text NOT NULL REFERENCES "jobs"("id") ON DELETE RESTRICT,
  "job_number" text NOT NULL,
  "part_description" text NOT NULL,
  "operation_name" text NOT NULL,
  "defect_description" text NOT NULL,
  "defect_category" text NOT NULL,
  "severity" text NOT NULL, -- minor, major, critical
  "status" text NOT NULL DEFAULT 'open', -- open, under_containment, dispositioned, closed
  "defect_quantity" integer NOT NULL,
  "containment_actions" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "root_cause_analysis" text,
  "disposition" text NOT NULL DEFAULT 'pending_review', -- use_as_is, rework, scrap_and_remake, return_to_vendor, pending_review
  "disposition_notes" text,
  "scrap_cost_cents" integer NOT NULL DEFAULT 0,
  "rework_labor_minutes" integer NOT NULL DEFAULT 0,
  "remake_cost_cents" integer NOT NULL DEFAULT 0,
  "created_by_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "created_by_name" text NOT NULL,
  "approved_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "approved_by_name" text,
  "closed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_quality_insp_org" ON "quality_inspection_records" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_quality_insp_job" ON "quality_inspection_records" ("organization_id", "job_id");
CREATE INDEX IF NOT EXISTS "idx_quality_ncr_org" ON "quality_non_conformance_reports" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_quality_ncr_status" ON "quality_non_conformance_reports" ("organization_id", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_quality_ncr_number" ON "quality_non_conformance_reports" ("organization_id", "ncr_number");
