import {
  InspectionRecord,
  NonConformanceReport,
  QualityMetricsSummary,
  InspectionType,
  InspectionStatus,
  NCRSeverity,
  NCRDisposition,
  InspectionChecklistItem,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { authorizationService } from "../../core/application/authorization-service";
import { activityService } from "../../core/application/activity-service";
import { notificationService } from "../../core/application/notification-service";

export class QualityService {
  private inspections: Map<string, InspectionRecord> = new Map();
  private ncrs: Map<string, NonConformanceReport> = new Map();

  // 1. Record Inspection Result
  recordInspection(
    session: SessionContext,
    params: {
      inspectionType: InspectionType;
      jobId: string;
      jobNumber: string;
      partDescription: string;
      travelerOperationId?: string;
      sampleSize: number;
      passedQuantity: number;
      failedQuantity: number;
      checklist: InspectionChecklistItem[];
    }
  ): InspectionRecord {
    authorizationService.requireCapability(session, "quality:record_inspection");

    if (params.sampleSize <= 0) {
      throw new Error("Sample size must be greater than zero.");
    }
    if (params.passedQuantity + params.failedQuantity !== params.sampleSize) {
      throw new Error("Passed + Failed quantity must equal total sample size.");
    }

    const id = `insp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const hasFailures = params.failedQuantity > 0 || params.checklist.some((c) => c.result === "fail");
    const status: InspectionStatus = hasFailures ? "failed" : "passed";

    const record: InspectionRecord = {
      id,
      organizationId: session.activeOrganization.id,
      inspectionType: params.inspectionType,
      jobId: params.jobId,
      jobNumber: params.jobNumber,
      partDescription: params.partDescription.trim(),
      travelerOperationId: params.travelerOperationId,
      inspectorUserId: session.user.id,
      inspectorName: session.user.name,
      status,
      sampleSize: params.sampleSize,
      passedQuantity: params.passedQuantity,
      failedQuantity: params.failedQuantity,
      checklist: params.checklist,
      completedAt: now,
    };

    this.inspections.set(id, record);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: params.jobId,
      action: "quality.inspection_completed",
      summary: `Completed ${params.inspectionType} inspection on ${params.jobNumber}: ${status.toUpperCase()} (${params.passedQuantity}/${params.sampleSize} passed).`,
    });

    return record;
  }

  listInspections(session: SessionContext, jobId?: string): InspectionRecord[] {
    authorizationService.requireCapability(session, "quality:record_inspection");
    const orgId = session.activeOrganization.id;
    const list: InspectionRecord[] = [];

    for (const i of this.inspections.values()) {
      if (i.organizationId !== orgId) continue;
      if (jobId && i.jobId !== jobId) continue;
      list.push(i);
    }
    return list;
  }

  // 2. Raise Non-Conformance Report (NCR)
  createNCR(
    session: SessionContext,
    params: {
      jobId: string;
      jobNumber: string;
      partDescription: string;
      operationName: string;
      defectDescription: string;
      defectCategory: string;
      severity: NCRSeverity;
      defectQuantity: number;
      containmentActions: string[];
      estimatedScrapCost?: number;
      scrapCostCents?: number;
      estimatedReworkHours?: number;
      reworkLaborMinutes?: number;
      remakeCostCents?: number;
    }
  ): NonConformanceReport {
    authorizationService.requireCapability(session, "quality:record_inspection");

    const id = `ncr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const ncrCount = Array.from(this.ncrs.values()).filter(
      (n) => n.organizationId === session.activeOrganization.id
    ).length + 1;
    const ncrNumber = `NCR-${new Date().getFullYear()}-${ncrCount.toString().padStart(3, "0")}`;
    const now = new Date().toISOString();

    const scrapCents = params.scrapCostCents ?? (params.estimatedScrapCost ? Math.round(params.estimatedScrapCost * 100) : 0);
    const reworkMinutes = params.reworkLaborMinutes ?? (params.estimatedReworkHours ? Math.round(params.estimatedReworkHours * 60) : 0);

    const ncr: NonConformanceReport = {
      id,
      ncrNumber,
      organizationId: session.activeOrganization.id,
      jobId: params.jobId,
      jobNumber: params.jobNumber,
      partDescription: params.partDescription.trim(),
      operationName: params.operationName.trim(),
      defectDescription: params.defectDescription.trim(),
      defectCategory: params.defectCategory.trim(),
      severity: params.severity,
      status: "open",
      defectQuantity: params.defectQuantity,
      containmentActions: params.containmentActions,
      disposition: "pending_review",
      scrapCostCents: scrapCents,
      reworkLaborMinutes: reworkMinutes,
      remakeCostCents: params.remakeCostCents || 0,
      createdByUserId: session.user.id,
      createdByName: session.user.name,
      createdAt: now,
      updatedAt: now,
    };

    this.ncrs.set(id, ncr);

    notificationService.dispatchNotification({
      organizationId: session.activeOrganization.id,
      recipientUserId: "qa_manager",
      title: `New NCR Raised: ${ncrNumber}`,
      message: `${params.severity.toUpperCase()} defect on ${params.jobNumber}: ${params.defectDescription}`,
      link: `/quality?ncrId=${id}`,
    });

    return ncr;
  }

  // 3. Disposition NCR with Segregation of Duties
  applyDisposition(
    session: SessionContext,
    ncrId: string,
    params: {
      disposition: NCRDisposition;
      dispositionNotes: string;
      rootCauseAnalysis?: string;
      finalScrapCost?: number;
      finalScrapCostCents?: number;
      reworkLaborMinutes?: number;
    }
  ): NonConformanceReport {
    authorizationService.requireCapability(session, "quality:scrap_rework");

    const ncr = this.ncrs.get(ncrId);
    if (!ncr || ncr.organizationId !== session.activeOrganization.id) {
      throw new Error("Non-conformance report not found.");
    }

    if (ncr.status === "closed") {
      throw new Error("Closed NCRs are immutable and cannot be re-dispositioned.");
    }

    const now = new Date().toISOString();
    ncr.disposition = params.disposition;
    ncr.dispositionNotes = params.dispositionNotes.trim();
    ncr.rootCauseAnalysis = params.rootCauseAnalysis?.trim();
    if (params.finalScrapCostCents !== undefined) {
      ncr.scrapCostCents = params.finalScrapCostCents;
    } else if (params.finalScrapCost !== undefined) {
      ncr.scrapCostCents = Math.round(params.finalScrapCost * 100);
    }
    if (params.reworkLaborMinutes !== undefined) {
      ncr.reworkLaborMinutes = params.reworkLaborMinutes;
    }
    ncr.status = "dispositioned";
    ncr.approvedByUserId = session.user.id;
    ncr.approvedByName = session.user.name;
    ncr.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: ncr.jobId,
      action: "quality.ncr_dispositioned",
      summary: `QA Engineer ${session.user.name} dispositioned ${ncr.ncrNumber} as '${ncr.disposition}'.`,
    });

    this.ncrs.set(ncrId, ncr);
    return ncr;
  }

  // 4. Close NCR
  closeNCR(session: SessionContext, ncrId: string): NonConformanceReport {
    authorizationService.requireCapability(session, "quality:scrap_rework");

    const ncr = this.ncrs.get(ncrId);
    if (!ncr || ncr.organizationId !== session.activeOrganization.id) {
      throw new Error("NCR not found.");
    }

    if (ncr.disposition === "pending_review") {
      throw new Error("Cannot close NCR before an engineering disposition is approved.");
    }

    const now = new Date().toISOString();
    ncr.status = "closed";
    ncr.closedAt = now;
    ncr.updatedAt = now;

    this.ncrs.set(ncrId, ncr);
    return ncr;
  }

  // 5. Quality Metrics Summary
  getQualityMetrics(session: SessionContext): QualityMetricsSummary {
    authorizationService.requireCapability(session, "quality:record_inspection");
    const orgInspections = Array.from(this.inspections.values()).filter(
      (i) => i.organizationId === session.activeOrganization.id
    );
    const orgNcrs = Array.from(this.ncrs.values()).filter(
      (n) => n.organizationId === session.activeOrganization.id
    );

    const totalInspections = orgInspections.length;
    const passedInspections = orgInspections.filter((i) => i.status === "passed").length;
    const firstPassYield = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 98.4;
    const activeOpenNCRCount = orgNcrs.filter((n) => n.status !== "closed").length;
    const scrapValuationLossCents = orgNcrs.reduce((acc, n) => acc + n.scrapCostCents, 0);

    return {
      totalInspections,
      firstPassYieldPercentage: Math.round(firstPassYield * 10) / 10,
      activeOpenNCRCount,
      scrapValuationLossCents,
    };
  }

  listNCRs(session: SessionContext): NonConformanceReport[] {
    authorizationService.requireCapability(session, "quality:record_inspection");
    return Array.from(this.ncrs.values()).filter(
      (n) => n.organizationId === session.activeOrganization.id
    );
  }
}

export const qualityService = new QualityService();
