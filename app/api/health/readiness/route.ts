import { NextResponse } from "next/server";
import { EXPECTED_MIGRATIONS } from "@/db/migrations-manifest";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();
  const uptimeSeconds = Math.round(process.uptime());

  let dbStatus: "CONNECTED" | "UNAVAILABLE" = "UNAVAILABLE";
  let migrationStatus: "CURRENT" | "BEHIND" | "MISMATCH" | "UNAVAILABLE" = "UNAVAILABLE";
  let failureReason: string | undefined;

  try {
    const sql = neon(env.DATABASE_URL);

    await Promise.race([
      sql`SELECT 1 as health`,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database connection timeout (2s)")), 2000)),
    ]);
    dbStatus = "CONNECTED";

    const rows = (await Promise.race([
      sql`SELECT name, checksum FROM "application_migrations" ORDER BY id ASC`,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Migration ledger query timeout (2s)")), 2000)),
    ])) as { name: string; checksum: string }[];

    const appliedMap = new Map<string, string>();
    for (const r of rows) {
      appliedMap.set(r.name, r.checksum);
    }

    if (rows.length < EXPECTED_MIGRATIONS.length) {
      for (const r of rows) {
        const exp = EXPECTED_MIGRATIONS.find((m) => m.name === r.name);
        if (exp && exp.checksum !== r.checksum) {
          migrationStatus = "MISMATCH";
          failureReason = `Checksum mismatch on recorded migration: ${r.name}`;
          break;
        }
      }
      if (!failureReason) {
        migrationStatus = "BEHIND";
        failureReason = `Database migrations incomplete (${rows.length}/${EXPECTED_MIGRATIONS.length} applied)`;
      }
    } else {
      let isMatch = true;
      for (const exp of EXPECTED_MIGRATIONS) {
        const rec = appliedMap.get(exp.name);
        if (!rec) {
          migrationStatus = "BEHIND";
          failureReason = `Missing expected migration in database: ${exp.name}`;
          isMatch = false;
          break;
        }
        if (rec !== exp.checksum) {
          migrationStatus = "MISMATCH";
          failureReason = `Migration checksum mismatch for ${exp.name}`;
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        migrationStatus = "CURRENT";
      }
    }
  } catch {
    dbStatus = "UNAVAILABLE";
    migrationStatus = "UNAVAILABLE";
    failureReason = "Database or migration readiness check failed";
  }

  let storageStatus: "CONNECTED" | "UNAVAILABLE" | "NOT_CONFIGURED" = "NOT_CONFIGURED";
  if (env.BLOB_READ_WRITE_TOKEN) {
    try {
      await Promise.race([
        list({ limit: 1, token: env.BLOB_READ_WRITE_TOKEN }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Storage capability timeout (2s)")), 2000)),
      ]);
      storageStatus = "CONNECTED";
    } catch {
      storageStatus = "UNAVAILABLE";
    }
  }
  const isHealthy = dbStatus === "CONNECTED" && migrationStatus === "CURRENT" && storageStatus === "CONNECTED";
  const overallStatus = isHealthy ? "READY" : "DEGRADED";

  if (env.NODE_ENV === "production" && !isHealthy) {
    return NextResponse.json(
      {
        status: "UNHEALTHY",
        service: "yorkstead-operations",
        timestamp: now,
        uptimeSeconds,
        checks: {
          database: dbStatus,
          storageVault: storageStatus,
          migrations: migrationStatus,
          tenantIsolation: "ENFORCED_SERVER_POLICY",
        },
        error: failureReason,
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: overallStatus,
      service: "yorkstead-operations",
      timestamp: now,
      uptimeSeconds,
      checks: {
        database: dbStatus,
        storageVault: storageStatus,
        migrations: migrationStatus,
        tenantIsolation: "ENFORCED_SERVER_POLICY",
      },
      error: failureReason,
    },
    { status: 200 }
  );
}
