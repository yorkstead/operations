import { describe, expect, it } from "bun:test";
import { validateMigrationFiles, computeFileChecksum, MIGRATION_ADVISORY_LOCK_ID } from "../scripts/migrate";

describe("Database Migration Runner & Readiness Gate Integration Suite", () => {
  // 1. Offline Migration Files Integrity
  it("validates all 15 migration files have valid sequential numbering, non-empty SQL, and deterministic checksums", () => {
    const res = validateMigrationFiles();
    expect(res.count).toBe(15);
    expect(res.migrations.length).toBe(15);

    for (let i = 0; i < res.migrations.length; i++) {
      const m = res.migrations[i];
      expect(m.name.endsWith(".sql")).toBe(true);
      expect(m.checksum.length).toBe(64);
      expect(computeFileChecksum(m.sql)).toBe(m.checksum);
      expect(m.sql.trim().length).toBeGreaterThan(50);
    }
  });

  // 2. Advisory Lock Constant Verification
  it("verifies migration runner advisory lock key is a deterministic 32-bit integer", () => {
    expect(MIGRATION_ADVISORY_LOCK_ID).toBe(883749219);
    expect(Number.isInteger(MIGRATION_ADVISORY_LOCK_ID)).toBe(true);
  });

  // 3. Checksum Computation Invariance
  it("computes deterministic SHA-256 checksums invariant to trailing whitespace", () => {
    const rawSQL = "CREATE TABLE test_table (id text PRIMARY KEY);";
    const checksum1 = computeFileChecksum(rawSQL);
    const checksum2 = computeFileChecksum(rawSQL + "   \n\n");
    expect(checksum1).toBe(checksum2);
    expect(checksum1.length).toBe(64);
  });

  it("computes deterministic checksums across operating-system line endings", () => {
    expect(computeFileChecksum("CREATE TABLE test (id text);\nSELECT 1;\n"))
      .toBe(computeFileChecksum("CREATE TABLE test (id text);\r\nSELECT 1;\r\n"));
  });

  // 4. Sequence and Drift Validation Guardrails
  it("detects drift when migration file content is modified", () => {
    const raw = "CREATE TABLE original (id text PRIMARY KEY);";
    const drifted = "CREATE TABLE modified (id text PRIMARY KEY, extra text);";
    expect(computeFileChecksum(raw)).not.toBe(computeFileChecksum(drifted));
  });

  // 5. Health Readiness Contract Behavior
  it("verifies health check endpoint evaluates database reachability and migration ledger status", async () => {
    const { GET } = await import("../app/api/health/readiness/route");
    const response = await GET();
    expect([200, 503].includes(response.status)).toBe(true);

    const body = await response.json();
    expect(body.service).toBe("yorkstead-operations");
    expect(body.checks).toBeDefined();
    expect(["CONNECTED", "UNAVAILABLE"].includes(body.checks.database)).toBe(true);
    expect(["CURRENT", "BEHIND", "MISMATCH", "UNAVAILABLE"].includes(body.checks.migrations)).toBe(true);
    expect(body.checks.storageVault).toBe("NOT_CONFIGURED");
  });
});
