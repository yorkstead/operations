import { SessionContext } from "../../core/domain/types";
import { SUMMIT_FACILITY_FIXTURE_DATA } from "../domain/summit-facility-scenario";
import { maintenanceService } from "../../maintenance/application/maintenance-service";
import { inventoryService } from "../../inventory/application/inventory-service";
import { qualityService } from "../../quality/application/quality-service";
import { fileService } from "../../core/application/file-service";
import { analyticsService } from "../../analytics/application/analytics-service";
import { activityService } from "../../core/application/activity-service";

export interface SummitFacilitySeedingResult {
  success: boolean;
  organizationId: string;
  scenarioSlug: string;
  totalRecordsSeeded: number;
  breakdown: {
    equipmentAssets: number;
    maintenanceWorkOrders: number;
    maintenanceDowntimes: number;
    inventoryItems: number;
    inventoryMovements: number;
    serviceJobs: number;
    inspections: number;
    files: number;
    analytics: number;
    activityEvents: number;
  };
}

export class SummitFacilitySeeder {
  private seededOrgs: Set<string> = new Set();

  private assertDemoOrganization(session: SessionContext, operation: string) {
    if (!session?.activeOrganization) {
      throw new Error("Unauthorized: Active session required.");
    }
    const org = session.activeOrganization;
    if (org.isDemo !== true || org.id === "org_yorkstead_systems" || org.slug === "yorkstead") {
      throw new Error(
        `Forbidden: Cannot ${operation} production customer organization '${org.name}' (${org.id}). Demo operations require isDemo: true.`
      );
    }
    return org;
  }

