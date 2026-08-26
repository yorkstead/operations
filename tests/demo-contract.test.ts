import { describe, expect, it, beforeEach } from "bun:test";
import { DemoContractService, DEFAULT_DEMO_GUARDRAILS } from "../modules/demo/application/demo-contract-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Demo & Portfolio Engineering Contract", () => {
  let demoService: DemoContractService;
  let identityService: IdentityService;

  beforeEach(() => {
    demoService = new DemoContractService();
    identityService = new IdentityService();
  });

  it("verifies demo guardrail defaults enforce total isolation and side-effect interception", () => {
    expect(DEFAULT_DEMO_GUARDRAILS.interceptExternalEmails).toBe(true);
    expect(DEFAULT_DEMO_GUARDRAILS.interceptPaymentGateways).toBe(true);
    expect(DEFAULT_DEMO_GUARDRAILS.interceptExternalWebhooks).toBe(true);
    expect(DEFAULT_DEMO_GUARDRAILS.enforceSyntheticDataOnly).toBe(true);
    expect(DEFAULT_DEMO_GUARDRAILS.requireVisualWatermark).toBe(true);
    expect(DEFAULT_DEMO_GUARDRAILS.allowSelfServiceReset).toBe(true);
  });

  it("intercepts external side effects for demo organizations with zero leakage", () => {
    const { user: demoUser } = identityService.bootstrapOwner({
      email: "demo.operator@frontrange.synthetic",
      name: "Demo Operator",
      organizationName: "Front Range Manufacturing",
      organizationSlug: "front-range-manufacturing",
    });

    const session = identityService.getSessionContext(demoUser.id);
    // Mark as demo org
    session.activeOrganization.isDemo = true;

    const emailCheck = demoService.interceptSideEffect(session, "email");
    expect(emailCheck.intercepted).toBe(true);
    expect(emailCheck.reason).toContain("synthetic demo environment");

    const paymentCheck = demoService.interceptSideEffect(session, "payment");
    expect(paymentCheck.intercepted).toBe(true);

    const webhookCheck = demoService.interceptSideEffect(session, "webhook");
    expect(webhookCheck.intercepted).toBe(true);
  });

  it("permits side effects for live production organizations", () => {
    const { user: prodUser } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Prod Owner",
      organizationName: "Production Plant",
      organizationSlug: "prod-plant",
    });

    const session = identityService.getSessionContext(prodUser.id);
    session.activeOrganization.isDemo = false;

    const emailCheck = demoService.interceptSideEffect(session, "email");
    expect(emailCheck.intercepted).toBe(false);
  });

  it("structures portfolio showcases leading with problem, workflow bottleneck, and measured impact", () => {
    const items = demoService.listPortfolioItems();
    expect(items.length).toBeGreaterThanOrEqual(2);

    for (const item of items) {
      expect(item.problemStatement).toBeDefined();
      expect(item.workflowBottleneck).toBeDefined();
      expect(item.solutionSummary).toBeDefined();
      expect(item.measuredImpact.length).toBeGreaterThan(0);
      expect(item.category).toBe("demo");
    }
  });
});
