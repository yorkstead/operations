import { Pool, type PoolConfig } from "pg";
import { serverEnv } from "../env/server";

export function createPostgresPool(overrides: PoolConfig = {}) {
  return new Pool({
    connectionString: serverEnv.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    allowExitOnIdle: true,
    ...overrides,
  });
}

