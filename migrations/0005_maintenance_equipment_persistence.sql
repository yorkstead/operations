-- Migration 0005: Equipment Assets, Downtime Intervals & Maintenance Work Orders Persistence
CREATE TABLE IF NOT EXISTS "equipment_assets" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "asset_tag" text NOT NULL, -- e.g. "EQ-LASER-01"
  "name" text NOT NULL,
  "manufacturer" text NOT NULL,
  "model_number" text NOT NULL,
  "serial_number" text NOT NULL,
  "work_center_code" text NOT NULL,
  "location_code" text NOT NULL,
  "criticality" text NOT NULL DEFAULT 'medium', -- low, medium, high, critical_single_point_of_failure
  "status" text NOT NULL DEFAULT 'operational', -- operational, degraded, down_unplanned, down_planned_pm, under_repair
  "qr_code_data" text NOT NULL,
  "last_service_date" text NOT NULL,
  "next_scheduled_pm_date" text NOT NULL,
  "total_run_hours" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "maintenance_downtime_intervals" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "equipment_id" text NOT NULL REFERENCES "equipment_assets"("id") ON DELETE CASCADE,
  "asset_tag" text NOT NULL,
  "category" text NOT NULL, -- unplanned_breakdown, planned_preventive, tooling_failure, operator_error, waiting_for_parts
  "reason" text NOT NULL,
  "impact_summary" text NOT NULL,
  "started_at" timestamp with time zone NOT NULL DEFAULT now(),
  "resolved_at" timestamp with time zone,
  "duration_minutes" integer,
  "reported_by_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "reported_by_name" text NOT NULL,
  "resolved_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "resolved_by_name" text,
  "work_order_id" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "maintenance_work_orders" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "work_order_number" text NOT NULL, -- e.g. "MNT-2026-018"
  "equipment_id" text NOT NULL REFERENCES "equipment_assets"("id") ON DELETE CASCADE,
  "asset_tag" text NOT NULL,
  "type" text NOT NULL, -- corrective_emergency, preventive_scheduled, facility_improvement
  "status" text NOT NULL DEFAULT 'open', -- open, in_progress, waiting_parts, completed_pending_signoff, closed_returned_to_service
  "title" text NOT NULL,
  "description" text NOT NULL,
  "priority" text NOT NULL DEFAULT 'standard', -- standard, urgent, emergency
  "assigned_technician_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "assigned_technician_name" text,
  "replacement_parts_used" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "actual_labor_minutes" integer NOT NULL DEFAULT 0,
  "return_to_service_authorized_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "return_to_service_authorized_by_name" text,
  "return_to_service_notes" text,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_equipment_org" ON "equipment_assets" ("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_equipment_org_tag" ON "equipment_assets" ("organization_id", "asset_tag");
CREATE INDEX IF NOT EXISTS "idx_downtime_org" ON "maintenance_downtime_intervals" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_downtime_equip" ON "maintenance_downtime_intervals" ("organization_id", "equipment_id");
CREATE INDEX IF NOT EXISTS "idx_mwo_org" ON "maintenance_work_orders" ("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_mwo_org_number" ON "maintenance_work_orders" ("organization_id", "work_order_number");
