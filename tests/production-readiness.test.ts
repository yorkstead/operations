import { describe, expect, it } from "bun:test";
import { validateMigrationFiles } from "../scripts/migrate";
import { getEnv } from "../lib/env";

describe("Production Readiness & Operational Gates Verification Suite", () => {
  it("validates offline migration file integrity and deterministic checksums", () => {
    const res = validateMigrationFiles();
    expect(res.count).toBeGreaterThanOrEqual(13);
    for (const m of res.migrations) {
      expect(m.checksum.length).toBe(64);
      expect(m.sql.length).toBeGreaterThan(50);
    }
  });

  it("enforces environment schema rules and prevents unsafe defaults in production", () => {
    const env = getEnv();
    expect(env.NODE_ENV).toBeDefined();
    expect(env.NEXT_PUBLIC_APP_NAME).toBe("Yorkstead Operations");
    expect(env.BETTER_AUTH_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it("verifies health check endpoint contract exposes truthful, non-leaking structure", async () => {
    const { GET } = await import("../app/api/health/readiness/route");
    const response = await GET();
    expect(response.status === 200 || response.status === 503).toBe(true);

    const body = await response.json();
    expect(body.service).toBe("yorkstead-operations");
    expect(body.checks).toBeDefined();
    expect(body.checks.storageVault).toBe("NOT_CONFIGURED");
    expect(body.checks.tenantIsolation).toBe("ENFORCED_SERVER_POLICY");
    expect(JSON.stringify(body).includes("postgres:")).toBe(false);
    expect(JSON.stringify(body).includes("secret")).toBe(false);
  });
});
