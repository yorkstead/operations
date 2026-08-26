import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Yorkstead Operations"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/yorkstead_operations_dev"),
  BETTER_AUTH_SECRET: z.string().min(32).default("synthetic_local_dev_secret_32_characters_long_min_entropy"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateProductionRuntime(data: Env): void {
  if (data.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    const errors: string[] = [];
    if (data.DATABASE_URL.includes("localhost") || data.DATABASE_URL.includes("127.0.0.1")) {
      errors.push("Production requires a live remote PostgreSQL database URL (not localhost)");
    }
    if (!data.NEXT_PUBLIC_APP_URL.startsWith("https://")) {
      errors.push("Production NEXT_PUBLIC_APP_URL must use HTTPS");
    }
    if (!data.BETTER_AUTH_URL.startsWith("https://")) {
      errors.push("Production BETTER_AUTH_URL must use HTTPS");
    }
    if (data.BETTER_AUTH_SECRET.includes("synthetic") || data.BETTER_AUTH_SECRET.includes("dev_secret")) {
      errors.push("Production BETTER_AUTH_SECRET must be a high-entropy cryptographically random secret");
    }
    if (errors.length > 0) {
      throw new Error(`Production Runtime Environment Violations:\n- ${errors.join("\n- ")}`);
    }
  }
}

export function getEnv(): Env {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV ?? "development",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Yorkstead Operations",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/yorkstead_operations_dev",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "synthetic_local_dev_secret_32_characters_long_min_entropy",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:", parsed.error.format());
    throw new Error("Invalid environment configuration.");
  }

  return parsed.data;
}

export const env = getEnv();
