import {
  DigitalTraveler,
  TravelerOperation,
  WorkCenter,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";
import { notificationService } from "../../core/application/notification-service";

export class ShopfloorService {
  private travelers: Map<string, DigitalTraveler> = new Map();
  private workCenters: Map<string, WorkCenter> = new Map();

  constructor() {
    this.seedDefaultWorkCenters("org_default");
  }

  private seedDefaultWorkCenters(orgId: string) {
    const defaultCenters: Omit<WorkCenter, "organizationId">[] = [
      { id: "wc_1", code: "WC-LASER-01", name: "Mitsubishi 4kW Fiber Laser", type: "CNC Laser Cutting", status: "running", hourlyCostRate: 145.0 },
      { id: "wc_2", code: "WC-BRAKE-01", name: "Amada 150-Ton CNC Press Brake", type: "Sheet Metal Forming", status: "available", hourlyCostRate: 110.0 },
      { id: "wc_3", code: "WC-WELD-01", name: "TIG/MIG Precision Welding Bay", type: "Fabrication & Welding", status: "running", hourlyCostRate: 95.0 },
      { id: "wc_4", code: "WC-QC-01", name: "CMM Coordinate Inspection Station", type: "Quality Assurance", status: "available", hourlyCostRate: 85.0 },
      { id: "wc_5", code: "WC-PACK-01", name: "Crating & Packaging Line", type: "Shipping Prep", status: "available", hourlyCostRate: 65.0 },
    ];

    for (const wc of defaultCenters) {
      this.workCenters.set(`${orgId}:${wc.code}`, { ...wc, organizationId: orgId });
    }
  }

  // 1. Create Traveler
  createTraveler(
    session: SessionContext,
    params: {
      jobId: string;
      jobNumber: string;
      partDescription: string;
      customerName: string;
      totalQuantity: number;
      priority?: "standard" | "rush" | "critical";
      targetDueDate: string;
      operations: (Omit<
        TravelerOperation,
        "id" | "completedQuantity" | "scrappedQuantity" | "status" | "actualLaborMinutes" | "requiredQuantity"
      > & { requiredQuantity?: number })[];
    }
  ): DigitalTraveler {
    authorizationService.requireCapability(session, "shopfloor:reassign_job");

    const id = `trv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const travelerNumber = `TRV-${params.jobNumber.replace("JOB-", "")}`;
    const now = new Date().toISOString();

    const ops: TravelerOperation[] = params.operations.map((op, idx) => ({
      id: `op_${Date.now()}_${idx}`,
      sequence: op.sequence || (idx + 1) * 10,
      workCenterCode: op.workCenterCode,
      workCenterName: op.workCenterName,
      operationName: op.operationName,
      requiredQuantity: params.totalQuantity,
      completedQuantity: 0,
      scrappedQuantity: 0,
      status: idx === 0 ? "pending" : "pending",
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
      createdAt: now,
      updatedAt: now,
    };

    this.travelers.set(id, traveler);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: id,
      action: "traveler.dispatched",
      summary: `Dispatched digital traveler ${traveler.travelerNumber} (${traveler.partDescription}) with ${ops.length} operations.`,
    });

    return traveler;
  }

  // 2. Station Execution: Start Operation
  startOperation(
    session: SessionContext,
    travelerId: string,
    operationId: string
  ): DigitalTraveler {
    authorizationService.requireCapability(session, "shopfloor:execute_station");

    const traveler = this.travelers.get(travelerId);
    if (!traveler || traveler.organizationId !== session.activeOrganization.id) {
      throw new Error("Digital Traveler not found.");
    }

    const op = traveler.operations.find((o) => o.id === operationId);
    if (!op) throw new Error("Operation step not found.");

    if (op.status === "completed") {
      throw new Error("Operation step is already completed.");
    }

    const now = new Date().toISOString();
    op.status = "running";
    op.assignedOperatorId = session.user.id;
    op.assignedOperatorName = session.user.name;
    op.startedAt = op.startedAt || now;

    traveler.status = "active";
    traveler.version += 1;
    traveler.updatedAt = now;

    this.travelers.set(travelerId, traveler);
    return traveler;
  }

  // 3. Station Execution: Report Blocker
  reportBlocker(
    session: SessionContext,
    travelerId: string,
    operationId: string,
    reason: string
  ): DigitalTraveler {
    authorizationService.requireCapability(session, "shopfloor:execute_station");

    const traveler = this.travelers.get(travelerId);
    if (!traveler || traveler.organizationId !== session.activeOrganization.id) {
      throw new Error("Traveler not found.");
    }

    const op = traveler.operations.find((o) => o.id === operationId);
    if (!op) throw new Error("Operation not found.");

    op.status = "blocked";
    op.blockerReason = reason.trim();
    traveler.status = "on_hold";
    traveler.version += 1;
    traveler.updatedAt = new Date().toISOString();

    // Alert dispatch managers
    notificationService.dispatchNotification({
      organizationId: session.activeOrganization.id,
      recipientUserId: "manager_dispatch",
      title: `Blocker on ${traveler.travelerNumber}`,
      message: `Station ${op.workCenterCode} (${op.operationName}) reported blocker: "${reason}"`,
      link: `/shopfloor/traveler/${traveler.id}`,
    });

    this.travelers.set(travelerId, traveler);
    return traveler;
  }

  // 4. Station Execution: Complete Operation
  completeOperation(
    session: SessionContext,
    travelerId: string,
    operationId: string,
    params: { completedQuantity: number; scrappedQuantity?: number; laborMinutes?: number }
  ): DigitalTraveler {
    authorizationService.requireCapability(session, "shopfloor:execute_station");

    const traveler = this.travelers.get(travelerId);
    if (!traveler || traveler.organizationId !== session.activeOrganization.id) {
      throw new Error("Traveler not found.");
    }

    const opIndex = traveler.operations.findIndex((o) => o.id === operationId);
    if (opIndex === -1) throw new Error("Operation not found.");

    const op = traveler.operations[opIndex];
    const now = new Date().toISOString();

    op.completedQuantity = params.completedQuantity;
    op.scrappedQuantity = params.scrappedQuantity || 0;
    op.actualLaborMinutes += params.laborMinutes || 15;
    op.status = "completed";
    op.completedAt = now;

    // Advance currentStepIndex to next pending step if available
    const nextPending = traveler.operations.findIndex((o) => o.status !== "completed");
    if (nextPending !== -1) {
      traveler.currentStepIndex = nextPending;
    } else {
      traveler.status = "completed";
    }

    traveler.version += 1;
    traveler.updatedAt = now;

    this.travelers.set(travelerId, traveler);
    return traveler;
  }

  // 5. Lookups
  getTraveler(session: SessionContext, id: string): DigitalTraveler {
    const traveler = this.travelers.get(id);
    if (!traveler || traveler.organizationId !== session.activeOrganization.id) {
      throw new Error(`Traveler not found in active organization: ${id}`);
    }
    return traveler;
  }

  getTravelerByQr(session: SessionContext, qrOrNumber: string): DigitalTraveler {
    const clean = qrOrNumber.replace("yorkstead://traveler/", "").trim().toUpperCase();
    const traveler = Array.from(this.travelers.values()).find(
      (t) =>
        t.organizationId === session.activeOrganization.id &&
        (t.travelerNumber === clean || t.qrCodeData.includes(clean))
    );

    if (!traveler) {
      throw new Error(`No traveler found matching scan: ${clean}`);
    }

    return traveler;
  }

  listTravelers(session: SessionContext): DigitalTraveler[] {
    return Array.from(this.travelers.values()).filter(
      (t) => t.organizationId === session.activeOrganization.id
    );
  }
}

export const shopfloorService = new ShopfloorService();
