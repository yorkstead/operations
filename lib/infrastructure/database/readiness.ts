import { neon } from "@neondatabase/serverless";
import { serverEnv } from "../env/server";
import { withTimeout } from "../runtime/portable-runtime";

export interface AppliedMigration {
  name: string;
  checksum: string;
}

export async function readPostgresMigrationLedger(): Promise<AppliedMigration[]> {
  const sql = neon(serverEnv.DATABASE_URL);
  await withTimeout(sql`SELECT 1 as health`, 2000, "Database connection");
  const rows = await withTimeout(
    sql`SELECT name, checksum FROM "application_migrations" ORDER BY id ASC`,
    2000,
    "Migration ledger query",
  );
  return rows.map((row) => ({ name: String(row.name), checksum: String(row.checksum) }));
}
