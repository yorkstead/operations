import { eq, and, desc, asc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  shopfloorTravelers,
  travelerOperations,
  travelerBlockers,
  auditEvents,
} from "@/db/schema";
import {
  DigitalTraveler,
  TravelerOperation,
  OperationStatus,
} from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";

export interface CreateTravelerParams {
  jobId: string;
  jobNumber: string;
  partDescription: string;
  customerName: string;
  totalQuantity: number;
  priority?: "standard" | "rush" | "critical";
  targetDueDate: string;
  operations: {
    sequence: number;
    workCenterCode: string;
    workCenterName: string;
    operationName: string;
    requiredQuantity?: number;
  }[];
}

export class ShopfloorRepository {
  async createTraveler(session: SessionContext, params: CreateTravelerParams): Promise<DigitalTraveler> {
    const db = getDb();
    const id = `trv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const travelerNumber = `TRV-${params.jobNumber.replace("JOB-", "")}`;
    const now = new Date();

    const ops: TravelerOperation[] = params.operations.map((op, idx) => ({
      id: `op_${Date.now()}_${idx}`,
      sequence: op.sequence || (idx + 1) * 10,
      workCenterCode: op.workCenterCode,
      workCenterName: op.workCenterName,
      operationName: op.operationName,
      requiredQuantity: op.requiredQuantity || params.totalQuantity,
      completedQuantity: 0,
      scrappedQuantity: 0,
      status: "pending",
      actualLaborMinutes: 0,
    }));

    const traveler: DigitalTraveler = {
      id,
      organizationId: session.activeOrganization.id,
      travelerNumber,
      qrCodeData: `yorkstead://traveler/${travelerNumber}`,
      jobId: params.jobId,
      jobNumber: params.jobNumber,
      partDescription: params.partDescription.trim(),
      customerName: params.customerName.trim(),
      totalQuantity: params.totalQuantity,
      operations: ops,
      currentStepIndex: 0,
      status: "queued",
      priority: params.priority || "standard",
      targetDueDate: params.targetDueDate,
      version: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await db.insert(shopfloorTravelers).values({
      id: traveler.id,
      organizationId: traveler.organizationId,
      travelerNumber: traveler.travelerNumber,
      qrCodeData: traveler.qrCodeData,
      jobId: traveler.jobId,
      jobNumber: traveler.jobNumber,
      partDescription: traveler.partDescription,
      customerName: traveler.customerName,
      totalQuantity: traveler.totalQuantity,
      currentStepIndex: 0,
      status: traveler.status,
      priority: traveler.priority,
      targetDueDate: traveler.targetDueDate,
      version: 1,
    });

    for (const op of ops) {
      await db.insert(travelerOperations).values({
        id: op.id,
        travelerId: traveler.id,
        organizationId: traveler.organizationId,
        sequence: op.sequence,
        workCenterCode: op.workCenterCode,
        workCenterName: op.workCenterName,
        operationName: op.operationName,
        requiredQuantity: op.requiredQuantity,
        completedQuantity: 0,
        scrappedQuantity: 0,
        status: "pending",
        actualLaborMinutes: 0,
      });
    }

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: traveler.id,
      action: "traveler.dispatched",
      summary: `Dispatched digital traveler ${traveler.travelerNumber} (${traveler.partDescription}) with ${ops.length} operations.`,
      metadata: {
        travelerNumber: traveler.travelerNumber,
        jobNumber: traveler.jobNumber,
        operationCount: ops.length,
      },
    });

    return traveler;
  }

  async getTraveler(session: SessionContext, travelerId: string): Promise<DigitalTraveler | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shopfloorTravelers)
      .where(and(eq(shopfloorTravelers.id, travelerId), eq(shopfloorTravelers.organizationId, session.activeOrganization.id)))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];

    const opRows = await db
      .select()
      .from(travelerOperations)
      .where(and(eq(travelerOperations.travelerId, travelerId), eq(travelerOperations.organizationId, session.activeOrganization.id)))
      .orderBy(asc(travelerOperations.sequence));

    return {
      id: row.id,
      organizationId: row.organizationId,
      travelerNumber: row.travelerNumber,
      qrCodeData: row.qrCodeData,
      jobId: row.jobId,
      jobNumber: row.jobNumber,
      partDescription: row.partDescription,
      customerName: row.customerName,
      totalQuantity: row.totalQuantity,
      currentStepIndex: row.currentStepIndex,
      status: row.status as "queued" | "active" | "completed" | "on_hold",
      priority: row.priority as "standard" | "rush" | "critical",
      targetDueDate: row.targetDueDate,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      operations: opRows.map((o) => ({
        id: o.id,
        sequence: o.sequence,
        workCenterCode: o.workCenterCode,
        workCenterName: o.workCenterName,
        operationName: o.operationName,
        requiredQuantity: o.requiredQuantity,
        completedQuantity: o.completedQuantity,
        scrappedQuantity: o.scrappedQuantity,
        status: o.status as OperationStatus,
        assignedOperatorId: o.assignedOperatorId ?? undefined,
        assignedOperatorName: o.assignedOperatorName ?? undefined,
        blockerReason: o.blockerReason ?? undefined,
        startedAt: o.startedAt ? o.startedAt.toISOString() : undefined,
        completedAt: o.completedAt ? o.completedAt.toISOString() : undefined,
        actualLaborMinutes: o.actualLaborMinutes,
      })),
    };
  }

  async listTravelers(session: SessionContext): Promise<DigitalTraveler[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shopfloorTravelers)
      .where(eq(shopfloorTravelers.organizationId, session.activeOrganization.id))
      .orderBy(desc(shopfloorTravelers.createdAt));

    const result: DigitalTraveler[] = [];
    for (const row of rows) {
      const opRows = await db
        .select()
        .from(travelerOperations)
        .where(and(eq(travelerOperations.travelerId, row.id), eq(travelerOperations.organizationId, session.activeOrganization.id)))
        .orderBy(asc(travelerOperations.sequence));

      result.push({
        id: row.id,
        organizationId: row.organizationId,
        travelerNumber: row.travelerNumber,
        qrCodeData: row.qrCodeData,
        jobId: row.jobId,
        jobNumber: row.jobNumber,
        partDescription: row.partDescription,
        customerName: row.customerName,
        totalQuantity: row.totalQuantity,
        currentStepIndex: row.currentStepIndex,
        status: row.status as "queued" | "active" | "completed" | "on_hold",
        priority: row.priority as "standard" | "rush" | "critical",
        targetDueDate: row.targetDueDate,
        version: row.version,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        operations: opRows.map((o) => ({
          id: o.id,
          sequence: o.sequence,
          workCenterCode: o.workCenterCode,
          workCenterName: o.workCenterName,
          operationName: o.operationName,
          requiredQuantity: o.requiredQuantity,
          completedQuantity: o.completedQuantity,
          scrappedQuantity: o.scrappedQuantity,
          status: o.status as OperationStatus,
          assignedOperatorId: o.assignedOperatorId ?? undefined,
          assignedOperatorName: o.assignedOperatorName ?? undefined,
          blockerReason: o.blockerReason ?? undefined,
          startedAt: o.startedAt ? o.startedAt.toISOString() : undefined,
          completedAt: o.completedAt ? o.completedAt.toISOString() : undefined,
          actualLaborMinutes: o.actualLaborMinutes,
        })),
      });
    }

    return result;
  }

  async startOperation(session: SessionContext, travelerId: string, operationId: string): Promise<DigitalTraveler> {
    const db = getDb();
    const existing = await this.getTraveler(session, travelerId);
    if (!existing) throw new Error("Digital Traveler not found.");

    const op = existing.operations.find((o) => o.id === operationId);
    if (!op) throw new Error("Operation step not found.");
    if (op.status === "completed") throw new Error("Operation step is already completed.");

    const now = new Date();
    await db
      .update(travelerOperations)
      .set({
        status: "running",
        assignedOperatorId: session.user.id,
        assignedOperatorName: session.user.name,
        startedAt: now,
        updatedAt: now,
      })
      .where(and(eq(travelerOperations.id, operationId), eq(travelerOperations.organizationId, session.activeOrganization.id)));

    const newVersion = existing.version + 1;
    await db
      .update(shopfloorTravelers)
      .set({
        status: "active",
        version: newVersion,
        updatedAt: now,
      })
      .where(and(eq(shopfloorTravelers.id, travelerId), eq(shopfloorTravelers.organizationId, session.activeOrganization.id)));

    return (await this.getTraveler(session, travelerId))!;
  }

  async reportBlocker(session: SessionContext, travelerId: string, operationId: string, reason: string): Promise<DigitalTraveler> {
    const db = getDb();
    const existing = await this.getTraveler(session, travelerId);
    if (!existing) throw new Error("Traveler not found.");

    const op = existing.operations.find((o) => o.id === operationId);
    if (!op) throw new Error("Operation not found.");

    const now = new Date();
    await db
      .update(travelerOperations)
      .set({
        status: "blocked",
        blockerReason: reason.trim(),
        updatedAt: now,
      })
      .where(and(eq(travelerOperations.id, operationId), eq(travelerOperations.organizationId, session.activeOrganization.id)));

    const blockerId = `blk_${Date.now()}`;
    await db.insert(travelerBlockers).values({
      id: blockerId,
      travelerId,
      operationId,
      organizationId: session.activeOrganization.id,
      reportedByUserId: session.user.id,
      reportedByName: session.user.name,
      reason: reason.trim(),
      status: "active",
    });

    const newVersion = existing.version + 1;
    await db
      .update(shopfloorTravelers)
      .set({
        status: "on_hold",
        version: newVersion,
        updatedAt: now,
      })
      .where(and(eq(shopfloorTravelers.id, travelerId), eq(shopfloorTravelers.organizationId, session.activeOrganization.id)));

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: travelerId,
      action: "traveler.blocked",
      summary: `Blocker reported on ${existing.travelerNumber} station ${op.workCenterCode}: "${reason}".`,
      metadata: { blockerReason: reason, operationId },
    });

    return (await this.getTraveler(session, travelerId))!;
  }

  async completeOperation(
    session: SessionContext,
    travelerId: string,
    operationId: string,
    params: { completedQuantity: number; scrappedQuantity?: number; laborMinutes?: number }
  ): Promise<DigitalTraveler> {
    const db = getDb();
    const existing = await this.getTraveler(session, travelerId);
    if (!existing) throw new Error("Traveler not found.");

    const opIndex = existing.operations.findIndex((o) => o.id === operationId);
    if (opIndex === -1) throw new Error("Operation not found.");

    const op = existing.operations[opIndex];
    const now = new Date();
    const newLabor = op.actualLaborMinutes + (params.laborMinutes || 15);

    await db
      .update(travelerOperations)
      .set({
        status: "completed",
        completedQuantity: params.completedQuantity,
        scrappedQuantity: params.scrappedQuantity || 0,
        actualLaborMinutes: newLabor,
        completedAt: now,
        updatedAt: now,
      })
      .where(and(eq(travelerOperations.id, operationId), eq(travelerOperations.organizationId, session.activeOrganization.id)));

    const nextPending = existing.operations.findIndex((o, idx) => idx !== opIndex && o.status !== "completed");
    const travelerStatus = nextPending === -1 ? "completed" : "active";
    const nextStepIndex = nextPending === -1 ? existing.operations.length - 1 : nextPending;
    const newVersion = existing.version + 1;

    await db
      .update(shopfloorTravelers)
      .set({
        currentStepIndex: nextStepIndex,
        status: travelerStatus,
        version: newVersion,
        updatedAt: now,
      })
      .where(and(eq(shopfloorTravelers.id, travelerId), eq(shopfloorTravelers.organizationId, session.activeOrganization.id)));

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: travelerId,
      action: "operation.completed",
      summary: `Completed operation ${op.sequence} (${op.operationName}) on traveler ${existing.travelerNumber}. Qty: ${params.completedQuantity}.`,
      metadata: {
        operationId,
        completedQuantity: params.completedQuantity,
        scrappedQuantity: params.scrappedQuantity || 0,
      },
    });

    return (await this.getTraveler(session, travelerId))!;
  }
}

export const shopfloorRepository = new ShopfloorRepository();
