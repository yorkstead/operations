import { describe, expect, it } from "bun:test";
import { toPublicBackgroundJob } from "../modules/jobs/infrastructure/background-job-repository";
import { backgroundJobs } from "../db/schema";

describe("durable background job public contract", () => {
  it("omits payload and replaces internal errors with a safe message", () => {
    const now = new Date("2026-08-27T00:00:00.000Z");
    const row: typeof backgroundJobs.$inferSelect = {
      id: "bgjob_test", organizationId: "org_a", type: "packet.extract", status: "failed", progress: 25,
      payload: { documentId: "doc_secret", providerToken: "must-not-leak" }, result: null,
      error: { code: "PROCESSING_FAILED", internalMessage: "database password leaked here" },
      resourceType: "packet_document", resourceId: "doc_secret", idempotencyKey: "packet:doc_secret",
      attempts: 3, maxAttempts: 3, availableAt: now, createdByUserId: "user_a", createdByName: "Operator",
      createdAt: now, startedAt: now, completedAt: now, updatedAt: now,
    };
    const publicJob = toPublicBackgroundJob(row);
    expect(publicJob.error?.code).toBe("PROCESSING_FAILED");
    expect(publicJob.error?.message).not.toContain("password");
    expect("payload" in publicJob).toBe(false);
    expect(JSON.stringify(publicJob)).not.toContain("providerToken");
  });
});
