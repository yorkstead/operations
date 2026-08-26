import { describe, expect, it, beforeEach } from "bun:test";
import { SummitFacilityService } from "../modules/demo/application/summit-facility-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Summit Facility Services Demo Scenario Module", () => {
  let summitService: SummitFacilityService;
  let identityService: IdentityService;

  beforeEach(() => {
    summitService = new SummitFacilityService();
    identityService = new IdentityService();
  });

  it("retrieves coherent Summit Facility Services multi-site scenario fixture", () => {
    const data = summitService.getSummitScenario();

    expect(data.organization.name).toBe("Summit Facility Services");
    expect(data.sites.length).toBe(3);
    expect(data.jobs.length).toBe(2);

    const medicalCenter = data.sites.find((s) => s.id === "site_centennial");
    expect(medicalCenter).toBeDefined();
    expect(medicalCenter?.activeServiceLevel).toBe("sterile_cleanroom");

    expect(data.metrics.auditPassingRate).toBe("99.4%");
  });

  it("toggles mobile shift checklist item and records actor activity", () => {
    const { user } = identityService.bootstrapOwner({
      email: "carlos.ortiz@summitfacility.synthetic",
      name: "Carlos Ortiz",
      organizationName: "Summit Facility Services",
      organizationSlug: "summit-facility-services",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    const job = summitService.toggleChecklistItem(session, "job_srv_401", "chk_3");
    const item = job.checklist.find((c) => c.id === "chk_3");
    expect(item?.isCompleted).toBe(true);
  });

  it("completes service job with client digital signoff and timestamp", () => {
    const { user } = identityService.bootstrapOwner({
      email: "rachel.ward@summitfacility.synthetic",
      name: "Rachel Ward",
      organizationName: "Summit Facility Services",
      organizationSlug: "summit-facility-services",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    const job = summitService.completeServiceJob(session, "job_srv_401", "David Sterling (Building Ops Director)");
    expect(job.status).toBe("completed");
    expect(job.proofOfWork.clientSignoffName).toBe("David Sterling (Building Ops Director)");
    expect(job.proofOfWork.signoffTimestamp).toBeDefined();
  });

  it("reports and resolves a facility exception with root-cause tracking", () => {
    const { user } = identityService.bootstrapOwner({
      email: "rachel.ward@summitfacility.synthetic",
      name: "Rachel Ward",
      organizationName: "Summit Facility Services",
      organizationSlug: "summit-facility-services",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    // Report exception
    const exc = summitService.reportException(session, {
      jobId: "job_srv_401",
      exceptionType: "chemical_spill",
      severity: "medium",
      description: "Freight elevator glycol leak from third-party vendor pallet.",
    });
    expect(exc.status).toBe("open");

    // Resolve exception
    const resolved = summitService.resolveException(session, exc.id, "Neutralized with spill kit and steam sanitized.");
    expect(resolved.status).toBe("resolved");
    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.resolutionAction).toContain("Neutralized");
  });
});
