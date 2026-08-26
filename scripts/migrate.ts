import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Client } from "pg";
import { env } from "../lib/env";

export interface MigrationFile {
  filename: string;
  filepath: string;
  version: string;
  name: string;
  checksum: string;
  legacyChecksums: string[];
  sql: string;
}

export const MIGRATION_ADVISORY_LOCK_ID = 883749219;

export function computeFileChecksum(content: string): string {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function computeLegacyChecksums(content: string): string[] {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  return [normalized, normalized.replace(/\n/g, "\r\n")]
    .map((value) => crypto.createHash("sha256").update(value).digest("hex"));
}

function checksumMatches(migration: MigrationFile, recorded: string): boolean {
  return recorded === migration.checksum || migration.legacyChecksums.includes(recorded);
}

export function loadMigrationFiles(migrationsDir?: string): MigrationFile[] {
  const dir = migrationsDir || path.join(process.cwd(), "migrations");
  if (!fs.existsSync(dir)) {
    throw new Error(`Migrations directory not found: ${dir}`);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files.map((filename) => {
    const filepath = path.join(dir, filename);
    const sql = fs.readFileSync(filepath, "utf-8");
    const match = filename.match(/^(\d+)_?(.*)\.sql$/);
    const version = match ? match[1] : filename;
    const checksum = computeFileChecksum(sql);

    return {
      filename,
      filepath,
      version,
      name: filename,
      checksum,
      legacyChecksums: computeLegacyChecksums(sql),
      sql,
    };
  });
}

export function validateMigrationFiles(migrationsDir?: string): { count: number; migrations: MigrationFile[] } {
  const migrations = loadMigrationFiles(migrationsDir);
  console.log(`[Database Migration Runner] Offline File Validation: ${migrations.length} migration file(s) found.`);

  let lastVersion = 0;
  for (const m of migrations) {
    if (!m.sql.trim()) {
      throw new Error(`Invalid empty migration file: ${m.filename}`);
    }
    const verNum = parseInt(m.version, 10);
    if (!isNaN(verNum)) {
      if (verNum <= lastVersion) {
        throw new Error(`Migration sequence error: ${m.filename} (v${verNum}) must be greater than previous (v${lastVersion})`);
      }
      lastVersion = verNum;
    }
    console.log(`  ✓ ${m.filename} (SHA256: ${m.checksum.substring(0, 12)}...)`);
  }

  console.log(`[Database Migration Runner] All ${migrations.length} migration files valid.`);
  return { count: migrations.length, migrations };
}

export async function verifyLiveMigrationLedger(databaseUrl?: string, migrationsDir?: string): Promise<{
  connected: boolean;
  appliedCount: number;
  expectedCount: number;
  status: "CURRENT" | "BEHIND" | "MISMATCH" | "UNAVAILABLE";
  error?: string;
}> {
  const targetUrl = databaseUrl || env.DATABASE_URL;
  const migrations = loadMigrationFiles(migrationsDir);
  const client = new Client({ connectionString: targetUrl, connectionTimeoutMillis: 3000 });

  try {
    await client.connect();
    const result = await client.query<{ name: string; checksum: string }>(
      `SELECT id, name, checksum, applied_at FROM "application_migrations" ORDER BY id ASC`
    );
    const rows = result.rows;

    const appliedMap = new Map<string, string>();
    for (const row of rows) {
      appliedMap.set(row.name, row.checksum);
    }

    if (rows.length < migrations.length) {
      for (const row of rows) {
        const matchingFile = migrations.find((m) => m.name === row.name);
        if (matchingFile && !checksumMatches(matchingFile, row.checksum)) {
          return {
            connected: true,
            appliedCount: rows.length,
            expectedCount: migrations.length,
            status: "MISMATCH",
            error: `Checksum mismatch in recorded migration: ${row.name}`,
          };
        }
      }
      return {
        connected: true,
        appliedCount: rows.length,
        expectedCount: migrations.length,
        status: "BEHIND",
      };
    }

    for (const m of migrations) {
      const recorded = appliedMap.get(m.name);
      if (!recorded) {
        return {
          connected: true,
          appliedCount: rows.length,
          expectedCount: migrations.length,
          status: "BEHIND",
        };
      }
      if (!checksumMatches(m, recorded)) {
        return {
          connected: true,
          appliedCount: rows.length,
          expectedCount: migrations.length,
          status: "MISMATCH",
          error: `Checksum mismatch in ${m.name}: Recorded ${recorded} !== Local ${m.checksum}`,
        };
      }
    }

    return {
      connected: true,
      appliedCount: rows.length,
      expectedCount: migrations.length,
      status: "CURRENT",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database connection failed";
    return {
      connected: false,
      appliedCount: 0,
      expectedCount: migrations.length,
      status: "UNAVAILABLE",
      error: msg,
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function runMigrations(options: {
  checkFilesOnly?: boolean;
  checkLiveOnly?: boolean;
  migrationsDir?: string;
  databaseUrl?: string;
}): Promise<{ status: string; count?: number; appliedCount?: number; live?: unknown }> {
  if (options.checkFilesOnly) {
    const res = validateMigrationFiles(options.migrationsDir);
    return { status: "checked_files", count: res.count, appliedCount: res.count };
  }

  if (options.checkLiveOnly) {
    const live = await verifyLiveMigrationLedger(options.databaseUrl, options.migrationsDir);
    console.log(
      `[Database Migration Runner] Live Ledger Check: Status=${live.status} (Applied ${live.appliedCount}/${live.expectedCount})`
    );
    if (live.status !== "CURRENT") {
      throw new Error(`Live database migration check failed: ${live.status} ${live.error || ""}`);
    }
    return { status: "checked_live", live };
  }

  const targetUrl = options.databaseUrl || env.DATABASE_URL;
  const migrations = loadMigrationFiles(options.migrationsDir);

  const client = new Client({ connectionString: targetUrl });
  await client.connect();

  try {
    console.log("[Database Migration Runner] Acquiring advisory migration lock...");
    const lockRes = await client.query<{ locked: boolean }>(
      "SELECT pg_try_advisory_lock($1) as locked",
      [MIGRATION_ADVISORY_LOCK_ID]
    );

    if (!lockRes.rows[0]?.locked) {
      throw new Error(
        "Could not acquire migration lock: another migration process is currently running."
      );
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS "application_migrations" (
          "id" text PRIMARY KEY,
          "name" text NOT NULL UNIQUE,
          "checksum" text NOT NULL,
          "applied_at" timestamp DEFAULT now() NOT NULL
        );
      `);

      const appliedRes = await client.query<{ name: string; checksum: string }>(
        'SELECT name, checksum FROM "application_migrations" ORDER BY id ASC'
      );
      const appliedMap = new Map<string, string>();
      for (const row of appliedRes.rows) {
        appliedMap.set(row.name, row.checksum);
      }

      for (const m of migrations) {
        const recorded = appliedMap.get(m.name);
        if (recorded && !checksumMatches(m, recorded)) {
          throw new Error(
            `Migration Checksum Mismatch in ${m.name}: Recorded ${recorded} differs from file ${m.checksum}. Applied migrations are immutable.`
          );
        }
      }

      let appliedCount = 0;

      for (const m of migrations) {
        if (appliedMap.has(m.name)) {
          console.log(`[Database Migration Runner] Skipping already applied: ${m.name}`);
          continue;
        }

        console.log(`[Database Migration Runner] Applying atomically: ${m.name}...`);

        await client.query("BEGIN;");
        try {
          await client.query(m.sql);

          await client.query(
            'INSERT INTO "application_migrations" ("id", "name", "checksum", "applied_at") VALUES ($1, $2, $3, now())',
            [m.name, m.name, m.checksum]
          );

          await client.query("COMMIT;");
          appliedCount++;
          console.log(`[Database Migration Runner] Successfully applied: ${m.name}`);
        } catch (migrationErr) {
          await client.query("ROLLBACK;");
          throw new Error(
            `Failed to apply migration ${m.name}: ${migrationErr instanceof Error ? migrationErr.message : String(migrationErr)}`
          );
        }
      }

      console.log(
        `[Database Migration Runner] Migration run complete. ${appliedCount} new migration(s) applied.`
      );
      return { status: "applied", appliedCount };
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_ADVISORY_LOCK_ID]);
    }
  } finally {
    await client.end();
  }
}

async function main() {
  const isCheckFiles =
    process.argv.includes("--check-files") ||
    (process.argv.includes("--check") && !process.argv.includes("--check-live"));
  const isCheckLive = process.argv.includes("--check-live");

  if (isCheckFiles) {
    validateMigrationFiles();
    return;
  }

  if (isCheckLive) {
    const live = await verifyLiveMigrationLedger();
    console.log(
      `[Database Migration Runner] Live Check Result: Status=${live.status} (${live.appliedCount}/${live.expectedCount} applied)`
    );
    if (live.status !== "CURRENT") {
      process.exit(1);
    }
    return;
  }

  await runMigrations({});
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("[Database Migration Runner Error]:", err);
    process.exit(1);
  });
}
