-- Migration 0007: Shipping Manifests, Multi-Stop Logistics Routes, and Package Persistence
CREATE TABLE IF NOT EXISTS "shipping_manifests" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "manifest_number" text NOT NULL, -- e.g. "BOL-2026-092"
  "carrier_type" text NOT NULL DEFAULT 'ltl_freight', -- dedicated_flatbed, ltl_freight, parcel_express, customer_will_call, hotshot_courier
  "carrier_name" text NOT NULL,
  "tracking_or_pro_number" text NOT NULL,
  "driver_name" text,
  "trailer_or_plate_number" text,
  "total_packages" integer NOT NULL DEFAULT 0,
  "total_gross_weight_lbs" numeric(10, 2) NOT NULL DEFAULT '0.00',
  "status" text NOT NULL DEFAULT 'draft_manifest', -- draft_manifest, staged_for_loading, dispatched_in_transit, delivered, cancelled
  "bill_of_lading_barcode" text NOT NULL,
  "dispatched_at" timestamp with time zone,
  "dispatched_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "dispatched_by_name" text,
  "delivered_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "shipping_stops" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "manifest_id" text NOT NULL REFERENCES "shipping_manifests"("id") ON DELETE CASCADE,
  "stop_sequence" integer NOT NULL DEFAULT 1,
  "destination_customer_name" text NOT NULL,
  "destination_address" text NOT NULL,
  "package_numbers" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "contact_person" text,
  "contact_phone" text,
  "delivery_notes" text,
  "status" text NOT NULL DEFAULT 'pending', -- pending, delivered
  "signed_by" text,
  "delivered_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "shipping_manifest_packages" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "manifest_id" text NOT NULL REFERENCES "shipping_manifests"("id") ON DELETE CASCADE,
  "package_number" text NOT NULL,
  "gross_weight_lbs" numeric(10, 2) NOT NULL DEFAULT '0.00',
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_manifest_org" ON "shipping_manifests" ("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_manifest_org_number" ON "shipping_manifests" ("organization_id", "manifest_number");
CREATE INDEX IF NOT EXISTS "idx_stops_manifest" ON "shipping_stops" ("manifest_id");
CREATE INDEX IF NOT EXISTS "idx_packages_manifest" ON "shipping_manifest_packages" ("manifest_id");
