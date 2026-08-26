-- Migration 0003: Inventory Movement Ledger & Stock Management
CREATE TABLE IF NOT EXISTS "inventory_items" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "item_code" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "unit_of_measure" text NOT NULL,
  "default_location_id" text,
  "reorder_point" numeric(14, 4) DEFAULT '0.0000' NOT NULL,
  "reorder_quantity" numeric(14, 4) DEFAULT '0.0000' NOT NULL,
  "standard_cost_cents" integer DEFAULT 0 NOT NULL,
  "lot_tracking_required" boolean DEFAULT false NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_items_org_code_idx" ON "inventory_items" ("organization_id", "item_code");
CREATE INDEX IF NOT EXISTS "inventory_items_org_idx" ON "inventory_items" ("organization_id");
CREATE INDEX IF NOT EXISTS "inventory_items_category_idx" ON "inventory_items" ("organization_id", "category");

CREATE TABLE IF NOT EXISTS "inventory_locations" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "location_code" text NOT NULL,
  "name" text NOT NULL,
  "type" text DEFAULT 'bin' NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_locations_org_code_idx" ON "inventory_locations" ("organization_id", "location_code");
CREATE INDEX IF NOT EXISTS "inventory_locations_org_idx" ON "inventory_locations" ("organization_id");

CREATE TABLE IF NOT EXISTS "inventory_lots" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "item_id" text NOT NULL REFERENCES "inventory_items"("id") ON DELETE CASCADE,
  "lot_number" text NOT NULL,
  "manufacture_date" timestamp,
  "expiration_date" timestamp,
  "supplier_reference" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_lots_org_item_lot_idx" ON "inventory_lots" ("organization_id", "item_id", "lot_number");
CREATE INDEX IF NOT EXISTS "inventory_lots_org_idx" ON "inventory_lots" ("organization_id");
CREATE INDEX IF NOT EXISTS "inventory_lots_item_idx" ON "inventory_lots" ("item_id");

CREATE TABLE IF NOT EXISTS "inventory_item_balances" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "item_id" text NOT NULL REFERENCES "inventory_items"("id") ON DELETE CASCADE,
  "location_id" text NOT NULL REFERENCES "inventory_locations"("id") ON DELETE CASCADE,
  "lot_id" text REFERENCES "inventory_lots"("id") ON DELETE SET NULL,
  "on_hand_quantity" numeric(14, 4) DEFAULT '0.0000' NOT NULL,
  "allocated_quantity" numeric(14, 4) DEFAULT '0.0000' NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "inv_balances_unique_idx" ON "inventory_item_balances" ("organization_id", "item_id", "location_id", coalesce("lot_id", 'NO_LOT'));
CREATE INDEX IF NOT EXISTS "inv_balances_item_idx" ON "inventory_item_balances" ("organization_id", "item_id");
CREATE INDEX IF NOT EXISTS "inv_balances_loc_idx" ON "inventory_item_balances" ("organization_id", "location_id");

CREATE TABLE IF NOT EXISTS "inventory_movements" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "movement_type" text NOT NULL,
  "item_id" text NOT NULL REFERENCES "inventory_items"("id") ON DELETE CASCADE,
  "lot_id" text REFERENCES "inventory_lots"("id") ON DELETE SET NULL,
  "from_location_id" text REFERENCES "inventory_locations"("id") ON DELETE SET NULL,
  "to_location_id" text REFERENCES "inventory_locations"("id") ON DELETE SET NULL,
  "quantity" numeric(14, 4) NOT NULL,
  "unit_cost_cents" integer DEFAULT 0 NOT NULL,
  "job_id" text REFERENCES "jobs"("id") ON DELETE SET NULL,
  "traveler_id" text REFERENCES "shopfloor_travelers"("id") ON DELETE SET NULL,
  "original_movement_id" text REFERENCES "inventory_movements"("id") ON DELETE SET NULL,
  "actor_user_id" text NOT NULL,
  "reason" text,
  "idempotency_key" text,
  "occurred_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "inv_movements_idemp_idx" ON "inventory_movements" ("organization_id", "idempotency_key");
CREATE INDEX IF NOT EXISTS "inv_movements_org_idx" ON "inventory_movements" ("organization_id");
CREATE INDEX IF NOT EXISTS "inv_movements_item_idx" ON "inventory_movements" ("organization_id", "item_id");
CREATE INDEX IF NOT EXISTS "inv_movements_job_idx" ON "inventory_movements" ("job_id");
CREATE INDEX IF NOT EXISTS "inv_movements_traveler_idx" ON "inventory_movements" ("traveler_id");
CREATE INDEX IF NOT EXISTS "inv_movements_occurred_idx" ON "inventory_movements" ("organization_id", "occurred_at");

CREATE TABLE IF NOT EXISTS "inventory_cycle_counts" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "item_id" text NOT NULL REFERENCES "inventory_items"("id") ON DELETE CASCADE,
  "location_id" text NOT NULL REFERENCES "inventory_locations"("id") ON DELETE CASCADE,
  "lot_id" text REFERENCES "inventory_lots"("id") ON DELETE SET NULL,
  "expected_quantity" numeric(14, 4) NOT NULL,
  "observed_quantity" numeric(14, 4) NOT NULL,
  "variance_quantity" numeric(14, 4) NOT NULL,
  "reason" text NOT NULL,
  "counted_by_user_id" text NOT NULL,
  "approved_by_user_id" text,
  "resulting_movement_id" text REFERENCES "inventory_movements"("id") ON DELETE SET NULL,
  "counted_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "inv_cycle_counts_org_idx" ON "inventory_cycle_counts" ("organization_id");
CREATE INDEX IF NOT EXISTS "inv_cycle_counts_item_idx" ON "inventory_cycle_counts" ("organization_id", "item_id");
