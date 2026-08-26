-- Yorkstead Operations: Initial PostgreSQL Schema Migration
-- Creates Better Auth, Organizations, Memberships, Jobs, Revisions, Timeline, and Audit Ledger

CREATE TABLE IF NOT EXISTS "application_migrations" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "checksum" text NOT NULL,
  "applied_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "email_verified" boolean DEFAULT false NOT NULL,
  "image" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expires_at" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "password" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "organizations" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "status" text DEFAULT 'active' NOT NULL,
  "is_demo" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "memberships" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_org_idx" ON "memberships" ("user_id", "organization_id");
CREATE INDEX IF NOT EXISTS "memberships_org_idx" ON "memberships" ("organization_id");

CREATE TABLE IF NOT EXISTS "jobs" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "job_number" text NOT NULL,
  "title" text NOT NULL,
  "customer_id" text NOT NULL,
  "customer_name" text NOT NULL,
  "current_status" text NOT NULL,
  "priority" text DEFAULT 'standard' NOT NULL,
  "current_revision" text DEFAULT 'A' NOT NULL,
  "target_due_date" text NOT NULL,
  "estimated_labor_hours" integer DEFAULT 10 NOT NULL,
  "notes" text,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "job_number_org_idx" ON "jobs" ("organization_id", "job_number");
CREATE INDEX IF NOT EXISTS "jobs_org_idx" ON "jobs" ("organization_id");
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs" ("organization_id", "current_status");

CREATE TABLE IF NOT EXISTS "job_timeline_events" (
  "id" text PRIMARY KEY,
  "job_id" text NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "from_status" text NOT NULL,
  "to_status" text NOT NULL,
  "actor_user_id" text NOT NULL,
  "actor_name" text NOT NULL,
  "reason" text NOT NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "job_timeline_job_idx" ON "job_timeline_events" ("job_id");
CREATE INDEX IF NOT EXISTS "job_timeline_org_idx" ON "job_timeline_events" ("organization_id");

CREATE TABLE IF NOT EXISTS "job_revisions" (
  "id" text PRIMARY KEY,
  "job_id" text NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "revision" text NOT NULL,
  "change_summary" text NOT NULL,
  "changed_by_user_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "job_revisions_job_idx" ON "job_revisions" ("job_id");
CREATE INDEX IF NOT EXISTS "job_revisions_org_idx" ON "job_revisions" ("organization_id");

CREATE TABLE IF NOT EXISTS "audit_events" (
  "id" text PRIMARY KEY,
  "organization_id" text NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "actor_id" text NOT NULL,
  "actor_name" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "action" text NOT NULL,
  "summary" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "audit_org_idx" ON "audit_events" ("organization_id");
CREATE INDEX IF NOT EXISTS "audit_entity_idx" ON "audit_events" ("organization_id", "entity_type", "entity_id");
