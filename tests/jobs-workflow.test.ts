import { describe, expect, it, beforeEach } from "bun:test";
import { JobService } from "../modules/jobs/application/job-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Jobs & Workflow Core Domain", () => {
  let jobService: JobService;
  let identityService: IdentityService;

  beforeEach(() => {
    jobService = new JobService();
    identityService = new IdentityService();
  });

  it("creates a job and advances workflow through guarded valid transitions", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const job = jobService.createJob(session, {
      title: "Laser cut mounting plates",
      customerId: "cust_101",
      customerName: "Alpine Aerospace",
      targetDueDate: "2026-09-01",
      estimatedLaborHours: 12,
    });

    expect(job.id).toBeDefined();
    expect(job.currentStatus).toBe("intake_review");
    expect(job.currentRevision).toBe("A");
    expect(job.version).toBe(1);

    // Transition: intake_review -> engineering_ready
    const step1 = jobService.transitionJobStatus(session, job.id, "engineering_ready", "Drawings reviewed", 1);
    expect(step1.currentStatus).toBe("engineering_ready");
    expect(step1.version).toBe(2);

    // Transition: engineering_ready -> released_to_shopfloor
    const step2 = jobService.transitionJobStatus(session, job.id, "released_to_shopfloor", "Release to shop floor", 2);
    expect(step2.currentStatus).toBe("released_to_shopfloor");
    expect(step2.releaseDate).toBeDefined();
    expect(step2.version).toBe(3);
  });

  it("rejects invalid state transitions and optimistic concurrency conflicts", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const job = jobService.createJob(session, {
      title: "Fastener brackets",
      customerId: "cust_101",
      customerName: "Alpine Aerospace",
      targetDueDate: "2026-09-01",
    });

    // Invalid transition: intake_review cannot jump straight to closed
    expect(() => {
      jobService.transitionJobStatus(session, job.id, "closed", "Skipping steps");
    }).toThrow("Invalid State Transition");

    // Optimistic concurrency conflict: expectedVersion mismatch
    expect(() => {
      jobService.transitionJobStatus(session, job.id, "engineering_ready", "Valid target", 999);
    }).toThrow("Stale Update Conflict");
  });

  it("creates engineering revisions with explicit change summary", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const job = jobService.createJob(session, {
      title: "Sheet metal bracket",
      customerId: "cust_101",
      customerName: "Alpine Aerospace",
      targetDueDate: "2026-09-01",
    });

    const revB = jobService.createRevision(session, job.id, "B", "Adjusted hole tolerance to +/- 0.005", 1);
    expect(revB.currentRevision).toBe("B");
    expect(revB.revisions.length).toBe(2);
    expect(revB.revisions[0].changeSummary).toContain("Adjusted hole tolerance");
  });
});
