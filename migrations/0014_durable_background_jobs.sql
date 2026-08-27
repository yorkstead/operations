-- Migration 0014: Durable, tenant-scoped background job ledger and database queue.
CREATE TABLE IF NOT EXISTS "background_jobs" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'queued' CHECK ("status" IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  "progress" integer NOT NULL DEFAULT 0 CHECK ("progress" BETWEEN 0 AND 100),
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "result" jsonb,
  "error" jsonb,
  "resource_type" text,
  "resource_id" text,
  "idempotency_key" text NOT NULL,
  "attempts" integer NOT NULL DEFAULT 0 CHECK ("attempts" >= 0),
  "max_attempts" integer NOT NULL DEFAULT 3 CHECK ("max_attempts" > 0),
  "available_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_by_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "created_by_name" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "background_jobs_org_idempotency_idx"
  ON "background_jobs" ("organization_id", "type", "idempotency_key");
CREATE INDEX IF NOT EXISTS "background_jobs_claim_idx"
  ON "background_jobs" ("status", "available_at", "created_at");
CREATE INDEX IF NOT EXISTS "background_jobs_resource_idx"
  ON "background_jobs" ("organization_id", "resource_type", "resource_id");