  /**
   * Seeds the complete Summit Facility Services dataset into active demo organization.
   * STRICT GUARDRAIL: Immediately rejects any production or non-demo organization.
   */
  seed(session: SessionContext): SummitFacilitySeedingResult {
    const org = this.assertDemoOrganization(session, "seed");
    const orgId = org.id;

    if (this.seededOrgs.has(orgId)) {
      return {
        success: true,
        organizationId: orgId,
        scenarioSlug: SUMMIT_FACILITY_FIXTURE_DATA.organization.slug,
        totalRecordsSeeded: 0,
        breakdown: {
          equipmentAssets: 0,
          maintenanceWorkOrders: 0,
          maintenanceDowntimes: 0,
          inventoryItems: 0,
          inventoryMovements: 0,
          serviceJobs: 0,
          inspections: 0,
          files: 0,
          analytics: 0,
          activityEvents: 0,
        },
      };
    }

    const { equipment, inventoryItems, seededRecords } = SUMMIT_FACILITY_FIXTURE_DATA;
    const now = new Date().toISOString();

    // 1. Equipment Registry & Assets
    equipment.forEach((eq) => {
      maintenanceService["equipment"].set(`${orgId}:${eq.assetTag}`, {
        id: `eq_${orgId}_${eq.assetTag}`,
        organizationId: orgId,
        assetTag: eq.assetTag,
        name: eq.name,
        manufacturer: eq.manufacturer,
        modelNumber: eq.modelNumber,
        serialNumber: eq.serialNumber,
        locationCode: eq.locationCode,
        workCenterCode: eq.workCenterCode,
        criticality: eq.criticality,
        status: "operational",
        qrCodeData: `yorkstead://equipment/${eq.assetTag}`,
        lastServiceDate: "2026-08-15",
        nextScheduledPmDate: "2026-09-15",
        totalRunHours: eq.totalRunHours,
      });
    });

    // 2. Unplanned Downtime Interval (Chiller High Head Pressure Trip)
    const downtime = {
      id: `dt_${orgId}_chill_01`,
      organizationId: orgId,
      equipmentId: `eq_${orgId}_${seededRecords.assetTag}`,
      assetTag: seededRecords.assetTag,
      category: "unplanned_breakdown" as const,
      reason: "High condenser head pressure trip (285 PSI). Condenser water strainer clogged with scale debris.",
      impactSummary: "Chilled water loop temperature elevated to 54°F. Resolved in 45 min before cleanroom shutdown.",
      startedAt: "2026-08-25T14:00:00Z",
      resolvedAt: "2026-08-25T14:45:00Z",
      durationMinutes: 45,
      reportedByUserId: "usr_tanya_brooks",
      reportedByName: "Tanya Brooks",
      resolvedByUserId: "usr_tanya_brooks",
      resolvedByName: "Tanya Brooks",
      workOrderId: `wo_${orgId}_8842`,
      createdAt: now,
    };
    maintenanceService["downtimeIntervals"].set(downtime.id, downtime);

    // 3. Emergency Corrective Work Order & PM Work Order
    const emergencyWo = {
      id: `wo_${orgId}_8842`,
      organizationId: orgId,
      workOrderNumber: seededRecords.workOrderNumber,
      equipmentId: `eq_${orgId}_${seededRecords.assetTag}`,
      assetTag: seededRecords.assetTag,
      type: "corrective_emergency" as const,
      status: "closed_returned_to_service" as const,
      title: "Centrifugal Chiller High Head Pressure Trip Isolation",
      description: "Backwashed condenser tubes, cleared strainer basket, replaced EPDM head gaskets, and topped off POE 68 oil.",
      priority: "emergency" as const,
      assignedTechnicianId: "usr_tanya_brooks",
      assignedTechnicianName: "Tanya Brooks",
      replacementPartsUsed: [
        { itemCode: "OIL-SYN-POE68", description: "Synthetic POE Refrigeration Lubricant ISO VG 68", quantity: 2 },
        { itemCode: "GSK-FLANGE-EPDM", description: "4-inch EPDM Chiller Condenser Flange Gasket Set", quantity: 2 },
      ],
      actualLaborMinutes: 45,
      returnToServiceAuthorizedByUserId: "usr_tanya_brooks",
      returnToServiceAuthorizedByName: "Tanya Brooks",
      returnToServiceNotes: "Condenser approach temp verified at 1.8°F. Refrigerant pressures normalized (190 PSI). Return to automated sequence authorized.",
      completedAt: now,
      createdAt: now,
    };
    maintenanceService["workOrders"].set(emergencyWo.id, emergencyWo);

    const pmWo = {
      id: `wo_${orgId}_8840`,
      organizationId: orgId,
      workOrderNumber: seededRecords.pmWorkOrderNumber,
      equipmentId: `eq_${orgId}_EQ-AHU-04`,
      assetTag: "EQ-AHU-04",
      type: "preventive_scheduled" as const,
      status: "open" as const,
      title: "Quarterly Cleanroom AHU Differential Pressure & HEPA Filter PM",
      description: "Measure static pressure across HEPA filter banks, inspect V-belts, grease blower bearings, verify VAV damper actuators.",
      priority: "standard" as const,
      assignedTechnicianId: "usr_carlos_ortiz",
      assignedTechnicianName: "Carlos Ortiz",
      replacementPartsUsed: [
        { itemCode: "FLT-HEPA-24X24", description: "Hospital Grade HEPA Air Filter 24in x 24in x 12in", quantity: 8 },
      ],
      actualLaborMinutes: 0,
      createdAt: now,
    };
    maintenanceService["workOrders"].set(pmWo.id, pmWo);

    // 4. Inventory Ledger & Spare Parts
    inventoryItems.forEach((item, idx) => {
      const itemId = `item_${orgId}_${item.itemCode}`;
      const inventoryItem = {
        id: itemId,
        organizationId: orgId,
        itemCode: item.itemCode,
        description: item.description,
        category: item.category,
        unitOfMeasure: item.uom,
        reorderPoint: String(item.reorderThreshold),
        reorderQuantity: String(item.initialQuantity),
        standardCostCents: item.unitCostCents,
        lotTrackingRequired: true,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      };
      inventoryService["items"].set(itemId, inventoryItem);

      const movementId = `mov_${orgId}_${idx + 1}`;
      const movement = {
        id: movementId,
        organizationId: orgId,
        itemId,
        itemCode: item.itemCode,
        lotNumber: item.lotNumber,
        movementType: "issue_to_job" as const,
        quantity: String(item.allocatedQuantity),
        unitCostCents: item.unitCostCents,
        fromLocationCode: "LOC-MECH-ROOM-B1",
        toLocationCode: "EQ-CHILL-01",
        referenceType: "work_order",
        referenceId: emergencyWo.workOrderNumber,
        actorUserId: "usr_tanya_brooks",
        actorName: "Tanya Brooks",
        occurredAt: now,
        createdAt: now,
      };
      inventoryService["movements"].set(movementId, movement);
    });

    // 5. LOTO Safety & Environmental Health Inspection
    const inspection = {
      id: `insp_${orgId}_008`,
      organizationId: orgId,
      inspectionType: "in_process" as const,
      jobId: emergencyWo.id,
      jobNumber: emergencyWo.workOrderNumber,
      partDescription: "York YK 500-Ton Centrifugal Chiller Condenser Head Assembly",
      travelerOperationId: "op_loto_isolation",
      inspectorUserId: "usr_tanya_brooks",
      inspectorName: "Tanya Brooks (Lead HVAC Tech)",
      status: "passed" as const,
      sampleSize: 4,
      passedQuantity: 4,
      failedQuantity: 0,
      checklist: [
        { id: "chk_loto_1", characteristic: "LOTO 480V Breaker #4B Locked & Tagged", targetSpec: "Zero energy verified with Fluke multi-meter", result: "pass" as const, measuredValue: "0.00 VAC" },
        { id: "chk_loto_2", characteristic: "Refrigerant Condenser Isolation Valves Closed", targetSpec: "Dual valve block verified locked", result: "pass" as const, measuredValue: "Closed / Tagged" },
        { id: "chk_loto_3", characteristic: "Strainer Debris Clearance & Flush", targetSpec: "100% free of particulate scaling", result: "pass" as const, measuredValue: "Flushed & Clear" },
        { id: "chk_loto_4", characteristic: "Flange Torque Specification (4-bolt)", targetSpec: "85 ft-lbs cross-pattern torque", result: "pass" as const, measuredValue: "85 ft-lbs verified" },
      ],
      completedAt: now,
      createdAt: now,
    };
    qualityService["inspections"].set(inspection.id, inspection);

    // 6. Maintenance File Vault Documents
    const files = [
      {
        id: `file_${orgId}_oem_manual`,
        organizationId: orgId,
        uploadedByUserId: "usr_tanya_brooks",
        uploadedByName: "Tanya Brooks",
        filename: "York-YK-Chiller-Service-Manual-RevD.pdf",
        mimeType: "application/pdf",
        sizeBytes: 4280000,
        storageKey: "manuals/summit/York-YK-Chiller-Service-Manual-RevD.pdf",
        status: "clean" as const,
        entityType: "equipment",
        entityId: `eq_${orgId}_${seededRecords.assetTag}`,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `file_${orgId}_poe68_sds`,
        organizationId: orgId,
        uploadedByUserId: "usr_tanya_brooks",
        uploadedByName: "Tanya Brooks",
        filename: "Safety-Data-Sheet-Emkarate-RL68H-POE.pdf",
        mimeType: "application/pdf",
        sizeBytes: 310000,
        storageKey: "sds/summit/Safety-Data-Sheet-Emkarate-RL68H-POE.pdf",
        status: "clean" as const,
        entityType: "inventory_item",
        entityId: "OIL-SYN-POE68",
        createdAt: now,
        updatedAt: now,
      },
    ];
    files.forEach((f) => fileService["fileRecords"].set(f.id, f));

    // 7. Maintenance Planning Suggestion
    const suggestion = {
      id: `sug_${orgId}_pm_ahu`,
      organizationId: orgId,
      title: "Predictive PM Advance: Advance AHU-04 HEPA Filter Replacement due to High Static Pressure Differential",
      category: "workcenter_rebalance" as const,
      rationale: "Cleanroom static pressure differential trended +22% over baseline, indicating filter loading ahead of scheduled quarterly PM.",
      constraints: ["Maintain Class 10,000 ISO cleanroom positive pressure", "Schedule work during graveyard facility lull (02:00 - 05:00)"],
      tradeOffs: ["Early replacement of 8 HEPA filters ($960) vs risking cleanroom particulate concession and batch loss"],
      confidenceScore: 0.96,
      requiresHumanApproval: true as const,
      status: "approved" as const,
      approvedByUserId: "usr_tanya_brooks",
      approvedByName: "Tanya Brooks",
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    analyticsService["suggestions"].set(suggestion.id, suggestion);

    // 8. Comprehensive Activity Audit Trail
    const events = [
      { action: "equipment.registered", entity: "equipment" as const, id: `eq_${orgId}_${seededRecords.assetTag}`, summary: "York YK 500-Ton Centrifugal Chiller asset registered in Central Plant registry." },
      { action: "maintenance.downtime_logged", entity: "equipment" as const, id: downtime.id, summary: "High condenser head pressure trip logged on EQ-CHILL-01. Unplanned downtime started." },
      { action: "maintenance.work_order_created", entity: "equipment" as const, id: emergencyWo.id, summary: `Emergency work order ${emergencyWo.workOrderNumber} dispatched to Tanya Brooks.` },
      { action: "inventory.parts_issued", entity: "inventory_item" as const, id: "OIL-SYN-POE68", summary: "2 boxes POE 68 oil and 2 EPDM flange gaskets issued to WO-2026-8842." },
      { action: "quality.loto_inspected", entity: "inspection" as const, id: inspection.id, summary: "LOTO Zero-Energy and flange torque inspection passed with 4/4 checklist items verified." },
      { action: "maintenance.return_to_service", entity: "equipment" as const, id: emergencyWo.id, summary: "EQ-CHILL-01 returned to active automated service. Condenser approach verified at 1.8°F." },
      { action: "maintenance.downtime_resolved", entity: "equipment" as const, id: downtime.id, summary: "Chiller downtime resolved in 45 minutes (MTTR benchmark 60 min)." },
      { action: "analytics.suggestion_approved", entity: "job" as const, id: suggestion.id, summary: "Advance AHU-04 HEPA filter replacement suggestion approved by Lead HVAC Tech." },
    ];

    events.forEach((e) => {
      activityService.logActivity({
        organizationId: orgId,
        actorId: "usr_tanya_brooks",
        actorName: "Tanya Brooks",
        entityType: e.entity,
        entityId: e.id,
        action: e.action,
        summary: e.summary,
      });
    });

    this.seededOrgs.add(orgId);

    return {
      success: true,
      organizationId: orgId,
      scenarioSlug: SUMMIT_FACILITY_FIXTURE_DATA.organization.slug,
      totalRecordsSeeded: SUMMIT_FACILITY_FIXTURE_DATA.counts.totalConnectedRecords,
      breakdown: {
        equipmentAssets: SUMMIT_FACILITY_FIXTURE_DATA.counts.equipmentAssets,
        maintenanceWorkOrders: SUMMIT_FACILITY_FIXTURE_DATA.counts.maintenanceWorkOrders,
        maintenanceDowntimes: SUMMIT_FACILITY_FIXTURE_DATA.counts.maintenanceDowntimes,
        inventoryItems: SUMMIT_FACILITY_FIXTURE_DATA.counts.inventoryItems,
        inventoryMovements: SUMMIT_FACILITY_FIXTURE_DATA.counts.inventoryMovements,
        serviceJobs: SUMMIT_FACILITY_FIXTURE_DATA.counts.serviceJobs,
        inspections: SUMMIT_FACILITY_FIXTURE_DATA.counts.inspections,
        files: SUMMIT_FACILITY_FIXTURE_DATA.counts.fileVaultRecords,
        analytics: SUMMIT_FACILITY_FIXTURE_DATA.counts.planningSuggestions,
        activityEvents: SUMMIT_FACILITY_FIXTURE_DATA.counts.auditEvents,
      },
    };
  }

  /**
   * Resets Summit Facility Services dataset for active demo organization to golden baseline.
   * STRICT GUARDRAIL: Rejects production customer organizations.
   */
  reset(session: SessionContext): SummitFacilitySeedingResult {
    this.assertDemoOrganization(session, "reset");
    this.clean(session);
    return this.seed(session);
  }

  /**
   * Removes seeded Summit Facility Services demo records for the organization.
   * STRICT GUARDRAIL: Rejects production customer organizations.
   */
  clean(session: SessionContext): { success: boolean; recordsRemoved: number } {
    this.assertDemoOrganization(session, "clean");
    const orgId = session.activeOrganization.id;

    if (!this.seededOrgs.has(orgId)) {
      return { success: true, recordsRemoved: 0 };
    }

    maintenanceService["downtimeIntervals"].delete(`dt_${orgId}_chill_01`);
    maintenanceService["workOrders"].delete(`wo_${orgId}_8842`);
    maintenanceService["workOrders"].delete(`wo_${orgId}_8840`);
    qualityService["inspections"].delete(`insp_${orgId}_008`);
    fileService["fileRecords"].delete(`file_${orgId}_oem_manual`);
    fileService["fileRecords"].delete(`file_${orgId}_poe68_sds`);
    analyticsService["suggestions"].delete(`sug_${orgId}_pm_ahu`);

    this.seededOrgs.delete(orgId);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: orgId,
      action: "demo.organization_cleaned",
      summary: `Cleaned Summit Facility Services demo records for organization '${session.activeOrganization.name}'.`,
    });

    return { success: true, recordsRemoved: SUMMIT_FACILITY_FIXTURE_DATA.counts.totalConnectedRecords };
  }
}

export const summitFacilitySeeder = new SummitFacilitySeeder();
