-- Yorkstead Operations: Seed Yorkstead Systems Root Organization (Tenant 0)
-- Creates the primary production organization and operator Brandon with owner role

-- 1. Seed Root Organization: Yorkstead Systems
INSERT INTO "organizations" ("id", "name", "slug", "status", "is_demo", "created_at", "updated_at")
VALUES (
  'org_yorkstead_systems',
  'Yorkstead Systems',
  'yorkstead',
  'active',
  false,
  now(),
  now()
)
ON CONFLICT ("id") DO UPDATE SET
  "name" = 'Yorkstead Systems',
  "slug" = 'yorkstead',
  "status" = 'active',
  "is_demo" = false,
  "updated_at" = now();

-- 2. Seed Operator Brandon User
INSERT INTO "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
VALUES (
  'usr_brandon_operator',
  'Brandon',
  'brandon@yorkstead.com',
  true,
  now(),
  now()
)
ON CONFLICT ("email") DO UPDATE SET
  "name" = 'Brandon',
  "emailVerified" = true,
  "updatedAt" = now();

-- 3. Seed Owner Membership in Yorkstead Systems
INSERT INTO "memberships" ("id", "organization_id", "user_id", "role", "created_at", "updated_at")
VALUES (
  'mem_yorkstead_owner',
  'org_yorkstead_systems',
  (SELECT "id" FROM "user" WHERE "email" = 'brandon@yorkstead.com'),
  'owner',
  now(),
  now()
)
ON CONFLICT ("user_id", "organization_id") DO UPDATE SET
  "role" = 'owner',
  "updated_at" = now();

-- 4. Record Initial Tenant 0 Establishment Audit Event
INSERT INTO "audit_events" ("id", "organization_id", "actor_id", "actor_name", "entity_type", "entity_id", "action", "summary", "created_at")
VALUES (
  'aud_tenant_zero_seed',
  'org_yorkstead_systems',
  (SELECT "id" FROM "user" WHERE "email" = 'brandon@yorkstead.com'),
  'Brandon',
  'organization',
  'org_yorkstead_systems',
  'identity.tenant_zero_established',
  'Yorkstead Systems established as Tenant 0 root organization for operator Brandon.',
  now()
)
ON CONFLICT ("id") DO NOTHING;
