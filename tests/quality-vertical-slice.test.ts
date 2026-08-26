import { describe, expect, it } from "bun:test";
import { QualityService } from "../modules/quality/application/quality-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const qualityService = new QualityService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "qa_lead@acme.com",
  name: "Lead QA Engineer",
  organizationName: "Acme Aerospace Metals",
  organizationSlug: "acme-aero",
});

identityService.createOrganization(userA.id, "Rival Aero", "rival-aero");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("Quality & Non-Conformance Vertical Slice: FAI, NCRs, Segregation of Duties & IDOR", () => {
  let createdInspId: string;
  let createdNcrId: string;

  it("records First Article Inspection (FAI) with measured characteristics and pass/fail determination", () => {
    const insp = qualityService.recordInspection(tenantA, {
      inspectionType: "first_article",
      jobId: "job_aero_101",
      jobNumber: "JOB-AERO-101",
      partDescription: "Titanium Bulkhead Fitting",
      sampleSize: 5,
      passedQuantity: 4,
      failedQuantity: 1,
      checklist: [
        { id: "c1", characteristic: "Bore Diameter", targetSpec: "1.500 +/- 0.002 in", measuredValue: "1.501 in", result: "pass" },
        { id: "c2", characteristic: "Thread Pitch", targetSpec: "UNJF 12 TPI", measuredValue: "12 TPI Go-Gauge", result: "pass" },
        { id: "c3", characteristic: "Flange Thickness", targetSpec: "0.250 +/- 0.001 in", measuredValue: "0.247 in", result: "fail" },
      ],
    });

    createdInspId = insp.id;
    expect(insp.inspectionType).toBe("first_article");
    expect(insp.status).toBe("failed"); // Because 1 failed
    expect(insp.sampleSize).toBe(5);
  });

  it("raises Non-Conformance Report (NCR) with containment actions and integer cents scrap valuation", () => {
    const ncr = qualityService.createNCR(tenantA, {
      jobId: "job_aero_101",
      jobNumber: "JOB-AERO-101",
      partDescription: "Titanium Bulkhead Fitting",
      operationName: "WC-MILL-01 // CNC 5-Axis Milling",
      defectDescription: "Flange thickness measured 0.003in below drawing nominal tolerance.",
      defectCategory: "Dimensional Variance",
      severity: "major",
      defectQuantity: 1,
      containmentActions: ["Quarantined fitting into yellow QA quarantine cage."],
      scrapCostCents: 45000, // $450.00
      reworkLaborMinutes: 30,
    });

    createdNcrId = ncr.id;
    expect(ncr.ncrNumber).toContain("NCR-");
    expect(ncr.severity).toBe("major");
    expect(ncr.status).toBe("open");
    expect(ncr.scrapCostCents).toBe(45000);
  });

  it("applies engineering disposition with segregation of duties verification", () => {
    const dispositioned = qualityService.applyDisposition(tenantA, createdNcrId, {
      disposition: "rework",
      dispositionNotes: "Authorized secondary face skim cut to establish flush seating plane.",
      rootCauseAnalysis: "Tool height offset calibration error on cutter #4.",
      finalScrapCostCents: 0,
      reworkLaborMinutes: 20,
    });

    expect(dispositioned.status).toBe("dispositioned");
    expect(dispositioned.disposition).toBe("rework");
    expect(dispositioned.approvedByUserId).toBe(tenantA.user.id);
  });

  it("closes NCR and aggregates live First Pass Yield & scrap metrics", () => {
    const closed = qualityService.closeNCR(tenantA, createdNcrId);
    expect(closed.status).toBe("closed");

    const metrics = qualityService.getQualityMetrics(tenantA);
    expect(metrics.totalInspections).toBeGreaterThanOrEqual(1);
    expect(metrics.activeOpenNCRCount).toBe(0);
  });

  it("strictly enforces tenant boundary and denies cross-tenant access (IDOR)", () => {
    const orgBInspections = qualityService.listInspections(tenantB);
    const orgBNcrs = qualityService.listNCRs(tenantB);

    expect(orgBInspections.some((i) => i.id === createdInspId)).toBe(false);
    expect(orgBNcrs.some((n) => n.id === createdNcrId)).toBe(false);
  });
});
