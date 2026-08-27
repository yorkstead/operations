import { describe, expect, it } from "bun:test";
import { parsePublicEnv } from "../lib/infrastructure/env/public";
import { parseServerEnv, validateProductionRuntime } from "../lib/infrastructure/env/server";
import { withTimeout } from "../lib/infrastructure/runtime/portable-runtime";
import { S3ObjectStorage } from "../lib/infrastructure/storage/s3-object-storage";

const safeServerEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/yorkstead_test",
  BETTER_AUTH_SECRET: "synthetic_test_secret_32_characters_minimum",
  BETTER_AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_NAME: "Yorkstead Operations",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("provider-neutral infrastructure", () => {
  it("separates public configuration from server secrets", () => {
    const publicConfiguration = parsePublicEnv({
      NEXT_PUBLIC_APP_NAME: "Yorkstead Operations",
      NEXT_PUBLIC_APP_URL: "https://ops.yorkstead.com",
      DATABASE_URL: "postgresql://should-not-leak.invalid/database",
      S3_SECRET_ACCESS_KEY: "should-not-leak",
    });
    expect(Object.keys(publicConfiguration).sort()).toEqual(["NEXT_PUBLIC_APP_NAME", "NEXT_PUBLIC_APP_URL"]);
  });

  it("accepts a complete generic S3 configuration and rejects partial credentials", () => {
    const configured = parseServerEnv({
      ...safeServerEnv,
      S3_ENDPOINT: "https://objects.example.test",
      S3_REGION: "auto",
      S3_BUCKET: "private-vault",
      S3_ACCESS_KEY_ID: "access-key",
      S3_SECRET_ACCESS_KEY: "secret-key",
    });
    expect(configured.S3_BUCKET).toBe("private-vault");
    expect(() => parseServerEnv({ ...safeServerEnv, S3_ENDPOINT: "https://objects.example.test" })).toThrow("must be configured together");
  });

  it("requires complete queue credentials only when Cloudflare dispatch is selected", () => {
    expect(parseServerEnv({ ...safeServerEnv }).QUEUE_PROVIDER).toBe("database");
    expect(() => parseServerEnv({ ...safeServerEnv, QUEUE_PROVIDER: "cloudflare", QUEUE_ID: "queue-id" })).toThrow("complete queue configuration");
    const configured = parseServerEnv({
      ...safeServerEnv, QUEUE_PROVIDER: "cloudflare", QUEUE_ACCOUNT_ID: "account-id",
      QUEUE_ID: "queue-id", QUEUE_API_TOKEN: "scoped-token",
    });
    expect(configured.QUEUE_PROVIDER).toBe("cloudflare");
  });

  it("fails a production runtime with local dependencies or missing object storage", () => {
    const local = parseServerEnv(safeServerEnv);
    expect(() => validateProductionRuntime({ ...local, NODE_ENV: "production" }, "phase-runtime")).toThrow("Production runtime environment is invalid");
  });

  it("does not require web authentication secrets in the private worker runtime", () => {
    const worker = parseServerEnv({
      ...safeServerEnv,
      NODE_ENV: "production",
      RUNTIME_ROLE: "worker",
      DATABASE_URL: "postgresql://worker@example.test/yorkstead",
      S3_ENDPOINT: "https://objects.example.test",
      S3_BUCKET: "private-vault",
      S3_ACCESS_KEY_ID: "access-key",
      S3_SECRET_ACCESS_KEY: "secret-key",
    });
    expect(worker.RUNTIME_ROLE).toBe("worker");
  });

  it("uses a portable timeout without leaving a timer active", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 50, "fast operation")).resolves.toBe("ok");
    await expect(withTimeout(new Promise(() => undefined), 5, "slow operation")).rejects.toThrow("slow operation timed out");
  });

  it("creates provider-neutral presigned S3 upload URLs without network access", async () => {
    const storage = new S3ObjectStorage({
      endpoint: "https://objects.example.test",
      region: "auto",
      bucket: "private-vault",
      accessKeyId: "test-access-key",
      secretAccessKey: "test-secret-key",
    });
    const signed = await storage.getObjectUrl("tenants/org_1/vault/file.pdf", {
      operation: "write",
      contentType: "application/pdf",
      contentLength: 128,
      expiresInSeconds: 60,
    });
    const url = new URL(signed.url);
    expect(url.hostname).toBe("private-vault.objects.example.test");
    expect(url.pathname).toBe("/tenants/org_1/vault/file.pdf");
    expect(url.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("60");
  });
});
