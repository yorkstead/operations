import { describe, it, expect } from "bun:test";
import { summitFacilitySeeder } from "../modules/demo/application/summit-facility-seeder";
import { SUMMIT_FACILITY_FIXTURE_DATA } from "../modules/demo/domain/summit-facility-scenario";
import { maintenanceService } from "../modules/maintenance/application/maintenance-service";
import { inventoryService } from "../modules/inventory/application/inventory-service";
import { qualityService } from "../modules/quality/application/quality-service";
import { fileService } from "../modules/core/application/file-service";
import { analyticsService } from "../modules/analytics/application/analytics-service";
import { activityService } from "../modules/core/application/activity-service";
import { SessionContext, Organization, User, Membership } from "../modules/core/domain/types";

describe("Summit Facility Services: Rich End-to-End Synthetic Dataset Suite", () => {
  const prodOrg: Organization = {
    id: "org_summit_real_prod",
    name: "Summit Facility Management Corp (Production)",
    slug: "summit-facility-corp",
    status: "active",
    isDemo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoOrg: Organization = {
    id: `org_${Date.now()}_summit_demo`,
    name: "Summit Facility Services",
    slug: "summit-facility-services",
    status: "active",
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUser: User = {
    id: "usr_tanya_brooks",
    email: "tanya.brooks@summitfacility.com",
    name: "Tanya Brooks",
    status: "active",
    isGlobalOwner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createMembership = (org: Organization): Membership => ({
    id: `mem_${org.id}_${mockUser.id}`,
    organizationId: org.id,
    userId: mockUser.id,
    role: "owner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const prodSession: SessionContext = {
    user: mockUser,
    activeOrganization: prodOrg,
    currentMembership: createMembership(prodOrg),
    allMemberships: [{ membership: createMembership(prodOrg), organization: prodOrg }],
  };

  const demoSession: SessionContext = {
    user: mockUser,
    activeOrganization: demoOrg,
    currentMembership: createMembership(demoOrg),
    allMemberships: [{ membership: createMembership(demoOrg), organization: demoOrg }],
  };

  it("STRICT SAFETY GUARDRAIL: Refuses to seed production customer organization", () => {
    expect(() => {
      summitFacilitySeeder.seed(prodSession);
    }).toThrow("Forbidden: Cannot seed production customer organization");
  });

  it("STRICT SAFETY GUARDRAIL: Refuses to reset or clean production customer organization", () => {
    expect(() => {
      summitFacilitySeeder.reset(prodSession);
    }).toThrow("Forbidden: Cannot");

    expect(() => {
      summitFacilitySeeder.clean(prodSession);
    }).toThrow("Forbidden: Cannot clean production customer organization");
  });

  it("Successfully seeds the complete Summit Facility Services connected dataset into demo tenant", () => {
    const seedResult = summitFacilitySeeder.seed(demoSession);
    expect(seedResult.success).toBe(true);
    expect(seedResult.totalRecordsSeeded).toBe(SUMMIT_FACILITY_FIXTURE_DATA.counts.totalConnectedRecords);

    // 1. Equipment Registry
    const equipment = maintenanceService.getEquipment(demoSession, SUMMIT_FACILITY_FIXTURE_DATA.seededRecords.assetTag);
    expect(equipment).toBeDefined();
    expect(equipment?.assetTag).toBe("EQ-CHILL-01");
    expect(equipment?.criticality).toBe("critical_single_point_of_failure");
    expect(equipment?.totalRunHours).toBe(5240);

    // 2. Downtime Incident
    const downtimes = maintenanceService.listDowntimeIntervals(demoSession);
    expect(downtimes.length).toBeGreaterThanOrEqual(1);
    const dt = downtimes.find((d) => d.id === `dt_${demoOrg.id}_chill_01`);
    expect(dt).toBeDefined();
    expect(dt?.durationMinutes).toBe(45);
    expect(dt?.reportedByName).toBe("Tanya Brooks");

    // 3. Work Orders (Emergency & PM)
    const workOrders = maintenanceService.listWorkOrders(demoSession);
    expect(workOrders.length).toBeGreaterThanOrEqual(2);
    const emergencyWo = workOrders.find((w) => w.workOrderNumber === SUMMIT_FACILITY_FIXTURE_DATA.seededRecords.workOrderNumber);
    expect(emergencyWo).toBeDefined();
    expect(emergencyWo?.status).toBe("closed_returned_to_service");
    expect(emergencyWo?.actualLaborMinutes).toBe(45);
    expect(emergencyWo?.replacementPartsUsed.length).toBe(2);

    const pmWo = workOrders.find((w) => w.workOrderNumber === SUMMIT_FACILITY_FIXTURE_DATA.seededRecords.pmWorkOrderNumber);
    expect(pmWo).toBeDefined();
    expect(pmWo?.type).toBe("preventive_scheduled");
    expect(pmWo?.status).toBe("open");

    // 4. Inventory Ledger & Spare Parts
    const item = inventoryService.getItem(demoSession, "OIL-SYN-POE68");
    expect(item).toBeDefined();
    expect(item?.standardCostCents).toBe(18500);

    // 5. Quality & LOTO Inspection
    const inspection = qualityService.getInspection(demoSession, `insp_${demoOrg.id}_008`);
    expect(inspection).toBeDefined();
    expect(inspection?.status).toBe("passed");
    expect(inspection?.passedQuantity).toBe(4);
    expect(inspection?.checklist.length).toBe(4);

    // 6. Maintenance File Vault Documents
    const files = fileService.listFiles(demoSession);
    const manualDoc = files.find((f) => f.id === `file_${demoOrg.id}_oem_manual`);
    expect(manualDoc).toBeDefined();
    expect(manualDoc?.filename).toBe("York-YK-Chiller-Service-Manual-RevD.pdf");

    // 7. Planning Suggestion
    const suggestions = analyticsService.listSuggestions(demoSession);
    const ahuSug = suggestions.find((s) => s.id === `sug_${demoOrg.id}_pm_ahu`);
    expect(ahuSug).toBeDefined();
    expect(ahuSug?.requiresHumanApproval).toBe(true);

    // 8. Activity Audit Events
    const activities = activityService.getRecentActivities(demoSession);
    expect(activities.length).toBeGreaterThanOrEqual(8);
  });

  it("Guarantees idempotent demo seeding with zero duplicate records", () => {
    const repeatResult = summitFacilitySeeder.seed(demoSession);
    expect(repeatResult.success).toBe(true);
    expect(repeatResult.totalRecordsSeeded).toBe(0);
  });

  it("Maintains strict tenant isolation between production and demo organizations", () => {
    expect(() => maintenanceService.getEquipment(prodSession, "EQ-CHILL-01")).toThrow();
    expect(() => qualityService.getInspection(prodSession, `insp_${demoOrg.id}_008`)).toThrow();
  });

  it("Executes deterministic golden snapshot reset back to pristine state", () => {
    const resetResult = summitFacilitySeeder.reset(demoSession);
    expect(resetResult.success).toBe(true);
    expect(resetResult.totalRecordsSeeded).toBe(SUMMIT_FACILITY_FIXTURE_DATA.counts.totalConnectedRecords);

    const reloadedWo = maintenanceService.listWorkOrders(demoSession).find((w) => w.workOrderNumber === SUMMIT_FACILITY_FIXTURE_DATA.seededRecords.workOrderNumber);
    expect(reloadedWo).toBeDefined();
  });
});
