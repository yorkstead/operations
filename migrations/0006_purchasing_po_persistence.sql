-- Migration 0006: Purchasing Vendors, Purchase Orders, Line Items, and Receiving Receipts Persistence
CREATE TABLE IF NOT EXISTS "purchasing_vendors" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "vendor_code" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "payment_terms" text NOT NULL DEFAULT 'net_30',
  "currency" text NOT NULL DEFAULT 'USD',
  "status" text NOT NULL DEFAULT 'active',
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "purchasing_purchase_orders" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "po_number" text NOT NULL, -- e.g. "PO-2026-042"
  "vendor_id" text NOT NULL,
  "vendor_name" text NOT NULL,
  "vendor_email" text NOT NULL,
  "status" text NOT NULL DEFAULT 'draft', -- draft, pending_approval, approved, sent_to_vendor, partially_received, received_complete, cancelled
  "subtotal_cost_cents" integer NOT NULL DEFAULT 0,
  "shipping_cost_cents" integer NOT NULL DEFAULT 0,
  "tax_cost_cents" integer NOT NULL DEFAULT 0,
  "total_cost_cents" integer NOT NULL DEFAULT 0,
  "approval_threshold_cents" integer NOT NULL DEFAULT 500000, -- $5,000 default threshold
  "requires_manager_approval" boolean NOT NULL DEFAULT false,
  "approved_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "approved_by_name" text,
  "approved_at" timestamp with time zone,
  "expected_delivery_date" text NOT NULL,
  "issued_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "purchasing_po_line_items" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "po_id" text NOT NULL REFERENCES "purchasing_purchase_orders"("id") ON DELETE CASCADE,
  "line_number" integer NOT NULL,
  "item_code" text NOT NULL,
  "description" text NOT NULL,
  "quantity_ordered" integer NOT NULL,
  "quantity_received" integer NOT NULL DEFAULT 0,
  "uom" text NOT NULL DEFAULT 'EA',
  "unit_cost_cents" integer NOT NULL DEFAULT 0,
  "total_cost_cents" integer NOT NULL DEFAULT 0,
  "linked_job_id" text REFERENCES "jobs"("id") ON DELETE SET NULL,
  "linked_job_number" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "purchasing_receiving_receipts" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "po_id" text NOT NULL REFERENCES "purchasing_purchase_orders"("id") ON DELETE CASCADE,
  "po_number" text NOT NULL,
  "packing_slip_number" text NOT NULL,
  "received_date" text NOT NULL,
  "received_by_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "received_by_name" text NOT NULL,
  "items_received" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "purchasing_material_shortages" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "job_id" text REFERENCES "jobs"("id") ON DELETE SET NULL,
  "job_number" text,
  "item_code" text NOT NULL,
  "description" text NOT NULL,
  "required_quantity" integer NOT NULL,
  "on_hand_quantity" integer NOT NULL DEFAULT 0,
  "shortage_quantity" integer NOT NULL,
  "uom" text NOT NULL DEFAULT 'EA',
  "needed_by_date" text NOT NULL,
  "urgency" text NOT NULL DEFAULT 'standard', -- standard, urgent, critical_line_down
  "status" text NOT NULL DEFAULT 'pending_rfq', -- pending_rfq, po_created, fulfilled, rejected
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_vendors_org" ON "purchasing_vendors" ("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_vendors_org_code" ON "purchasing_vendors" ("organization_id", "vendor_code");
CREATE INDEX IF NOT EXISTS "idx_po_org" ON "purchasing_purchase_orders" ("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_po_org_number" ON "purchasing_purchase_orders" ("organization_id", "po_number");
CREATE INDEX IF NOT EXISTS "idx_po_lines_po" ON "purchasing_po_line_items" ("po_id");
CREATE INDEX IF NOT EXISTS "idx_receipts_org" ON "purchasing_receiving_receipts" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_shortages_org" ON "purchasing_material_shortages" ("organization_id");
