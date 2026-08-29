import {
  Equipment,
  DowntimeInterval,
  MaintenanceWorkOrder,
  MaintenanceMetricsSummary,
  DowntimeCategory,
  MaintenanceWorkOrderType,
  MaintenancePartUsage,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";
import { notificationService } from "../../core/application/notification-service";

export class MaintenanceService {
  private equipment: Map<string, Equipment> = new Map();
  private downtimeIntervals: Map<string, DowntimeInterval> = new Map();
  private workOrders: Map<string, MaintenanceWorkOrder> = new Map();

  constructor() {
    this.seedDefaultEquipment("org_default");
  }

  private seedDefaultEquipment(orgId: string) {
    const assets: Omit<Equipment, "organizationId">[] = [
      {
        id: "eq_1",
        assetTag: "EQ-LASER-01",
        name: "Mitsubishi 4kW Fiber Laser System",
        manufacturer: "Mitsubishi Electric",
        modelNumber: "ML3015eX-F40",
        serialNumber: "MB-2021-9844",
        workCenterCode: "WC-LASER-01",
        locationCode: "BAY-1",
        criticality: "critical_single_point_of_failure",
        status: "operational",
        qrCodeData: "yorkstead://equipment/EQ-LASER-01",
        lastServiceDate: "2026-07-15",
        nextScheduledPmDate: "2026-09-15",
        totalRunHours: 3420,
      },
      {
        id: "eq_2",
        assetTag: "EQ-BRAKE-01",
        name: "Amada 150-Ton CNC Press Brake",
        manufacturer: "Amada",
        modelNumber: "HG-1503",
        serialNumber: "AM-2020-5512",
        workCenterCode: "WC-BRAKE-01",
        locationCode: "BAY-2",
        criticality: "high",
        status: "operational",
        qrCodeData: "yorkstead://equipment/EQ-BRAKE-01",
        lastServiceDate: "2026-08-01",
        nextScheduledPmDate: "2026-10-01",
        totalRunHours: 2180,
      },
      {
        id: "eq_3",
        assetTag: "EQ-COMPR-01",
        name: "Ingersoll Rand 50HP Rotary Screw Air Compressor",
        manufacturer: "Ingersoll Rand",
        modelNumber: "R37e",
        serialNumber: "IR-2019-1109",
        workCenterCode: "WC-FACILITY",
        locationCode: "MECH-ROOM-1",
        criticality: "critical_single_point_of_failure",
        status: "operational",
        qrCodeData: "yorkstead://equipment/EQ-COMPR-01",
        lastServiceDate: "2026-06-10",
        nextScheduledPmDate: "2026-08-20", // overdue!
        totalRunHours: 8940,
      },
    ];

    for (const eq of assets) {
      this.equipment.set(`${orgId}:${eq.assetTag}`, { ...eq, organizationId: orgId });
    }
  }

  private ensureEquipmentSeeded(orgId: string) {
    const existing = Array.from(this.equipment.values()).filter((e) => e.organizationId === orgId);
    if (existing.length === 0) {
      this.seedDefaultEquipment(orgId);
    }
  }

  /** Explicit test-fixture setup. Never call this from a production request path. */
  seedSyntheticFixturesForTesting(session: SessionContext): void {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Synthetic maintenance fixtures are restricted to the test runtime.");
    }
    this.ensureEquipmentSeeded(session.activeOrganization.id);
  }

  // 1. Report Equipment Downtime (Non-overlapping intervals guardrail)
  reportDowntime(
    session: SessionContext,
    params: {
      equipmentId: string;
      category: DowntimeCategory;
      reason: string;
      impactSummary: string;
    }
  ): DowntimeInterval {
    authorizationService.requireCapability(session, "shopfloor:execute_station");

    const eq = this.findEquipment(session, params.equipmentId);

    // Check for active open downtime intervals (no duplicate overlapping open intervals)
    const activeInterval = Array.from(this.downtimeIntervals.values()).find(
      (d) => d.organizationId === session.activeOrganization.id && d.equipmentId === eq.id && !d.resolvedAt
    );
    if (activeInterval) {
      throw new Error(`Equipment ${eq.assetTag} already has an active unresolved downtime interval.`);
    }

    const id = `dt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const interval: DowntimeInterval = {
      id,
      organizationId: session.activeOrganization.id,
      equipmentId: eq.id,
      assetTag: eq.assetTag,
      category: params.category,
      reason: params.reason.trim(),
      impactSummary: params.impactSummary.trim(),
      startedAt: now,
      reportedByUserId: session.user.id,
      reportedByName: session.user.name,
    };

    this.downtimeIntervals.set(id, interval);

    // Update equipment status
    eq.status = params.category === "planned_preventive" ? "down_planned_pm" : "down_unplanned";
    this.equipment.set(`${session.activeOrganization.id}:${eq.assetTag}`, eq);

    // Auto-generate emergency work order if unplanned breakdown
    if (params.category === "unplanned_breakdown" || params.category === "tooling_failure") {
      const wo = this.createWorkOrder(session, {
        equipmentId: eq.id,
        type: "corrective_emergency",
        priority: "emergency",
        title: `Emergency Repair: ${eq.assetTag} - ${params.reason}`,
        description: `Unplanned downtime reported by ${session.user.name}: "${params.reason}". Impact: ${params.impactSummary}`,
      });
      interval.workOrderId = wo.id;
    }

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: eq.id,
      action: "maintenance.downtime_reported",
      summary: `Equipment ${eq.assetTag} marked ${eq.status.toUpperCase()}: ${params.reason}`,
    });

    notificationService.dispatchNotification({
      organizationId: session.activeOrganization.id,
      recipientUserId: "maintenance_lead",
      title: `Equipment Down: ${eq.assetTag}`,
      message: `${eq.name} went down (${params.category}): ${params.reason}`,
      link: `/maintenance?equipmentId=${eq.id}`,
    });

    return interval;
  }

  // 2. Resolve Downtime Interval
  resolveDowntime(
    session: SessionContext,
    intervalId: string,
    resolutionNotes: string
  ): DowntimeInterval {
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const interval = this.downtimeIntervals.get(intervalId);
    if (!interval || interval.organizationId !== session.activeOrganization.id) {
      throw new Error("Downtime interval not found.");
    }

    if (interval.resolvedAt) {
      throw new Error("Downtime interval has already been resolved.");
    }

    const now = new Date().toISOString();
    const startMs = new Date(interval.startedAt).getTime();
    const endMs = new Date(now).getTime();
    const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));

    interval.resolvedAt = now;
    interval.durationMinutes = durationMinutes;
    interval.resolvedByUserId = session.user.id;
    interval.resolvedByName = session.user.name;

    const eq = this.findEquipment(session, interval.equipmentId);
    eq.status = "operational";
    this.equipment.set(`${session.activeOrganization.id}:${eq.assetTag}`, eq);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: eq.id,
      action: "maintenance.downtime_resolved",
      summary: `Equipment ${eq.assetTag} restored to OPERATIONAL after ${durationMinutes} minutes. Notes: ${resolutionNotes}`,
    });

    this.downtimeIntervals.set(intervalId, interval);
    return interval;
  }

  // 3. Create Maintenance Work Order
  createWorkOrder(
    session: SessionContext,
    params: {
      equipmentId: string;
      type: MaintenanceWorkOrderType;
      priority: "standard" | "urgent" | "emergency";
      title: string;
      description: string;
      assignedTechnicianId?: string;
      assignedTechnicianName?: string;
    }
  ): MaintenanceWorkOrder {
    const eq = this.findEquipment(session, params.equipmentId);
    const id = `wo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const woNumber = `MNT-${new Date().getFullYear()}-${(this.workOrders.size + 1).toString().padStart(3, "0")}`;
    const now = new Date().toISOString();

    const wo: MaintenanceWorkOrder = {
      id,
      workOrderNumber: woNumber,
      organizationId: session.activeOrganization.id,
      equipmentId: eq.id,
      assetTag: eq.assetTag,
      type: params.type,
      status: "open",
      title: params.title.trim(),
      description: params.description.trim(),
      priority: params.priority,
      assignedTechnicianId: params.assignedTechnicianId,
      assignedTechnicianName: params.assignedTechnicianName,
      replacementPartsUsed: [],
      actualLaborMinutes: 0,
      createdAt: now,
    };

    this.workOrders.set(id, wo);
    return wo;
  }

  // 4. Authorize Return to Service
  authorizeReturnToService(
    session: SessionContext,
    workOrderId: string,
    params: {
      authorizedNotes: string;
      partsUsed?: MaintenancePartUsage[];
      laborMinutes?: number;
    }
  ): MaintenanceWorkOrder {
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const wo = this.workOrders.get(workOrderId);
    if (!wo || wo.organizationId !== session.activeOrganization.id) {
      throw new Error("Maintenance work order not found.");
    }

    const now = new Date().toISOString();
    wo.status = "closed_returned_to_service";
    wo.returnToServiceAuthorizedByUserId = session.user.id;
    wo.returnToServiceAuthorizedByName = session.user.name;
    wo.returnToServiceNotes = params.authorizedNotes.trim();
    if (params.partsUsed) wo.replacementPartsUsed = params.partsUsed;
    if (params.laborMinutes) wo.actualLaborMinutes = params.laborMinutes;
    wo.completedAt = now;

    // Restore equipment to operational
    const eq = this.findEquipment(session, wo.equipmentId);
    eq.status = "operational";
    eq.lastServiceDate = now.split("T")[0];
    this.equipment.set(`${session.activeOrganization.id}:${eq.assetTag}`, eq);

    this.workOrders.set(workOrderId, wo);
    return wo;
  }

  // 5. Fleet Metrics
  getMaintenanceMetrics(session: SessionContext): MaintenanceMetricsSummary {
    const orgEquipment = Array.from(this.equipment.values()).filter(
      (e) => e.organizationId === session.activeOrganization.id
    );
    const orgIntervals = Array.from(this.downtimeIntervals.values()).filter(
      (d) => d.organizationId === session.activeOrganization.id
    );

    const activeDowntimeEventsCount = orgIntervals.filter((d) => !d.resolvedAt).length;
    const resolvedIntervals = orgIntervals.filter((d) => d.durationMinutes !== undefined);
    const totalDowntimeMinutes = resolvedIntervals.reduce((acc, d) => acc + (d.durationMinutes || 0), 0);
    const mttr = resolvedIntervals.length > 0 ? Math.round(totalDowntimeMinutes / resolvedIntervals.length) : 45;

    const overduePMs = orgEquipment.filter((e) => {
      const due = new Date(e.nextScheduledPmDate).getTime();
      return due < Date.now();
    }).length;

    const operationalCount = orgEquipment.filter((e) => e.status === "operational").length;
    const uptimePercentage = orgEquipment.length > 0 ? Math.round((operationalCount / orgEquipment.length) * 1000) / 10 : 99.2;

    return {
      totalAssets: orgEquipment.length,
      operationalUptimePercentage: uptimePercentage,
      activeDowntimeEventsCount,
      overduePreventiveSchedulesCount: overduePMs,
      meanTimeToRepairMinutes: mttr,
    };
  }

  listEquipment(session: SessionContext): Equipment[] {
    return Array.from(this.equipment.values()).filter(
      (e) => e.organizationId === session.activeOrganization.id
    );
  }

  getEquipment(session: SessionContext, idOrTag: string): Equipment {
    return this.findEquipment(session, idOrTag);
  }

  listDowntimeIntervals(session: SessionContext, options?: { assetTag?: string }): DowntimeInterval[] {
    return Array.from(this.downtimeIntervals.values()).filter((d) => {
      if (d.organizationId !== session.activeOrganization.id) return false;
      if (options?.assetTag && d.assetTag !== options.assetTag) return false;
      return true;
    });
  }

  listDowntimes(session: SessionContext, options?: { assetTag?: string }): DowntimeInterval[] {
    return this.listDowntimeIntervals(session, options);
  }

  listWorkOrders(session: SessionContext, options?: { assetTag?: string }): MaintenanceWorkOrder[] {
    return Array.from(this.workOrders.values()).filter((w) => {
      if (w.organizationId !== session.activeOrganization.id) return false;
      if (options?.assetTag && w.assetTag !== options.assetTag) return false;
      return true;
    });
  }

  private findEquipment(session: SessionContext, idOrTag: string): Equipment {
    const eq = Array.from(this.equipment.values()).find(
      (e) => (e.id === idOrTag || e.assetTag === idOrTag) && e.organizationId === session.activeOrganization.id
    );
    if (!eq) {
      throw new Error(`Equipment asset '${idOrTag}' not found.`);
    }
    return eq;
  }
}

export const maintenanceService = new MaintenanceService();
