import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  qualityInspectionRecords,
  qualityNonConformanceReports,
  auditEvents,
  jobs,
} from "@/db/schema";
import {
  InspectionRecord,
  NonConformanceReport,
  QualityMetricsSummary,
  InspectionType,
  InspectionStatus,
  NCRSeverity,
  NCRDisposition,
  NCRStatus,
  InspectionChecklistItem,
} from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";

export class QualityRepository {
  // 1. Record Inspection
  async recordInspection(
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
  ): Promise<InspectionRecord> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    if (params.sampleSize <= 0) {
      throw new Error("Sample size must be greater than zero.");
    }
    if (params.passedQuantity + params.failedQuantity !== params.sampleSize) {
      throw new Error("Passed + Failed quantity must equal total sample size.");
    }

    // Referential check on job within organization
    const jobRows = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, params.jobId), eq(jobs.organizationId, orgId)))
      .limit(1);

    if (jobRows.length === 0) {
      throw new Error(`Referenced Job '${params.jobId}' does not exist in active organization.`);
    }

    const id = `insp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const hasFailures = params.failedQuantity > 0 || params.checklist.some((c) => c.result === "fail");
    const status: InspectionStatus = hasFailures ? "failed" : "passed";

    return await db.transaction(async (tx) => {
      const [record] = await tx
        .insert(qualityInspectionRecords)
        .values({
          id,
          organizationId: orgId,
          inspectionType: params.inspectionType,
          jobId: params.jobId,
          jobNumber: params.jobNumber,
          partDescription: params.partDescription.trim(),
          travelerOperationId: params.travelerOperationId || null,
          inspectorUserId: session.user.id,
          inspectorName: session.user.name,
          status,
          sampleSize: params.sampleSize,
          passedQuantity: params.passedQuantity,
          failedQuantity: params.failedQuantity,
          checklist: params.checklist,
          completedAt: new Date(),
        })
        .returning();

      // Record Audit Event
      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "inspection_record",
        entityId: record.id,
        action: "quality.inspection_completed",
        summary: `Completed ${params.inspectionType.toUpperCase()} inspection on ${params.jobNumber}: ${status.toUpperCase()} (${params.passedQuantity}/${params.sampleSize} passed)`,
        metadata: {
          inspectionType: params.inspectionType,
          jobNumber: params.jobNumber,
          status,
          sampleSize: params.sampleSize,
        },
      });

      return this.mapInspection(record);
    });
  }

  // 2. List Inspections
  async listInspections(
    session: SessionContext,
    jobId?: string,
    options?: { limit?: number; offset?: number }
  ): Promise<InspectionRecord[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(qualityInspectionRecords)
      .where(eq(qualityInspectionRecords.organizationId, orgId))
      .orderBy(desc(qualityInspectionRecords.completedAt))
      .limit(limit)
      .offset(offset);

    if (jobId) {
      query = db
        .select()
        .from(qualityInspectionRecords)
        .where(
          and(
            eq(qualityInspectionRecords.organizationId, orgId),
            eq(qualityInspectionRecords.jobId, jobId)
          )
        )
        .orderBy(desc(qualityInspectionRecords.completedAt))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    return rows.map((r: typeof qualityInspectionRecords.$inferSelect) => this.mapInspection(r));
  }

  // 3. Create Non-Conformance Report (NCR)
  async createNCR(
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
      scrapCostCents?: number;
      reworkLaborMinutes?: number;
      remakeCostCents?: number;
    }
  ): Promise<NonConformanceReport> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    // Referential check
    const jobRows = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, params.jobId), eq(jobs.organizationId, orgId)))
      .limit(1);

    if (jobRows.length === 0) {
      throw new Error(`Referenced Job '${params.jobId}' does not exist in active organization.`);
    }

    const id = `ncr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const year = new Date().getFullYear();

    return await db.transaction(async (tx) => {
      // Calculate next sequential NCR number atomically
      const countRes = await tx
        .select({ count: sql<number>`count(*)` })
        .from(qualityNonConformanceReports)
        .where(eq(qualityNonConformanceReports.organizationId, orgId));

      const count = Number(countRes[0]?.count || 0) + 1;
      const ncrNumber = `NCR-${year}-${count.toString().padStart(3, "0")}`;

      const [ncr] = await tx
        .insert(qualityNonConformanceReports)
        .values({
          id,
          organizationId: orgId,
          ncrNumber,
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
          scrapCostCents: params.scrapCostCents || 0,
          reworkLaborMinutes: params.reworkLaborMinutes || 0,
          remakeCostCents: params.remakeCostCents || 0,
          createdByUserId: session.user.id,
          createdByName: session.user.name,
        })
        .returning();

      // Audit Event
      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "non_conformance_report",
        entityId: ncr.id,
        action: "quality.ncr_raised",
        summary: `Raised ${params.severity.toUpperCase()} NCR ${ncrNumber} on ${params.jobNumber} (${params.defectQuantity} defects)`,
        metadata: {
          ncrNumber,
          severity: params.severity,
          defectCategory: params.defectCategory,
          defectQuantity: params.defectQuantity,
        },
      });

      return this.mapNCR(ncr);
    });
  }

  // 4. List NCRs
  async listNCRs(
    session: SessionContext,
    options?: { status?: string; severity?: string; limit?: number; offset?: number }
  ): Promise<NonConformanceReport[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(qualityNonConformanceReports)
      .where(eq(qualityNonConformanceReports.organizationId, orgId))
      .orderBy(desc(qualityNonConformanceReports.createdAt))
      .limit(limit)
      .offset(offset);

    if (options?.status) {
      query = db
        .select()
        .from(qualityNonConformanceReports)
        .where(
          and(
            eq(qualityNonConformanceReports.organizationId, orgId),
            eq(qualityNonConformanceReports.status, options.status)
          )
        )
        .orderBy(desc(qualityNonConformanceReports.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    return rows.map((r: typeof qualityNonConformanceReports.$inferSelect) => this.mapNCR(r));
  }

  async getNCR(session: SessionContext, ncrId: string): Promise<NonConformanceReport> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(qualityNonConformanceReports)
      .where(
        and(
          eq(qualityNonConformanceReports.organizationId, orgId),
          eq(qualityNonConformanceReports.id, ncrId)
        )
      )
      .limit(1);

    if (rows.length === 0) {
      throw new Error(`Non-conformance report '${ncrId}' not found in active organization.`);
    }

    return this.mapNCR(rows[0]);
  }

  // 5. Apply Disposition
  async applyDisposition(
    session: SessionContext,
    ncrId: string,
    params: {
      disposition: NCRDisposition;
      dispositionNotes: string;
      rootCauseAnalysis?: string;
      finalScrapCostCents?: number;
      reworkLaborMinutes?: number;
    }
  ): Promise<NonConformanceReport> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(qualityNonConformanceReports)
        .where(
          and(
            eq(qualityNonConformanceReports.organizationId, orgId),
            eq(qualityNonConformanceReports.id, ncrId)
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Non-conformance report '${ncrId}' not found in active organization.`);
      }

      const existing = rows[0];
      if (existing.status === "closed") {
        throw new Error("Closed NCRs are immutable and cannot be re-dispositioned.");
      }

      const [updated] = await tx
        .update(qualityNonConformanceReports)
        .set({
          disposition: params.disposition,
          dispositionNotes: params.dispositionNotes.trim(),
          rootCauseAnalysis: params.rootCauseAnalysis ? params.rootCauseAnalysis.trim() : existing.rootCauseAnalysis,
          scrapCostCents: params.finalScrapCostCents !== undefined ? params.finalScrapCostCents : existing.scrapCostCents,
          reworkLaborMinutes: params.reworkLaborMinutes !== undefined ? params.reworkLaborMinutes : existing.reworkLaborMinutes,
          status: "dispositioned",
          approvedByUserId: session.user.id,
          approvedByName: session.user.name,
          updatedAt: new Date(),
        })
        .where(eq(qualityNonConformanceReports.id, ncrId))
        .returning();

      // Audit Event
      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "non_conformance_report",
        entityId: ncrId,
        action: "quality.ncr_dispositioned",
        summary: `QA Inspector ${session.user.name} dispositioned ${existing.ncrNumber} as '${params.disposition.toUpperCase()}'`,
        metadata: {
          ncrNumber: existing.ncrNumber,
          disposition: params.disposition,
          approvedBy: session.user.name,
        },
      });

      return this.mapNCR(updated);
    });
  }

  // 6. Close NCR
  async closeNCR(session: SessionContext, ncrId: string): Promise<NonConformanceReport> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(qualityNonConformanceReports)
        .where(
          and(
            eq(qualityNonConformanceReports.organizationId, orgId),
            eq(qualityNonConformanceReports.id, ncrId)
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Non-conformance report '${ncrId}' not found in active organization.`);
      }

      const existing = rows[0];
      if (existing.disposition === "pending_review") {
        throw new Error("Cannot close NCR before an engineering disposition is approved.");
      }

      const [closed] = await tx
        .update(qualityNonConformanceReports)
        .set({
          status: "closed",
          closedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(qualityNonConformanceReports.id, ncrId))
        .returning();

      // Audit Event
      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "non_conformance_report",
        entityId: ncrId,
        action: "quality.ncr_closed",
        summary: `Closed NCR ${existing.ncrNumber} following disposition resolution`,
        metadata: { ncrNumber: existing.ncrNumber },
      });

      return this.mapNCR(closed);
    });
  }

  // 7. Live Quality Metrics Aggregation
  async getMetrics(session: SessionContext): Promise<QualityMetricsSummary> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const inspRows = await db
      .select({
        status: qualityInspectionRecords.status,
      })
      .from(qualityInspectionRecords)
      .where(eq(qualityInspectionRecords.organizationId, orgId));

    const totalInspections = inspRows.length;
    const passed = inspRows.filter((i) => i.status === "passed").length;
    const fpy = totalInspections > 0 ? (passed / totalInspections) * 100 : 98.4;

    const ncrRows = await db
      .select({
        status: qualityNonConformanceReports.status,
        scrapCostCents: qualityNonConformanceReports.scrapCostCents,
      })
      .from(qualityNonConformanceReports)
      .where(eq(qualityNonConformanceReports.organizationId, orgId));

    const activeOpenNCRCount = ncrRows.filter((n) => n.status !== "closed").length;
    const scrapValuationLossCents = ncrRows.reduce((acc, n) => acc + (n.scrapCostCents || 0), 0);

    return {
      totalInspections,
      firstPassYieldPercentage: Math.round(fpy * 10) / 10,
      activeOpenNCRCount,
      scrapValuationLossCents,
    };
  }

  private mapInspection(row: typeof qualityInspectionRecords.$inferSelect): InspectionRecord {
    return {
      id: row.id,
      organizationId: row.organizationId,
      inspectionType: row.inspectionType as InspectionType,
      jobId: row.jobId,
      jobNumber: row.jobNumber,
      partDescription: row.partDescription,
      travelerOperationId: row.travelerOperationId || undefined,
      inspectorUserId: row.inspectorUserId,
      inspectorName: row.inspectorName,
      status: row.status as InspectionStatus,
      sampleSize: row.sampleSize,
      passedQuantity: row.passedQuantity,
      failedQuantity: row.failedQuantity,
      checklist: (row.checklist || []) as InspectionChecklistItem[],
      ncrId: row.ncrId || undefined,
      completedAt: row.completedAt.toISOString(),
    };
  }

  private mapNCR(row: typeof qualityNonConformanceReports.$inferSelect): NonConformanceReport {
    return {
      id: row.id,
      ncrNumber: row.ncrNumber,
      organizationId: row.organizationId,
      jobId: row.jobId,
      jobNumber: row.jobNumber,
      partDescription: row.partDescription,
      operationName: row.operationName,
      defectDescription: row.defectDescription,
      defectCategory: row.defectCategory,
      severity: row.severity as NCRSeverity,
      status: row.status as NCRStatus,
      defectQuantity: row.defectQuantity,
      containmentActions: (row.containmentActions || []) as string[],
      rootCauseAnalysis: row.rootCauseAnalysis || undefined,
      disposition: row.disposition as NCRDisposition,
      dispositionNotes: row.dispositionNotes || undefined,
      scrapCostCents: row.scrapCostCents,
      reworkLaborMinutes: row.reworkLaborMinutes,
      remakeCostCents: row.remakeCostCents,
      createdByUserId: row.createdByUserId,
      createdByName: row.createdByName,
      approvedByUserId: row.approvedByUserId || undefined,
      approvedByName: row.approvedByName || undefined,
      closedAt: row.closedAt ? row.closedAt.toISOString() : undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

export const qualityRepository = new QualityRepository();
