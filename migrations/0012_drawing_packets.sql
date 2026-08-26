-- Migration 0012: Job Packet Documents and Drawing Intelligence Persistence
CREATE TABLE IF NOT EXISTS "job_packet_documents" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "job_id" text NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "job_number" text NOT NULL,
  "file_name" text NOT NULL,
  "file_storage_key" text NOT NULL,
  "file_size_bytes" bigint NOT NULL,
  "mime_type" text NOT NULL,
  "document_type" text NOT NULL DEFAULT 'engineering_drawing',
  "extraction_status" text NOT NULL DEFAULT 'pending', -- pending, extracting, extracted, approved, rejected, flagged_inconsistency
  "ai_model_used" text,
  "extracted_entities" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "inconsistencies" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "human_reviewer_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "human_reviewer_name" text,
  "human_approved_at" timestamp with time zone,
  "uploaded_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_packet_docs_org" ON "job_packet_documents" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_packet_docs_job" ON "job_packet_documents" ("organization_id", "job_id");
