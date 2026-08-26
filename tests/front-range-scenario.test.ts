import { describe, expect, it, beforeEach } from "bun:test";
import { FrontRangeService } from "../modules/demo/application/front-range-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Front Range Manufacturing Demo Scenario Module", () => {
  let frontRangeService: FrontRangeService;
  let identityService: IdentityService;

  beforeEach(() => {
    frontRangeService = new FrontRangeService();
    identityService = new IdentityService();
  });

  it("retrieves coherent Front Range Architectural Products scenario fixture", () => {
    const data = frontRangeService.getFrontRangeScenario();

    expect(data.organization.name).toBe("Front Range Architectural Products");
    expect(data.personas.length).toBe(4);

    const operator = data.personas.find((p) => p.membershipRole === "operator");
    expect(operator).toBeDefined();
    expect(operator?.assignedWorkCenter).toBe("WC-LASER-01");

    expect(data.seededRecords.quoteNumber).toBe("Q-2026-088");
    expect(data.seededRecords.jobNumber).toBe("JOB-2026-104");
  });

  it("triggers and resolves a recoverable simulation disruption on laser machinery", () => {
    const { user } = identityService.bootstrapOwner({
      email: "sarah.lin@frontrange.synthetic",
      name: "Sarah Lin",
      organizationName: "Front Range Architectural Products",
      organizationSlug: "front-range-manufacturing",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    // Trigger disruption
    const disrupted = frontRangeService.triggerDisruption(session);
    expect(disrupted.isDisrupted).toBe(true);
    expect(disrupted.assetTag).toBe("EQ-LASER-01");
    expect(disrupted.resolvedAt).toBeUndefined();

    // Resolve disruption
    const resolved = frontRangeService.resolveDisruption(session);
    expect(resolved.isDisrupted).toBe(false);
    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.mitigationImpact).toContain("restored 100% laser uptime");
  });
});
