-- Migration 0008: Packaging Specifications, Packaging Units, and Packaged Items Persistence
CREATE TABLE IF NOT EXISTS "packaging_specifications" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "container_type" text NOT NULL DEFAULT 'box', -- box, crate, pallet, bundle, tote
  "max_weight_capacity_lbs" numeric(10, 2) NOT NULL DEFAULT '50.00',
  "tare_weight_lbs" numeric(10, 2) NOT NULL DEFAULT '2.00',
  "dimensions_inches" jsonb NOT NULL DEFAULT '{"length": 18, "width": 14, "height": 10}'::jsonb,
  "requires_cushioning" boolean NOT NULL DEFAULT false,
  "requires_banding" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "packaging_units" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "package_number" text NOT NULL, -- e.g. "PKG-2026-081" or "PALLET-2026-012"
  "container_type" text NOT NULL DEFAULT 'box',
  "specification_id" text REFERENCES "packaging_specifications"("id") ON DELETE SET NULL,
  "total_quantity" integer NOT NULL DEFAULT 0,
  "net_weight_lbs" numeric(10, 2) NOT NULL DEFAULT '0.00',
  "tare_weight_lbs" numeric(10, 2) NOT NULL DEFAULT '0.00',
  "gross_weight_lbs" numeric(10, 2) NOT NULL DEFAULT '0.00',
  "max_capacity_lbs" numeric(10, 2) NOT NULL DEFAULT '50.00',
  "dimensions_inches" jsonb NOT NULL DEFAULT '{"length": 18, "width": 14, "height": 10}'::jsonb,
  "label_barcode" text NOT NULL,
  "status" text NOT NULL DEFAULT 'in_pack', -- in_pack, ready_for_inspection, sealed_ready_for_shipping, quarantined
  "sealed_at" timestamp with time zone,
  "sealed_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "sealed_by_name" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "packaged_items" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "package_id" text NOT NULL REFERENCES "packaging_units"("id") ON DELETE CASCADE,
  "job_id" text REFERENCES "jobs"("id") ON DELETE SET NULL,
  "job_number" text,
  "part_description" text NOT NULL,
  "quantity_packed" integer NOT NULL DEFAULT 1,
  "unit_weight_lbs" numeric(10, 2) NOT NULL DEFAULT '0.00',
  "lot_number" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_pkg_specs_org" ON "packaging_specifications" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_pkg_units_org" ON "packaging_units" ("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_pkg_units_org_num" ON "packaging_units" ("organization_id", "package_number");
CREATE INDEX IF NOT EXISTS "idx_pkg_items_pkg" ON "packaged_items" ("package_id");
