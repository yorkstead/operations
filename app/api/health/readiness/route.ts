import { NextResponse } from "next/server";
import { EXPECTED_MIGRATIONS } from "@/db/migrations-manifest";
import { env } from "@/lib/env";
import { getObjectStorage, isObjectStorageConfigured } from "@/lib/infrastructure/storage";
import { withTimeout } from "@/lib/infrastructure/runtime/portable-runtime";
import { readPostgresMigrationLedger } from "@/lib/infrastructure/database/readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();
  const uptimeSeconds = Math.round(process.uptime());

  let dbStatus: "CONNECTED" | "UNAVAILABLE" = "UNAVAILABLE";
  let migrationStatus: "CURRENT" | "BEHIND" | "MISMATCH" | "UNAVAILABLE" = "UNAVAILABLE";
  let failureReason: string | undefined;

  try {
    const rows = await readPostgresMigrationLedger();
    dbStatus = "CONNECTED";

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
  if (isObjectStorageConfigured()) {
    try {
      await withTimeout(getObjectStorage().listObjects({ limit: 1 }), 2000, "Storage capability check");
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
