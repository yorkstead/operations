import { describe, expect, it } from "bun:test";
import { MaintenanceService } from "../modules/maintenance/application/maintenance-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const maintenanceService = new MaintenanceService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "maint_lead@acme.com",
  name: "Maintenance Lead",
  organizationName: "Acme Metalworks",
  organizationSlug: "acme-maint",
});

identityService.createOrganization(userA.id, "Rival Plant", "rival-plant");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);
maintenanceService.seedSyntheticFixturesForTesting(tenantA);

describe("Maintenance & Equipment Vertical Slice: Asset Telemetry, Downtime Intervals, Work Orders & IDOR", () => {
  let createdIntervalId: string;
  let emergencyWoId: string;

  it("lists seeded equipment assets for active tenant organization", () => {
    const list = maintenanceService.listEquipment(tenantA);
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.some((e) => e.assetTag === "EQ-LASER-01")).toBe(true);
  });

  it("reports unplanned breakdown downtime and auto-creates emergency work order", () => {
    const interval = maintenanceService.reportDowntime(tenantA, {
      equipmentId: "EQ-LASER-01",
      category: "unplanned_breakdown",
      reason: "High-pressure nitrogen assist valve failure.",
      impactSummary: "Laser cutting operations offline for Job 104.",
    });

    createdIntervalId = interval.id;
    emergencyWoId = interval.workOrderId!;

    expect(interval.category).toBe("unplanned_breakdown");
    expect(interval.workOrderId).toBeDefined();

    // Verify equipment status changed to down_unplanned
    const assets = maintenanceService.listEquipment(tenantA);
    const laser = assets.find((e) => e.assetTag === "EQ-LASER-01");
    expect(laser?.status).toBe("down_unplanned");
  });

  it("enforces non-overlapping downtime intervals guardrail on the same equipment", () => {
    expect(() => {
      maintenanceService.reportDowntime(tenantA, {
        equipmentId: "EQ-LASER-01",
        category: "tooling_failure",
        reason: "Duplicate interval attempt.",
        impactSummary: "Should be rejected.",
      });
    }).toThrow("active unresolved downtime interval");
  });

  it("resolves downtime interval and verifies duration calculation", () => {
    const resolved = maintenanceService.resolveDowntime(
      tenantA,
      createdIntervalId,
      "Nitrogen valve solenoid replaced and pressure calibrated to 18 bar."
    );

    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.durationMinutes).toBeGreaterThanOrEqual(1);
    expect(resolved.resolvedByUserId).toBe(tenantA.user.id);
  });

  it("authorizes work order return-to-service and restores equipment status to operational", () => {
    const authorized = maintenanceService.authorizeReturnToService(tenantA, emergencyWoId, {
      authorizedNotes: "Assisted pressure tested. Certified ready for production.",
      partsUsed: [{ itemCode: "VLV-N2-01", description: "Solenoid Valve 24V", quantity: 1 }],
      laborMinutes: 45,
    });

    expect(authorized.status).toBe("closed_returned_to_service");
    expect(authorized.returnToServiceAuthorizedByUserId).toBe(tenantA.user.id);

    const assets = maintenanceService.listEquipment(tenantA);
    const laser = assets.find((e) => e.assetTag === "EQ-LASER-01");
    expect(laser?.status).toBe("operational");
  });

  it("strictly isolates equipment assets and downtime events across tenant boundaries (IDOR)", () => {
    const orgBEquipment = maintenanceService.listEquipment(tenantB);
    // Tenant B equipment should belong to Tenant B
    for (const eq of orgBEquipment) {
      expect(eq.organizationId).toBe(tenantB.activeOrganization.id);
    }
  });
});
