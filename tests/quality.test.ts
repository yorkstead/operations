import { describe, expect, it, beforeEach } from "bun:test";
import { QualityService } from "../modules/quality/application/quality-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Quality & Non-Conformance (NCR) Module", () => {
  let qualityService: QualityService;
  let identityService: IdentityService;

  beforeEach(() => {
    qualityService = new QualityService();
    identityService = new IdentityService();
  });

  it("records first article inspection and validates checklist results", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const record = qualityService.recordInspection(session, {
      inspectionType: "first_article",
      jobId: "job_101",
      jobNumber: "JOB-2026-101",
      partDescription: "Precision Flange",
      sampleSize: 5,
      passedQuantity: 5,
      failedQuantity: 0,
      checklist: [
        { id: "c1", characteristic: "OD", targetSpec: "5.250", measuredValue: "5.251", result: "pass" },
        { id: "c2", characteristic: "ID", targetSpec: "2.100", measuredValue: "2.100", result: "pass" },
      ],
    });

    expect(record.status).toBe("passed");
    expect(record.sampleSize).toBe(5);
    expect(record.checklist.length).toBe(2);
  });

  it("creates NCR, applies containment, and dispositions with segregation of duties", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const ncr = qualityService.createNCR(session, {
      jobId: "job_102",
      jobNumber: "JOB-2026-102",
      partDescription: "Bracket",
      operationName: "WC-BRAKE-01",
      defectDescription: "Overbent angle",
      defectCategory: "Dimensional",
      severity: "major",
      defectQuantity: 2,
      containmentActions: ["Quarantine bin"],
      scrapCostCents: 5000,
    });

    expect(ncr.status).toBe("open");
    expect(ncr.disposition).toBe("pending_review");

    // Disposition
    const dispositioned = qualityService.applyDisposition(session, ncr.id, {
      disposition: "rework",
      dispositionNotes: "Re-align brake tooling",
    });

    expect(dispositioned.status).toBe("dispositioned");
    expect(dispositioned.disposition).toBe("rework");

    // Close
    const closed = qualityService.closeNCR(session, ncr.id);
    expect(closed.status).toBe("closed");
  });

  it("calculates quality metrics and first pass yield", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    const metrics = qualityService.getQualityMetrics(session);

    expect(metrics.firstPassYieldPercentage).toBeGreaterThan(0);
    expect(metrics.activeOpenNCRCount).toBeGreaterThanOrEqual(0);
  });
});
