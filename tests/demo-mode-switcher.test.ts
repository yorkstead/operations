import { describe, expect, it, beforeEach } from "bun:test";
import { DemoFrameworkService } from "../modules/demo/application/demo-framework-service";
import { DemoSeedingService } from "../modules/demo/application/demo-seeding-service";
import { IdentityService } from "../modules/core/application/identity-service";
import { SyntheticEmailAdapter } from "../modules/core/domain/ports/email-port";
import { SessionContext } from "../modules/core/domain/types";

describe("Sales Pitch & Demo Mode Switcher Suite", () => {
  let demoFrameworkService: DemoFrameworkService;
  let demoSeedingService: DemoSeedingService;
  let identityService: IdentityService;
  let yorksteadSession: SessionContext;

  beforeEach(() => {
    demoFrameworkService = new DemoFrameworkService();
    demoSeedingService = new DemoSeedingService();
    identityService = new IdentityService(new SyntheticEmailAdapter());

    const tenant0 = identityService.ensureTenantZero();
    yorksteadSession = identityService.getSessionContext(tenant0.user.id);
  });

  it("lists all primary sales demo scenarios including Mile High Signworks and Summit Facility Services", () => {
    const scenarios = demoFrameworkService.listScenarios();
    const slugs = scenarios.map((s) => s.scenarioSlug);

    expect(slugs).toContain("mile-high-signworks");
    expect(slugs).toContain("summit-facility-services");
    expect(slugs).toContain("front-range-manufacturing");

    const mileHigh = demoFrameworkService.getScenario("mile-high-signworks");
    expect(mileHigh.name).toBe("Mile High Signworks");
    expect(mileHigh.guidedSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("provisions ephemeral demo organization with isDemo: true", () => {
    const demoOrg = demoFrameworkService.provisionDemoOrganization(yorksteadSession, "mile-high-signworks");

    expect(demoOrg.id).toBe("demo_mile_high_signworks");
    expect(demoOrg.isDemo).toBe(true);
    expect(demoOrg.name).toBe("Mile High Signworks");
  });

  it("strictly rejects demo resets and seed actions targeted against production Yorkstead Systems", () => {
    // 1. Attempt to reset production Yorkstead Systems
    expect(() => {
      demoFrameworkService.resetDemoOrganization(yorksteadSession, yorksteadSession.activeOrganization.id);
    }).toThrow("Cannot reset production customer organization 'Yorkstead Systems'");

    // 2. Attempt to seed demo records into production Yorkstead Systems
    expect(() => {
      demoSeedingService.seedDemoOrganization(yorksteadSession);
    }).toThrow("Cannot seed production customer organization 'Yorkstead Systems'");
  });

  it("allows deterministic reset on verified demo organization", () => {
    const demoOrg = demoFrameworkService.provisionDemoOrganization(yorksteadSession, "summit-facility-services");

    // Construct valid demo session context
    const demoSession: SessionContext = {
      ...yorksteadSession,
      activeOrganization: demoOrg,
      currentMembership: {
        ...yorksteadSession.currentMembership,
        organizationId: demoOrg.id,
      },
    };

    const resetResult = demoFrameworkService.resetDemoOrganization(demoSession, demoOrg.id);
    expect(resetResult.status).toBe("success");
    expect(resetResult.recordsResetCount).toBeGreaterThan(0);
    expect(resetResult.organizationId).toBe(demoOrg.id);
  });
});
