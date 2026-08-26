import { describe, expect, it, beforeEach } from "bun:test";
import { AnalyticsService } from "../modules/analytics/application/analytics-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Analytics & Operational Planning Module", () => {
  let analyticsService: AnalyticsService;
  let identityService: IdentityService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    identityService = new IdentityService();
  });

  it("compiles governed operational metrics matching METRICS.md definitions with freshness timestamps", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    const dashboard = analyticsService.getExecutiveDashboardMetrics(session);

    expect(dashboard.metrics.length).toBeGreaterThanOrEqual(6);
    expect(dashboard.lastRefreshedAt).toBeDefined();

    const adherence = dashboard.metrics.find((m) => m.metricKey === "schedule_adherence");
    expect(adherence).toBeDefined();
    expect(adherence?.sourceOfTruth).toBe("JobService.listJobs");
    expect(adherence?.formula).toContain("Total Active Jobs");
    expect(adherence?.unit).toBe("%");

    const fpy = dashboard.metrics.find((m) => m.metricKey === "first_pass_yield");
    expect(fpy).toBeDefined();
    expect(fpy?.numericValue).toBeGreaterThan(90);
  });

  it("returns an empty needs-attention queue when no tenant facts exist", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    const dashboard = analyticsService.getExecutiveDashboardMetrics(session);

    expect(dashboard.needsAttentionQueue).toEqual([]);
  });

  it("evaluates workcenter capacity and identifies overloaded cells", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    const dashboard = analyticsService.getExecutiveDashboardMetrics(session);

    expect(dashboard.capacitySignals.length).toBe(4);
    const brakeCell = dashboard.capacitySignals.find((c) => c.workCenterCode === "WC-BRAKE");
    expect(brakeCell).toBeDefined();
    expect(brakeCell?.status).toBe("overloaded");
    expect(brakeCell?.utilizationPercentage).toBeGreaterThan(100);
  });

  it("requires human approval for planning suggestions and records actor audit trail", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    const approved = analyticsService.approvePlanningSuggestion(session, "sug_1");

    expect(approved.status).toBe("approved");
    expect(approved.approvedByUserId).toBe(owner.id);
    expect(approved.approvedByName).toBe("Owner");
    expect(approved.approvedAt).toBeDefined();
  });
});
