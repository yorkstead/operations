import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { createPostgresPool } from "@/lib/infrastructure/database/postgres";

const pool = createPostgresPool();

const db = drizzle(pool, { schema });

export function getDb() {
  return db;
}

export type DbClient = ReturnType<typeof getDb>;
