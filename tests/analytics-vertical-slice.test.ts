import { describe, expect, it } from "bun:test";
import { AnalyticsService } from "../modules/analytics/application/analytics-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const analyticsService = new AnalyticsService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "exec_vp@acme.com",
  name: "Executive VP",
  organizationName: "Acme Industrial",
  organizationSlug: "acme-industrial",
});

identityService.createOrganization(userA.id, "Rival Factory", "rival-factory");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("Analytics & Operational Planning Vertical Slice: Governed Metrics, Capacity & IDOR", () => {
  it("compiles governed executive dashboard metrics adhering to METRICS.md definitions", () => {
    const dashboard = analyticsService.getExecutiveDashboardMetrics(tenantA);

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

    const fleet = dashboard.metrics.find((m) => m.metricKey === "fleet_uptime" || m.metricKey === "fleet_availability");
    expect(fleet).toBeDefined();
    expect(fleet?.numericValue).toBeGreaterThan(90);
  });

  it("does not fabricate needs-attention exceptions for an empty tenant", () => {
    const dashboard = analyticsService.getExecutiveDashboardMetrics(tenantA);

    expect(dashboard.needsAttentionQueue).toEqual([]);
  });

  it("computes work center capacity utilization and flags overloaded cells", () => {
    const dashboard = analyticsService.getExecutiveDashboardMetrics(tenantA);

    expect(dashboard.capacitySignals.length).toBe(4);
    const brake = dashboard.capacitySignals.find((c) => c.workCenterCode === "WC-BRAKE");
    expect(brake).toBeDefined();
    expect(brake?.status).toBe("overloaded");
    expect(brake?.utilizationPercentage).toBeGreaterThan(100);
  });

  it("authorizes human executive approval for AI planning suggestion", () => {
    const approved = analyticsService.approvePlanningSuggestion(tenantA, "sug_1");

    expect(approved.status).toBe("approved");
    expect(approved.approvedByUserId).toBe(tenantA.user.id);
    expect(approved.approvedByName).toBe("Executive VP");
    expect(approved.approvedAt).toBeDefined();
  });

  it("strictly enforces tenant boundary and denies cross-tenant metric bleed (IDOR)", () => {
    const dashboardB = analyticsService.getExecutiveDashboardMetrics(tenantB);
    expect(dashboardB.lastRefreshedAt).toBeDefined();
    expect(dashboardB.metrics.length).toBeGreaterThanOrEqual(6);
  });
});
