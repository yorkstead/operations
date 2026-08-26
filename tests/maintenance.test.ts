import { describe, expect, it, beforeEach } from "bun:test";
import { MaintenanceService } from "../modules/maintenance/application/maintenance-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Maintenance & Downtime Module", () => {
  let maintenanceService: MaintenanceService;
  let identityService: IdentityService;

  beforeEach(() => {
    maintenanceService = new MaintenanceService();
    identityService = new IdentityService();
  });

  it("reports downtime, opens interval, and rejects overlapping intervals", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    maintenanceService.seedSyntheticFixturesForTesting(session);

    // Report downtime
    const interval = maintenanceService.reportDowntime(session, {
      equipmentId: "EQ-LASER-01",
      category: "unplanned_breakdown",
      reason: "Fiber laser cutting head thermal sensor error.",
      impactSummary: "Laser cutting operations halted for Job 104.",
    });

    expect(interval.id).toBeDefined();
    expect(interval.workOrderId).toBeDefined();
    expect(interval.category).toBe("unplanned_breakdown");

    // Overlapping downtime interval must fail
    expect(() => {
      maintenanceService.reportDowntime(session, {
        equipmentId: "EQ-LASER-01",
        category: "tooling_failure",
        reason: "Duplicate interval attempt.",
        impactSummary: "Should fail.",
      });
    }).toThrow("active unresolved downtime interval");
  });

  it("resolves downtime and authorizes return to service with labor and parts tracking", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    maintenanceService.seedSyntheticFixturesForTesting(session);

    const interval = maintenanceService.reportDowntime(session, {
      equipmentId: "EQ-BRAKE-01",
      category: "planned_preventive",
      reason: "Scheduled 500-hour hydraulic fluid flush and filter replacement.",
      impactSummary: "Scheduled weekend maintenance.",
    });

    // Resolve downtime
    const resolved = maintenanceService.resolveDowntime(session, interval.id, "Fluid replaced and seals inspected.");
    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.durationMinutes).toBeGreaterThan(0);

    // Create and Authorize Work Order
    const wo = maintenanceService.createWorkOrder(session, {
      equipmentId: "EQ-BRAKE-01",
      type: "preventive_scheduled",
      priority: "standard",
      title: "Hydraulic PM",
      description: "Filter replacement",
    });

    const authorized = maintenanceService.authorizeReturnToService(session, wo.id, {
      authorizedNotes: "Hydraulic pressure calibrated to 240 bar. Safe for production.",
      partsUsed: [{ itemCode: "FLTR-HYD-01", description: "Hydraulic Filter", quantity: 2 }],
      laborMinutes: 90,
    });

    expect(authorized.status).toBe("closed_returned_to_service");
    expect(authorized.returnToServiceAuthorizedByUserId).toBe(owner.id);
  });

  it("derives fleet metrics and uptime statistics", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    maintenanceService.seedSyntheticFixturesForTesting(session);
    const metrics = maintenanceService.getMaintenanceMetrics(session);

    expect(metrics.totalAssets).toBe(3);
    expect(metrics.operationalUptimePercentage).toBeGreaterThan(0);
    expect(metrics.meanTimeToRepairMinutes).toBeGreaterThan(0);
  });
});
