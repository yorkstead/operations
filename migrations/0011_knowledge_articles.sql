-- Migration 0011: Knowledge Base Articles, Revisions, and Steps Persistence
CREATE TABLE IF NOT EXISTS "knowledge_articles" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "article_code" text NOT NULL, -- e.g. "KNOW-2026-001"
  "category" text NOT NULL DEFAULT 'standard_operating_procedure',
  "title" text NOT NULL,
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "linked_equipment_codes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "linked_module_codes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "target_roles" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'draft', -- draft, under_review, published, retired
  "current_revision_number" integer NOT NULL DEFAULT 1,
  "author_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "author_name" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "knowledge_revisions" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "article_id" text NOT NULL REFERENCES "knowledge_articles"("id") ON DELETE CASCADE,
  "revision_number" integer NOT NULL DEFAULT 1,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "change_log" text NOT NULL,
  "reviewed_by_user_id" text REFERENCES "user"("id") ON DELETE RESTRICT,
  "reviewed_by_name" text,
  "approved_at" timestamp with time zone,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "knowledge_steps" (
  "id" text PRIMARY KEY NOT NULL,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "revision_id" text NOT NULL REFERENCES "knowledge_revisions"("id") ON DELETE CASCADE,
  "step_number" integer NOT NULL,
  "title" text NOT NULL,
  "instruction" text NOT NULL,
  "safety_warning" text,
  "media_url" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_know_articles_org" ON "knowledge_articles" ("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_know_articles_org_code" ON "knowledge_articles" ("organization_id", "article_code");
CREATE INDEX IF NOT EXISTS "idx_know_revs_article" ON "knowledge_revisions" ("article_id");
CREATE INDEX IF NOT EXISTS "idx_know_steps_rev" ON "knowledge_steps" ("revision_id");
