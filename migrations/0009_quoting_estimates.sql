-- Migration 0009: Quoting Quotes, Revisions, and Line Items Persistence
CREATE TABLE IF NOT EXISTS "quoting_quotes" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "quote_number" text NOT NULL, -- e.g. "QTE-2026-104"
  "customer_id" text NOT NULL,
  "customer_name" text NOT NULL,
  "customer_contact_email" text NOT NULL,
  "title" text NOT NULL,
  "status" text NOT NULL DEFAULT 'draft', -- draft, internal_review, approved, sent_to_customer, accepted, declined, expired, converted_to_job
  "current_revision_number" integer NOT NULL DEFAULT 1,
  "min_margin_threshold_percent" integer NOT NULL DEFAULT 25,
  "requires_executive_approval" boolean NOT NULL DEFAULT false,
  "approved_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "approved_by_name" text,
  "approved_at" timestamp with time zone,
  "expires_at" text NOT NULL,
  "converted_job_id" text REFERENCES "jobs"("id") ON DELETE SET NULL,
  "converted_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "quoting_quote_revisions" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "quote_id" text NOT NULL REFERENCES "quoting_quotes"("id") ON DELETE CASCADE,
  "revision_number" integer NOT NULL DEFAULT 1,
  "change_reason" text NOT NULL,
  "subtotal_cents" integer NOT NULL DEFAULT 0,
  "discount_percent" integer NOT NULL DEFAULT 0,
  "discount_amount_cents" integer NOT NULL DEFAULT 0,
  "tax_percent" integer NOT NULL DEFAULT 0,
  "tax_amount_cents" integer NOT NULL DEFAULT 0,
  "total_amount_cents" integer NOT NULL DEFAULT 0,
  "overall_margin_percent" numeric(5, 2) NOT NULL DEFAULT '0.00',
  "created_by_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "created_by_name" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "quoting_quote_line_items" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "revision_id" text NOT NULL REFERENCES "quoting_quote_revisions"("id") ON DELETE CASCADE,
  "line_item_number" integer NOT NULL,
  "part_description" text NOT NULL,
  "drawing_number" text,
  "revision" text,
  "quantity" integer NOT NULL DEFAULT 1,
  "cost_breakdown" jsonb NOT NULL,
  "target_margin_percent" integer NOT NULL DEFAULT 30,
  "unit_price_cents" integer NOT NULL DEFAULT 0,
  "total_price_cents" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_quotes_org" ON "quoting_quotes" ("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_quotes_org_num" ON "quoting_quotes" ("organization_id", "quote_number");
CREATE INDEX IF NOT EXISTS "idx_quote_revs_quote" ON "quoting_quote_revisions" ("quote_id");
CREATE INDEX IF NOT EXISTS "idx_quote_lines_rev" ON "quoting_quote_line_items" ("revision_id");
