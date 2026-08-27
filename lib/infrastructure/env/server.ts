import { z } from "zod";
import { parsePublicEnv } from "./public";

const optionalNonempty = z.string().min(1).optional();

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RUNTIME_ROLE: z.enum(["web", "worker"]).default("web"),
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/yorkstead_operations_dev"),
  BETTER_AUTH_SECRET: z.string().min(32).default("synthetic_local_dev_secret_32_characters_long_min_entropy"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  S3_ENDPOINT: optionalNonempty.pipe(z.string().url().optional()),
  S3_REGION: z.string().min(1).default("auto"),
  S3_BUCKET: optionalNonempty,
  S3_ACCESS_KEY_ID: optionalNonempty,
  S3_SECRET_ACCESS_KEY: optionalNonempty,
  QUEUE_PROVIDER: z.enum(["database", "cloudflare"]).default("database"),
  QUEUE_ACCOUNT_ID: optionalNonempty,
  QUEUE_ID: optionalNonempty,
  QUEUE_API_TOKEN: optionalNonempty,
}).superRefine((value, context) => {
  const storageValues = [value.S3_ENDPOINT, value.S3_BUCKET, value.S3_ACCESS_KEY_ID, value.S3_SECRET_ACCESS_KEY];
  const configuredCount = storageValues.filter(Boolean).length;
  if (configuredCount > 0 && configuredCount < storageValues.length) {
    context.addIssue({ code: "custom", message: "S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY must be configured together." });
  }
  const queueValues = [value.QUEUE_ACCOUNT_ID, value.QUEUE_ID, value.QUEUE_API_TOKEN];
  const queueConfiguredCount = queueValues.filter(Boolean).length;
  if (queueConfiguredCount > 0 && queueConfiguredCount < queueValues.length) {
    context.addIssue({ code: "custom", message: "QUEUE_ACCOUNT_ID, QUEUE_ID, and QUEUE_API_TOKEN must be configured together." });
  }
  if (value.QUEUE_PROVIDER === "cloudflare" && queueConfiguredCount !== queueValues.length) {
    context.addIssue({ code: "custom", message: "QUEUE_PROVIDER=cloudflare requires complete queue configuration." });
  }
});

export type ServerEnv = z.infer<typeof serverEnvSchema> & ReturnType<typeof parsePublicEnv>;

export function validateProductionRuntime(data: ServerEnv, nextPhase = process.env.NEXT_PHASE): void {
  if (data.NODE_ENV !== "production" || nextPhase === "phase-production-build") return;
  const errors: string[] = [];
  if (data.DATABASE_URL.includes("localhost") || data.DATABASE_URL.includes("127.0.0.1")) errors.push("DATABASE_URL must use a remote PostgreSQL service");
  if (data.RUNTIME_ROLE === "web") {
    if (!data.NEXT_PUBLIC_APP_URL.startsWith("https://")) errors.push("NEXT_PUBLIC_APP_URL must use HTTPS");
    if (!data.BETTER_AUTH_URL.startsWith("https://")) errors.push("BETTER_AUTH_URL must use HTTPS");
    if (data.BETTER_AUTH_SECRET.includes("synthetic") || data.BETTER_AUTH_SECRET.includes("dev_secret")) errors.push("BETTER_AUTH_SECRET must be a high-entropy production secret");
  }
  if (!data.S3_ENDPOINT) errors.push("the complete S3_* object storage configuration is required");
  if (errors.length) throw new Error(`Production runtime environment is invalid:\n- ${errors.join("\n- ")}`);
}

export function parseServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) throw new Error(`Invalid server environment configuration: ${parsed.error.message}`);
  const value = { ...parsed.data, ...parsePublicEnv(source) };
  validateProductionRuntime(value);
  return value;
}

export const serverEnv = parseServerEnv();
