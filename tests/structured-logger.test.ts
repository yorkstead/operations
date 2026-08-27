import { describe, expect, spyOn, test } from "bun:test";
import { logger } from "@/lib/infrastructure/observability/logger";

describe("structured logger", () => {
  test("writes portable JSON and redacts sensitive fields", () => {
    const info = spyOn(console, "info").mockImplementation(() => undefined);
    logger.info("job.queued", "Background job queued", {
      correlationId: "trace_test",
      jobId: "job_test",
      authorizationToken: "private",
    });

    const entry = JSON.parse(String(info.mock.calls[0]?.[0]));
    expect(entry.action).toBe("job.queued");
    expect(entry.traceId).toBe("trace_test");
    expect(entry.payload.jobId).toBe("job_test");
    expect(entry.payload.authorizationToken).toBe("[REDACTED]");
    info.mockRestore();
  });

  test("records safe error identity without a stack trace", () => {
    const output = spyOn(console, "error").mockImplementation(() => undefined);
    logger.error("storage.error", "Object storage operation failed", new Error("token=private"), { operation: "putObject" });

    const entry = JSON.parse(String(output.mock.calls[0]?.[0]));
    expect(entry.payload.errorType).toBe("Error");
    expect(entry.payload.errorMessage).toBeUndefined();
    expect(entry.payload.stack).toBeUndefined();
    output.mockRestore();
  });
});
