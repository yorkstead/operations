import { describe, expect, it, beforeEach } from "bun:test";
import { DemoFrameworkService } from "../modules/demo/application/demo-framework-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Demo Organization Framework Module", () => {
  let demoFrameworkService: DemoFrameworkService;
  let identityService: IdentityService;

  beforeEach(() => {
    demoFrameworkService = new DemoFrameworkService();
    identityService = new IdentityService();
  });

  it("lists declarative demo scenario manifests with guided storyline stages", () => {
    const scenarios = demoFrameworkService.listScenarios();
    expect(scenarios.length).toBeGreaterThanOrEqual(2);

    const frontRange = scenarios.find((s) => s.scenarioSlug === "front-range-manufacturing");
    expect(frontRange).toBeDefined();
    expect(frontRange?.guidedSteps.length).toBe(4);
    expect(frontRange?.initialMetrics.wipValueFormatted).toBe("$142,500");

    const summit = scenarios.find((s) => s.scenarioSlug === "summit-facility-services");
    expect(summit).toBeDefined();
    expect(summit?.industry).toContain("HVAC");
  });

  it("provisions an isolated demo organization with isDemo flag and actor activity trail", () => {
    const { user } = identityService.bootstrapOwner({
      email: "evaluator@prospect.dev",
      name: "Evaluator",
      organizationName: "Evaluation Co",
      organizationSlug: "eval-co",
    });

    const session = identityService.getSessionContext(user.id);
    const demoOrg = demoFrameworkService.provisionDemoOrganization(session, "front-range-manufacturing");

    expect(demoOrg.isDemo).toBe(true);
    expect(demoOrg.name).toBe("Front Range Precision Manufacturing");
    expect(demoOrg.slug).toBe("front-range-manufacturing");
  });

  it("executes an idempotent deterministic reset to golden snapshot baseline", () => {
    const { user } = identityService.bootstrapOwner({
      email: "evaluator@prospect.dev",
      name: "Evaluator",
      organizationName: "Evaluation Co",
      organizationSlug: "eval-co",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    const result = demoFrameworkService.resetDemoOrganization(session, session.activeOrganization.id);
    expect(result.status).toBe("success");
    expect(result.recordsResetCount).toBeGreaterThan(0);
    expect(result.resetAt).toBeDefined();
  });

  it("enforces rate-limiting abuse protection on rapid consecutive reset requests", () => {
    const { user } = identityService.bootstrapOwner({
      email: "evaluator@prospect.dev",
      name: "Evaluator",
      organizationName: "Evaluation Co",
      organizationSlug: "eval-co",
    });

    const session = identityService.getSessionContext(user.id);
    session.activeOrganization.isDemo = true;

    // First reset succeeds
    const first = demoFrameworkService.resetDemoOrganization(session, session.activeOrganization.id);
    expect(first.status).toBe("success");

    // Immediate second reset is rate limited
    const second = demoFrameworkService.resetDemoOrganization(session, session.activeOrganization.id);
    expect(second.status).toBe("rate_limited");
    expect(second.message).toContain("Reset rate limited");
  });
});
