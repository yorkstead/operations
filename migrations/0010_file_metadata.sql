-- Migration 0010: File Vault Records Persistence
CREATE TABLE IF NOT EXISTS "file_vault_records" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "uploaded_by_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "uploaded_by_name" text NOT NULL,
  "filename" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" bigint NOT NULL DEFAULT 0,
  "storage_key" text NOT NULL,
  "checksum_sha256" text,
  "status" text NOT NULL DEFAULT 'clean', -- clean, quarantined, pending_scan, deleted
  "quarantine_reason" text,
  "entity_type" text, -- job, quality_ncr, quote, purchase_order
  "entity_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_files_org" ON "file_vault_records" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_files_entity" ON "file_vault_records" ("organization_id", "entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_files_status" ON "file_vault_records" ("organization_id", "status");
