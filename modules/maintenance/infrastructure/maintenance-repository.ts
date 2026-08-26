import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  equipmentAssets,
  maintenanceDowntimeIntervals,
  maintenanceWorkOrders,
  auditEvents,
} from "@/db/schema";
import {
  Equipment,
  DowntimeInterval,
  MaintenanceWorkOrder,
  MaintenanceMetricsSummary,
  DowntimeCategory,
  MaintenanceWorkOrderType,
  MaintenanceWorkOrderStatus,
  EquipmentCriticality,
  EquipmentStatus,
  MaintenancePartUsage,
} from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";

export class MaintenanceRepository {
  // Seed Default Equipment for new tenants
  async ensureSeededEquipment(session: SessionContext): Promise<void> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const existing = await db
      .select({ id: equipmentAssets.id })
      .from(equipmentAssets)
      .where(eq(equipmentAssets.organizationId, orgId))
      .limit(1);

    if (existing.length > 0) return;

    const defaults: Array<Omit<Equipment, "organizationId">> = [
      {
        id: `eq_${Date.now()}_laser`,
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
        id: `eq_${Date.now()}_brake`,
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
        id: `eq_${Date.now()}_compr`,
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
        nextScheduledPmDate: "2026-08-20", // overdue
        totalRunHours: 8940,
      },
    ];

