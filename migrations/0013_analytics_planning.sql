-- Migration 0013: Analytics Planning Suggestions Persistence
CREATE TABLE IF NOT EXISTS "planning_suggestions" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "category" text NOT NULL DEFAULT 'workcenter_rebalance',
  "rationale" text NOT NULL,
  "constraints" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "trade_offs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "confidence_score" numeric(5, 4) NOT NULL DEFAULT 0.9000,
  "status" text NOT NULL DEFAULT 'pending', -- pending, approved, dismissed
  "approved_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "approved_by_name" text,
  "approved_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_planning_sug_org" ON "planning_suggestions" ("organization_id");
