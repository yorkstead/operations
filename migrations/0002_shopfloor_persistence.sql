-- Yorkstead Operations: Shopfloor Digital Traveler & Work Center Persistence Migration

CREATE TABLE IF NOT EXISTS "work_centers" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "status" text DEFAULT 'available' NOT NULL,
  "hourly_cost_rate" real DEFAULT 85.0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "work_center_org_code_idx" ON "work_centers" ("organization_id", "code");
CREATE INDEX IF NOT EXISTS "work_centers_org_idx" ON "work_centers" ("organization_id");

CREATE TABLE IF NOT EXISTS "shopfloor_travelers" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "traveler_number" text NOT NULL,
  "qr_code_data" text NOT NULL,
  "job_id" text NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "job_number" text NOT NULL,
  "part_description" text NOT NULL,
  "customer_name" text NOT NULL,
  "total_quantity" integer NOT NULL,
  "current_step_index" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'queued' NOT NULL,
  "priority" text DEFAULT 'standard' NOT NULL,
  "target_due_date" text NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "traveler_number_org_idx" ON "shopfloor_travelers" ("organization_id", "traveler_number");
CREATE INDEX IF NOT EXISTS "travelers_org_idx" ON "shopfloor_travelers" ("organization_id");
CREATE INDEX IF NOT EXISTS "travelers_job_idx" ON "shopfloor_travelers" ("job_id");
CREATE INDEX IF NOT EXISTS "travelers_status_idx" ON "shopfloor_travelers" ("organization_id", "status");

CREATE TABLE IF NOT EXISTS "traveler_operations" (
  "id" text PRIMARY KEY,
  "traveler_id" text NOT NULL REFERENCES "shopfloor_travelers"("id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "sequence" integer NOT NULL,
  "work_center_code" text NOT NULL,
  "work_center_name" text NOT NULL,
  "operation_name" text NOT NULL,
  "required_quantity" integer NOT NULL,
  "completed_quantity" integer DEFAULT 0 NOT NULL,
  "scrapped_quantity" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "assigned_operator_id" text,
  "assigned_operator_name" text,
  "blocker_reason" text,
  "started_at" timestamp,
  "completed_at" timestamp,
  "actual_labor_minutes" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "traveler_ops_traveler_idx" ON "traveler_operations" ("traveler_id");
CREATE INDEX IF NOT EXISTS "traveler_ops_org_idx" ON "traveler_operations" ("organization_id");

CREATE TABLE IF NOT EXISTS "traveler_blockers" (
  "id" text PRIMARY KEY,
  "traveler_id" text NOT NULL REFERENCES "shopfloor_travelers"("id") ON DELETE CASCADE,
  "operation_id" text NOT NULL REFERENCES "traveler_operations"("id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "reported_by_user_id" text NOT NULL,
  "reported_by_name" text NOT NULL,
  "reason" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "resolved_by_user_id" text,
  "resolved_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "traveler_blockers_traveler_idx" ON "traveler_blockers" ("traveler_id");
CREATE INDEX IF NOT EXISTS "traveler_blockers_org_idx" ON "traveler_blockers" ("organization_id");
