import { describe, expect, it } from "bun:test";
import {
  loadMigrationFiles,
  computeFileChecksum,
  validateMigrationFiles,
  verifyLiveMigrationLedger,
  runMigrations,
} from "../scripts/migrate";
import { EXPECTED_MIGRATIONS } from "../db/migrations-manifest";

describe("Database Migration Integrity & Checksum Verification Suite", () => {
  it("loads and parses all application migration files with valid filenames and SHA-256 hashes", () => {
    const migrations = loadMigrationFiles();
    expect(migrations.length).toBeGreaterThanOrEqual(13);

    for (const m of migrations) {
      expect(m.filename.endsWith(".sql")).toBe(true);
      expect(m.checksum.length).toBe(64);
      expect(computeFileChecksum(m.sql)).toBe(m.checksum);
    }
  });

  it("keeps the runtime readiness manifest synchronized with migration files", () => {
    const migrations = loadMigrationFiles();
    expect(EXPECTED_MIGRATIONS.map(({ name, checksum }) => ({ name, checksum }))).toEqual(
      migrations.map(({ name, checksum }) => ({ name, checksum }))
    );
  });

  it("executes offline migration files validation", () => {
    const result = validateMigrationFiles();
    expect(result.count).toBeGreaterThanOrEqual(13);
    expect(result.migrations.length).toBe(result.count);
  });

  it("handles live migration ledger verification gracefully when offline", async () => {
    const live = await verifyLiveMigrationLedger();
    expect(live.expectedCount).toBeGreaterThanOrEqual(13);
    expect(["CURRENT", "BEHIND", "MISMATCH", "UNAVAILABLE"].includes(live.status)).toBe(true);
  });

  it("executes runMigrations with checkFilesOnly flag", async () => {
    const res = await runMigrations({ checkFilesOnly: true });
    expect(res.status).toBe("checked_files");
    expect(res.count).toBeGreaterThanOrEqual(13);
  });
});
