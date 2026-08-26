import { describe, expect, it } from "bun:test";
import { JobService } from "../modules/jobs/application/job-service";
import { SessionContext } from "../modules/core/domain/types";

const mockSession: SessionContext = {
  user: {
    id: "usr_test_estimator",
    name: "Lead Estimator",
    email: "estimator@yorkstead.com",
    status: "active",
    isGlobalOwner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  activeOrganization: {
    id: "org_demo_test",
    name: "Test Manufacturing Corp",
    slug: "test-mfg",
    status: "active",
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  currentMembership: {
    id: "mem_test",
    organizationId: "org_demo_test",
    userId: "usr_test_estimator",
    role: "owner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  allMemberships: [],
};

describe("Jobs Domain & Workflow State Engine Suite", () => {
  it("creates a valid job with initial revision A and intake timeline event", async () => {
    const service = new JobService();
    const job = await service.createJob(mockSession, {
      title: "Precision Laser Cut Mounting Flanges",
      customerId: "cust_alpine",
      customerName: "Alpine Aerospace Systems",
      priority: "rush",
      targetDueDate: "2026-09-20",
      estimatedLaborHours: 16,
      notes: "Deburr and clean edge finish required.",
    });

    expect(job.title).toBe("Precision Laser Cut Mounting Flanges");
    expect(job.currentStatus).toBe("intake_review");
    expect(job.currentRevision).toBe("A");
    expect(job.revisions.length).toBe(1);
    expect(job.timeline.length).toBe(1);
    expect(job.version).toBe(1);
  });

  it("transitions job state through valid workflow transitions", async () => {
    const service = new JobService();
    const job = await service.createJob(mockSession, {
      title: "Architectural Aluminum Fascia Bracket",
      customerId: "cust_summit",
      customerName: "Summit Architectural Glass",
      targetDueDate: "2026-09-25",
    });

    const transitioned = await service.transitionJobStatus(
      mockSession,
      job.id,
      "engineering_ready",
      "Drawing review approved"
    );

    expect(transitioned.currentStatus).toBe("engineering_ready");
    expect(transitioned.version).toBe(2);
  });

  it("rejects invalid state machine transitions", async () => {
    const service = new JobService();
    const job = await service.createJob(mockSession, {
      title: "Test State Guard",
      customerId: "cust_1",
      customerName: "Test Customer",
      targetDueDate: "2026-09-30",
    });

    expect(() => {
      service.transitionJobStatus(mockSession, job.id, "completed");
    }).toThrow("Invalid State Transition");
  });
});