    for (const d of defaults) {
      await db.insert(equipmentAssets).values({
        id: d.id,
        organizationId: orgId,
        assetTag: d.assetTag,
        name: d.name,
        manufacturer: d.manufacturer,
        modelNumber: d.modelNumber,
        serialNumber: d.serialNumber,
        workCenterCode: d.workCenterCode,
        locationCode: d.locationCode,
        criticality: d.criticality,
        status: d.status,
        qrCodeData: d.qrCodeData,
        lastServiceDate: d.lastServiceDate,
        nextScheduledPmDate: d.nextScheduledPmDate,
        totalRunHours: d.totalRunHours,
      });
    }
  }

  // 1. List Equipment Assets
  async listEquipment(
    session: SessionContext,
    options?: { status?: string; workCenterCode?: string }
  ): Promise<Equipment[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    let query = db
      .select()
      .from(equipmentAssets)
      .where(eq(equipmentAssets.organizationId, orgId))
      .orderBy(equipmentAssets.assetTag);

    if (options?.status) {
      query = db
        .select()
        .from(equipmentAssets)
        .where(
          and(
            eq(equipmentAssets.organizationId, orgId),
            eq(equipmentAssets.status, options.status)
          )
        )
        .orderBy(equipmentAssets.assetTag);
    }

    const rows = await query;
    return rows.map((r: typeof equipmentAssets.$inferSelect) => this.mapEquipment(r));
  }

  // 2. Create Equipment Asset
  async createEquipment(
    session: SessionContext,
    params: {
      assetTag: string;
      name: string;
      manufacturer: string;
      modelNumber: string;
      serialNumber: string;
      workCenterCode: string;
      locationCode: string;
      criticality: EquipmentCriticality;
      lastServiceDate?: string;
      nextScheduledPmDate?: string;
    }
  ): Promise<Equipment> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const id = `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const tag = params.assetTag.trim().toUpperCase();

    const [row] = await db
      .insert(equipmentAssets)
      .values({
        id,
        organizationId: orgId,
        assetTag: tag,
        name: params.name.trim(),
        manufacturer: params.manufacturer.trim(),
        modelNumber: params.modelNumber.trim(),
        serialNumber: params.serialNumber.trim(),
        workCenterCode: params.workCenterCode.trim().toUpperCase(),
        locationCode: params.locationCode.trim().toUpperCase(),
        criticality: params.criticality,
        status: "operational",
        qrCodeData: `yorkstead://equipment/${tag}`,
        lastServiceDate: params.lastServiceDate || new Date().toISOString().split("T")[0],
        nextScheduledPmDate: params.nextScheduledPmDate || new Date().toISOString().split("T")[0],
        totalRunHours: 0,
      })
      .returning();

    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "equipment",
      entityId: row.id,
      action: "maintenance.equipment_created",
      summary: `Registered equipment asset ${tag} (${params.name})`,
      metadata: { assetTag: tag, workCenterCode: params.workCenterCode },
    });

    return this.mapEquipment(row);
  }

  // 3. Report Downtime with Non-Overlapping Guardrail & Auto Emergency WO
  async reportDowntime(
    session: SessionContext,
    params: {
      equipmentId: string;
      category: DowntimeCategory;
      reason: string;
      impactSummary: string;
    }
  ): Promise<DowntimeInterval> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      // Find and lock equipment row
      const eqRows = await tx
        .select()
        .from(equipmentAssets)
        .where(
          and(
            eq(equipmentAssets.organizationId, orgId),
            eq(equipmentAssets.id, params.equipmentId)
          )
        )
        .for("update");

      const eqTarget = eqRows.length > 0
        ? eqRows[0]
        : (
            await tx
              .select()
              .from(equipmentAssets)
              .where(
                and(
                  eq(equipmentAssets.organizationId, orgId),
                  eq(equipmentAssets.assetTag, params.equipmentId)
                )
              )
              .for("update")
          )[0];

      if (!eqTarget) {
        throw new Error(`Equipment '${params.equipmentId}' not found in active organization.`);
      }

      // Check for active unresolved downtime interval
      const openIntervals = await tx
        .select()
        .from(maintenanceDowntimeIntervals)
        .where(
          and(
            eq(maintenanceDowntimeIntervals.organizationId, orgId),
            eq(maintenanceDowntimeIntervals.equipmentId, eqTarget.id),
            sql`${maintenanceDowntimeIntervals.resolvedAt} IS NULL`
          )
        )
        .limit(1);

      if (openIntervals.length > 0) {
        throw new Error(`Equipment ${eqTarget.assetTag} already has an active unresolved downtime interval.`);
      }

      const downtimeId = `dt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date();
      let workOrderId: string | undefined = undefined;

      // If breakdown, create emergency work order
      if (params.category === "unplanned_breakdown" || params.category === "tooling_failure") {
        const countRes = await tx
          .select({ count: sql<number>`count(*)` })
          .from(maintenanceWorkOrders)
          .where(eq(maintenanceWorkOrders.organizationId, orgId));

        const count = Number(countRes[0]?.count || 0) + 1;
        const woNumber = `MNT-${now.getFullYear()}-${count.toString().padStart(3, "0")}`;
        const woId = `wo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        await tx.insert(maintenanceWorkOrders).values({
          id: woId,
          organizationId: orgId,
          workOrderNumber: woNumber,
          equipmentId: eqTarget.id,
          assetTag: eqTarget.assetTag,
          type: "corrective_emergency",
          status: "open",
          title: `Emergency Repair: ${eqTarget.assetTag} - ${params.reason.trim()}`,
          description: `Unplanned downtime reported by ${session.user.name}: "${params.reason}". Impact: ${params.impactSummary}`,
          priority: "emergency",
          replacementPartsUsed: [],
          actualLaborMinutes: 0,
        });

        workOrderId = woId;
      }

      const [interval] = await tx
        .insert(maintenanceDowntimeIntervals)
        .values({
          id: downtimeId,
          organizationId: orgId,
          equipmentId: eqTarget.id,
          assetTag: eqTarget.assetTag,
          category: params.category,
          reason: params.reason.trim(),
          impactSummary: params.impactSummary.trim(),
          startedAt: now,
          reportedByUserId: session.user.id,
          reportedByName: session.user.name,
          workOrderId: workOrderId || null,
        })
        .returning();

      // Update equipment asset status
      const newStatus = params.category === "planned_preventive" ? "down_planned_pm" : "down_unplanned";
      await tx
        .update(equipmentAssets)
        .set({ status: newStatus, updatedAt: now })
        .where(eq(equipmentAssets.id, eqTarget.id));

      // Audit Log
      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "equipment",
        entityId: eqTarget.id,
        action: "maintenance.downtime_reported",
        summary: `Equipment ${eqTarget.assetTag} marked ${newStatus.toUpperCase()}: ${params.reason}`,
        metadata: { assetTag: eqTarget.assetTag, category: params.category, reason: params.reason },
      });

      return this.mapDowntime(interval);
    });
  }

  // 4. Resolve Downtime Interval
  async resolveDowntime(
    session: SessionContext,
    intervalId: string,
    resolutionNotes: string
  ): Promise<DowntimeInterval> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(maintenanceDowntimeIntervals)
        .where(
          and(
            eq(maintenanceDowntimeIntervals.organizationId, orgId),
            eq(maintenanceDowntimeIntervals.id, intervalId)
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Downtime interval '${intervalId}' not found.`);
      }

      const existing = rows[0];
      if (existing.resolvedAt) {
        throw new Error("Downtime interval has already been resolved.");
      }

      const now = new Date();
      const startMs = existing.startedAt.getTime();
      const durationMinutes = Math.max(1, Math.round((now.getTime() - startMs) / (1000 * 60)));

      const [updated] = await tx
        .update(maintenanceDowntimeIntervals)
        .set({
          resolvedAt: now,
          durationMinutes,
          resolvedByUserId: session.user.id,
          resolvedByName: session.user.name,
        })
        .where(eq(maintenanceDowntimeIntervals.id, intervalId))
        .returning();

      // Restore equipment status to operational
      await tx
        .update(equipmentAssets)
        .set({ status: "operational", updatedAt: now })
        .where(eq(equipmentAssets.id, existing.equipmentId));

      // Audit Log
      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "equipment",
        entityId: existing.equipmentId,
        action: "maintenance.downtime_resolved",
        summary: `Equipment ${existing.assetTag} restored to OPERATIONAL after ${durationMinutes} minutes (${resolutionNotes})`,
        metadata: { assetTag: existing.assetTag, durationMinutes },
      });

      return this.mapDowntime(updated);
    });
  }

  // 5. Create Maintenance Work Order
  async createWorkOrder(
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
  ): Promise<MaintenanceWorkOrder> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const eqRows = await tx
        .select()
        .from(equipmentAssets)
        .where(
          and(
            eq(equipmentAssets.organizationId, orgId),
            eq(equipmentAssets.id, params.equipmentId)
          )
        );

      const eqTarget = eqRows.length > 0
        ? eqRows[0]
        : (
            await tx
              .select()
              .from(equipmentAssets)
              .where(
                and(
                  eq(equipmentAssets.organizationId, orgId),
                  eq(equipmentAssets.assetTag, params.equipmentId)
                )
              )
          )[0];

      if (!eqTarget) {
        throw new Error(`Equipment '${params.equipmentId}' not found.`);
      }

      const countRes = await tx
        .select({ count: sql<number>`count(*)` })
        .from(maintenanceWorkOrders)
        .where(eq(maintenanceWorkOrders.organizationId, orgId));

      const count = Number(countRes[0]?.count || 0) + 1;
      const woNumber = `MNT-${new Date().getFullYear()}-${count.toString().padStart(3, "0")}`;
      const id = `wo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const [wo] = await tx
        .insert(maintenanceWorkOrders)
        .values({
          id,
          organizationId: orgId,
          workOrderNumber: woNumber,
          equipmentId: eqTarget.id,
          assetTag: eqTarget.assetTag,
          type: params.type,
          status: "open",
          title: params.title.trim(),
          description: params.description.trim(),
          priority: params.priority,
          assignedTechnicianId: params.assignedTechnicianId || null,
          assignedTechnicianName: params.assignedTechnicianName || null,
          replacementPartsUsed: [],
          actualLaborMinutes: 0,
        })
        .returning();

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "maintenance_work_order",
        entityId: wo.id,
        action: "maintenance.work_order_created",
        summary: `Created ${params.type.toUpperCase()} work order ${woNumber} for ${eqTarget.assetTag}`,
        metadata: { workOrderNumber: woNumber, assetTag: eqTarget.assetTag },
      });

      return this.mapWorkOrder(wo);
    });
  }

  // 6. Authorize Return to Service
  async authorizeReturnToService(
    session: SessionContext,
    workOrderId: string,
    params: {
      authorizedNotes: string;
      partsUsed?: MaintenancePartUsage[];
      laborMinutes?: number;
    }
  ): Promise<MaintenanceWorkOrder> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(maintenanceWorkOrders)
        .where(
          and(
            eq(maintenanceWorkOrders.organizationId, orgId),
            eq(maintenanceWorkOrders.id, workOrderId)
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Maintenance work order '${workOrderId}' not found.`);
      }

      const wo = rows[0];
      const now = new Date();

      const [updated] = await tx
        .update(maintenanceWorkOrders)
        .set({
          status: "closed_returned_to_service",
          returnToServiceAuthorizedByUserId: session.user.id,
          returnToServiceAuthorizedByName: session.user.name,
          returnToServiceNotes: params.authorizedNotes.trim(),
          replacementPartsUsed: params.partsUsed || wo.replacementPartsUsed,
          actualLaborMinutes: params.laborMinutes !== undefined ? params.laborMinutes : wo.actualLaborMinutes,
          completedAt: now,
          updatedAt: now,
        })
        .where(eq(maintenanceWorkOrders.id, workOrderId))
        .returning();

      // Restore equipment to operational and update service date
      await tx
        .update(equipmentAssets)
        .set({
          status: "operational",
          lastServiceDate: now.toISOString().split("T")[0],
          updatedAt: now,
        })
        .where(eq(equipmentAssets.id, wo.equipmentId));

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "maintenance_work_order",
        entityId: workOrderId,
        action: "maintenance.return_to_service_authorized",
        summary: `Authorized return to service for ${wo.assetTag} on ${wo.workOrderNumber}`,
        metadata: { workOrderNumber: wo.workOrderNumber, assetTag: wo.assetTag },
      });

      return this.mapWorkOrder(updated);
    });
  }

  // 7. Maintenance Metrics Summary
  async getMetrics(session: SessionContext): Promise<MaintenanceMetricsSummary> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const eqRows = await db
      .select()
      .from(equipmentAssets)
      .where(eq(equipmentAssets.organizationId, orgId));

    const totalAssets = eqRows.length;
    const operational = eqRows.filter((e) => e.status === "operational").length;
    const uptime = totalAssets > 0 ? (operational / totalAssets) * 100 : 99.2;

    const overduePMs = eqRows.filter((e) => {
      const due = new Date(e.nextScheduledPmDate).getTime();
      return due < Date.now();
    }).length;

    const intervalRows = await db
      .select()
      .from(maintenanceDowntimeIntervals)
      .where(eq(maintenanceDowntimeIntervals.organizationId, orgId));

    const activeDowntimeEventsCount = intervalRows.filter((i) => !i.resolvedAt).length;
    const resolvedIntervals = intervalRows.filter((i) => i.durationMinutes !== null && i.durationMinutes !== undefined);
    const totalDowntimeMinutes = resolvedIntervals.reduce((acc, i) => acc + (i.durationMinutes || 0), 0);
    const mttr = resolvedIntervals.length > 0 ? Math.round(totalDowntimeMinutes / resolvedIntervals.length) : 45;

    return {
      totalAssets,
      operationalUptimePercentage: Math.round(uptime * 10) / 10,
      activeDowntimeEventsCount,
      overduePreventiveSchedulesCount: overduePMs,
      meanTimeToRepairMinutes: mttr,
    };
  }

  async listDowntime(session: SessionContext): Promise<DowntimeInterval[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(maintenanceDowntimeIntervals)
      .where(eq(maintenanceDowntimeIntervals.organizationId, orgId))
      .orderBy(desc(maintenanceDowntimeIntervals.startedAt));

    return rows.map((r: typeof maintenanceDowntimeIntervals.$inferSelect) => this.mapDowntime(r));
  }

  async listWorkOrders(session: SessionContext): Promise<MaintenanceWorkOrder[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(maintenanceWorkOrders)
      .where(eq(maintenanceWorkOrders.organizationId, orgId))
      .orderBy(desc(maintenanceWorkOrders.createdAt));

    return rows.map((r: typeof maintenanceWorkOrders.$inferSelect) => this.mapWorkOrder(r));
  }

  private mapEquipment(row: typeof equipmentAssets.$inferSelect): Equipment {
    return {
      id: row.id,
      organizationId: row.organizationId,
      assetTag: row.assetTag,
      name: row.name,
      manufacturer: row.manufacturer,
      modelNumber: row.modelNumber,
      serialNumber: row.serialNumber,
      workCenterCode: row.workCenterCode,
      locationCode: row.locationCode,
      criticality: row.criticality as EquipmentCriticality,
      status: row.status as EquipmentStatus,
      qrCodeData: row.qrCodeData,
      lastServiceDate: row.lastServiceDate,
      nextScheduledPmDate: row.nextScheduledPmDate,
      totalRunHours: row.totalRunHours,
    };
  }

  private mapDowntime(row: typeof maintenanceDowntimeIntervals.$inferSelect): DowntimeInterval {
    return {
      id: row.id,
      organizationId: row.organizationId,
      equipmentId: row.equipmentId,
      assetTag: row.assetTag,
      category: row.category as DowntimeCategory,
      reason: row.reason,
      impactSummary: row.impactSummary,
      startedAt: row.startedAt.toISOString(),
      resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : undefined,
      durationMinutes: row.durationMinutes || undefined,
      reportedByUserId: row.reportedByUserId,
      reportedByName: row.reportedByName,
      resolvedByUserId: row.resolvedByUserId || undefined,
      resolvedByName: row.resolvedByName || undefined,
      workOrderId: row.workOrderId || undefined,
    };
  }

  private mapWorkOrder(row: typeof maintenanceWorkOrders.$inferSelect): MaintenanceWorkOrder {
    return {
      id: row.id,
      workOrderNumber: row.workOrderNumber,
      organizationId: row.organizationId,
      equipmentId: row.equipmentId,
      assetTag: row.assetTag,
      type: row.type as MaintenanceWorkOrderType,
      status: row.status as MaintenanceWorkOrderStatus,
      title: row.title,
      description: row.description,
      priority: row.priority as "standard" | "urgent" | "emergency",
      assignedTechnicianId: row.assignedTechnicianId || undefined,
      assignedTechnicianName: row.assignedTechnicianName || undefined,
      replacementPartsUsed: (row.replacementPartsUsed || []) as MaintenancePartUsage[],
      actualLaborMinutes: row.actualLaborMinutes,
      returnToServiceAuthorizedByUserId: row.returnToServiceAuthorizedByUserId || undefined,
      returnToServiceAuthorizedByName: row.returnToServiceAuthorizedByName || undefined,
      returnToServiceNotes: row.returnToServiceNotes || undefined,
      completedAt: row.completedAt ? row.completedAt.toISOString() : undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

export const maintenanceRepository = new MaintenanceRepository();
