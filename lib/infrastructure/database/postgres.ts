import { Pool, type PoolConfig } from "pg";
import { serverEnv } from "../env/server";
import { logger } from "../observability/logger";

export function createPostgresPool(overrides: PoolConfig = {}) {
  const pool = new Pool({
    connectionString: serverEnv.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    allowExitOnIdle: true,
    ...overrides,
  });
  pool.on("error", (error) => {
    logger.error("database.error", "PostgreSQL pool reported an unexpected error", error);
  });
  return pool;
}
