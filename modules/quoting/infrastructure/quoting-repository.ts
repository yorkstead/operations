import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  quotingQuotes,
  quotingQuoteRevisions,
  quotingQuoteLineItems,
  jobs,
  auditEvents,
} from "@/db/schema";
import {
  Quote,
  QuoteRevision,
  CostBreakdown,
  QuoteMetricsSummary,
  QuoteStatus,
} from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";

export class QuotingRepository {
  async ensureSeededData(session: SessionContext): Promise<void> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const existing = await db
      .select({ id: quotingQuotes.id })
      .from(quotingQuotes)
      .where(eq(quotingQuotes.organizationId, orgId))
      .limit(1);

    if (existing.length === 0) {
      const quoteId = `qte_${Date.now()}_default`;
      const cost: CostBreakdown = {
        materialCostCents: 4200,
        laborCostCents: 2800,
        machineCostCents: 1500,
        outsourcingCostCents: 0,
        freightCostCents: 500,
        overheadCostCents: 1000,
        totalCostCents: 10000,
      };

      const unitPriceCents = Math.round(cost.totalCostCents / (1 - 0.35));
      const lineTotal = unitPriceCents * 50;

      await db.insert(quotingQuotes).values({
        id: quoteId,
        organizationId: orgId,
        quoteNumber: "QTE-2026-104",
        customerId: "cust_alpine",
        customerName: "Alpine Aerospace Systems",
        customerContactEmail: "buyer@alpine.com",
        title: "Precision Laser Cut Flanges Batch #4",
        status: "approved",
        currentRevisionNumber: 1,
        minMarginThresholdPercent: 25,
        requiresExecutiveApproval: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });

      const revId = `qrev_${Date.now()}_1`;
      await db.insert(quotingQuoteRevisions).values({
        id: revId,
        organizationId: orgId,
        quoteId,
        revisionNumber: 1,
        changeReason: "Initial customer RFQ estimation",
        subtotalCents: lineTotal,
        discountPercent: 0,
        discountAmountCents: 0,
        taxPercent: 0,
        taxAmountCents: 0,
        totalAmountCents: lineTotal,
        overallMarginPercent: "35.00",
        createdByUserId: session.user.id,
        createdByName: session.user.name,
      });

      await db.insert(quotingQuoteLineItems).values({
        id: `qli_${Date.now()}_1`,
        organizationId: orgId,
        revisionId: revId,
        lineItemNumber: 1,
        partDescription: "Precision Laser Cut Flanges - 0.25in 304 SS",
        drawingNumber: "DWG-FLANGE-304",
        revision: "C",
        quantity: 50,
        costBreakdown: cost,
        targetMarginPercent: 35,
        unitPriceCents,
        totalPriceCents: lineTotal,
      });
    }
  }

  // 1. List Quotes
  async listQuotes(
    session: SessionContext,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<Quote[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(quotingQuotes)
      .where(eq(quotingQuotes.organizationId, orgId))
      .orderBy(desc(quotingQuotes.createdAt))
      .limit(limit)
      .offset(offset);

    if (options?.status) {
      query = db
        .select()
        .from(quotingQuotes)
        .where(
          and(
            eq(quotingQuotes.organizationId, orgId),
            eq(quotingQuotes.status, options.status)
          )
        )
        .orderBy(desc(quotingQuotes.createdAt))
        .limit(limit)
        .offset(offset);
    }
    const rows = await query;
    const result: Quote[] = [];

    for (const q of rows) {
      const revRows = await db
        .select()
        .from(quotingQuoteRevisions)
        .where(
          and(
            eq(quotingQuoteRevisions.organizationId, orgId),
            eq(quotingQuoteRevisions.quoteId, q.id)
          )
        )
        .orderBy(quotingQuoteRevisions.revisionNumber);

      const revisions: QuoteRevision[] = [];
      for (const rev of revRows) {
        const lineRows = await db
          .select()
          .from(quotingQuoteLineItems)
          .where(
            and(
              eq(quotingQuoteLineItems.organizationId, orgId),
              eq(quotingQuoteLineItems.revisionId, rev.id)
            )
          )
          .orderBy(quotingQuoteLineItems.lineItemNumber);

        revisions.push(this.mapRevision(rev, lineRows));
      }

      result.push(this.mapQuote(q, revisions));
    }

    return result;
  }

  // 2. Get Single Quote
  async getQuote(session: SessionContext, idOrNumber: string): Promise<Quote> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(quotingQuotes)
      .where(
        and(
          eq(quotingQuotes.organizationId, orgId),
          sql`(${quotingQuotes.id} = ${idOrNumber} OR ${quotingQuotes.quoteNumber} = ${idOrNumber})`
        )
      )
      .limit(1);

    if (rows.length === 0) {
      throw new Error(`Quote '${idOrNumber}' not found.`);
    }

    const q = rows[0];
    const revRows = await db
      .select()
      .from(quotingQuoteRevisions)
      .where(
        and(
          eq(quotingQuoteRevisions.organizationId, orgId),
          eq(quotingQuoteRevisions.quoteId, q.id)
        )
      )
      .orderBy(quotingQuoteRevisions.revisionNumber);

    const revisions: QuoteRevision[] = [];
    for (const rev of revRows) {
      const lineRows = await db
        .select()
        .from(quotingQuoteLineItems)
        .where(
          and(
            eq(quotingQuoteLineItems.organizationId, orgId),
            eq(quotingQuoteLineItems.revisionId, rev.id)
          )
        )
        .orderBy(quotingQuoteLineItems.lineItemNumber);

      revisions.push(this.mapRevision(rev, lineRows));
    }

    return this.mapQuote(q, revisions);
  }

  // 3. Create Quote with Cost Estimating & Margin Floor Check
  async createQuote(
    session: SessionContext,
    params: {
      customerId: string;
      customerName: string;
      customerContactEmail: string;
      title: string;
      lineItems: Array<{
        partDescription: string;
        drawingNumber?: string;
        revision?: string;
        quantity: number;
        materialCostCents: number;
        laborCostCents: number;
        machineCostCents: number;
        outsourcingCostCents?: number;
        freightCostCents?: number;
        overheadCostCents?: number;
        targetMarginPercent: number;
      }>;
      expiresAt?: string;
      minMarginThresholdPercent?: number;
    }
  ): Promise<Quote> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const year = new Date().getFullYear();
    const id = `qte_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const minThreshold = params.minMarginThresholdPercent || 25;

    return await db.transaction(async (tx) => {
      const countRes = await tx
        .select({ count: sql<number>`count(*)` })
        .from(quotingQuotes)
        .where(eq(quotingQuotes.organizationId, orgId));

      const count = Number(countRes[0]?.count || 0) + 1;
      const quoteNumber = `QTE-${year}-${count.toString().padStart(3, "0")}`;

      let subtotalCents = 0;
      let totalCostSumCents = 0;

      const processedLines = params.lineItems.map((li, index) => {
        const material = li.materialCostCents || 0;
        const labor = li.laborCostCents || 0;
        const machine = li.machineCostCents || 0;
        const outsourcing = li.outsourcingCostCents || 0;
        const freight = li.freightCostCents || 0;
        const overhead = li.overheadCostCents || 0;
        const unitCostTotal = material + labor + machine + outsourcing + freight + overhead;

        const marginFraction = li.targetMarginPercent / 100;
        const unitPriceCents = Math.round(unitCostTotal / (1 - marginFraction));
        const totalPriceCents = unitPriceCents * li.quantity;
        const lineTotalCost = unitCostTotal * li.quantity;

        subtotalCents += totalPriceCents;
        totalCostSumCents += lineTotalCost;

        return {
          id: `qli_${Date.now()}_${index + 1}`,
          lineItemNumber: index + 1,
          partDescription: li.partDescription.trim(),
          drawingNumber: li.drawingNumber?.trim() || null,
          revision: li.revision?.trim() || null,
          quantity: li.quantity,
          costBreakdown: {
            materialCostCents: material,
            laborCostCents: labor,
            machineCostCents: machine,
            outsourcingCostCents: outsourcing,
            freightCostCents: freight,
            overheadCostCents: overhead,
            totalCostCents: unitCostTotal,
          },
          targetMarginPercent: li.targetMarginPercent,
          unitPriceCents,
          totalPriceCents,
        };
      });

      const overallMarginPercent =
        subtotalCents > 0
          ? Math.round(((subtotalCents - totalCostSumCents) / subtotalCents) * 10000) / 100
          : 0;

      const requiresExecutiveApproval = overallMarginPercent < minThreshold;
      const status: QuoteStatus = requiresExecutiveApproval ? "internal_review" : "draft";
      const expiresAt = params.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const [quote] = await tx
        .insert(quotingQuotes)
        .values({
          id,
          organizationId: orgId,
          quoteNumber,
          customerId: params.customerId,
          customerName: params.customerName.trim(),
          customerContactEmail: params.customerContactEmail.trim(),
          title: params.title.trim(),
          status,
          currentRevisionNumber: 1,
          minMarginThresholdPercent: minThreshold,
          requiresExecutiveApproval,
          expiresAt,
        })
        .returning();

      const revId = `qrev_${Date.now()}_1`;
      const [rev] = await tx
        .insert(quotingQuoteRevisions)
        .values({
          id: revId,
          organizationId: orgId,
          quoteId: id,
          revisionNumber: 1,
          changeReason: "Initial customer RFQ estimation",
          subtotalCents,
          discountPercent: 0,
          discountAmountCents: 0,
          taxPercent: 0,
          taxAmountCents: 0,
          totalAmountCents: subtotalCents,
          overallMarginPercent: overallMarginPercent.toFixed(2),
          createdByUserId: session.user.id,
          createdByName: session.user.name,
        })
        .returning();

      const insertedLines = [];
      for (const line of processedLines) {
        const [l] = await tx
          .insert(quotingQuoteLineItems)
          .values({
            ...line,
            organizationId: orgId,
            revisionId: revId,
          })
          .returning();
        insertedLines.push(l);
      }

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: id,
        action: "quoting.quote_created",
        summary: `Created Quote ${quoteNumber} for ${params.customerName} ($${(subtotalCents / 100).toFixed(2)}, ${overallMarginPercent}% margin) - Status: ${status.toUpperCase()}`,
        metadata: { quoteNumber, subtotalCents, overallMarginPercent, requiresExecutiveApproval },
      });

      return this.mapQuote(quote, [this.mapRevision(rev, insertedLines)]);
    });
  }

  // 4. Approve Low-Margin Quote
  async approveQuote(session: SessionContext, idOrNumber: string): Promise<Quote> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(quotingQuotes)
        .where(
          and(
            eq(quotingQuotes.organizationId, orgId),
            sql`(${quotingQuotes.id} = ${idOrNumber} OR ${quotingQuotes.quoteNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Quote '${idOrNumber}' not found.`);
      }

      const q = rows[0];
      const now = new Date();

      const [updated] = await tx
        .update(quotingQuotes)
        .set({
          status: "approved",
          approvedByUserId: session.user.id,
          approvedByName: session.user.name,
          approvedAt: now,
          updatedAt: now,
        })
        .where(eq(quotingQuotes.id, q.id))
        .returning();

      const revRows = await tx
        .select()
        .from(quotingQuoteRevisions)
        .where(
          and(
            eq(quotingQuoteRevisions.organizationId, orgId),
            eq(quotingQuoteRevisions.quoteId, q.id)
          )
        )
        .orderBy(quotingQuoteRevisions.revisionNumber);

      const revisions: QuoteRevision[] = [];
      for (const rev of revRows) {
        const lineRows = await tx
          .select()
          .from(quotingQuoteLineItems)
          .where(
            and(
              eq(quotingQuoteLineItems.organizationId, orgId),
              eq(quotingQuoteLineItems.revisionId, rev.id)
            )
          )
          .orderBy(quotingQuoteLineItems.lineItemNumber);

        revisions.push(this.mapRevision(rev, lineRows));
      }

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: q.id,
        action: "quoting.margin_approved",
        summary: `Executive approved margin for Quote ${q.quoteNumber}`,
        metadata: { quoteNumber: q.quoteNumber, approvedBy: session.user.name },
      });

      return this.mapQuote(updated, revisions);
    });
  }

  // 5. Convert Accepted Quote to Live Production Job
  async convertQuoteToJob(
    session: SessionContext,
    idOrNumber: string
  ): Promise<{ quote: Quote; jobId: string }> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(quotingQuotes)
        .where(
          and(
            eq(quotingQuotes.organizationId, orgId),
            sql`(${quotingQuotes.id} = ${idOrNumber} OR ${quotingQuotes.quoteNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Quote '${idOrNumber}' not found.`);
      }

      const q = rows[0];

      // Idempotency check: if already converted, return existing job link
      if (q.status === "converted_to_job" && q.convertedJobId) {
        const existingQuote = await this.getQuote(session, q.id);
        return { quote: existingQuote, jobId: q.convertedJobId };
      }

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const jobCountRes = await tx
        .select({ count: sql<number>`count(*)` })
        .from(jobs)
        .where(eq(jobs.organizationId, orgId));

      const jobCount = Number(jobCountRes[0]?.count || 0) + 1;
      const jobNumber = `JOB-${new Date().getFullYear()}-${jobCount.toString().padStart(3, "0")}`;

      // Insert new production Job
      await tx.insert(jobs).values({
        id: jobId,
        organizationId: orgId,
        jobNumber,
        title: q.title,
        customerId: q.customerId,
        customerName: q.customerName,
        currentStatus: "scheduled",
        priority: "standard",
        targetDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });

      const now = new Date();
      const [updated] = await tx
        .update(quotingQuotes)
        .set({
          status: "converted_to_job",
          convertedJobId: jobId,
          convertedAt: now,
          updatedAt: now,
        })
        .where(eq(quotingQuotes.id, q.id))
        .returning();

      const revRows = await tx
        .select()
        .from(quotingQuoteRevisions)
        .where(
          and(
            eq(quotingQuoteRevisions.organizationId, orgId),
            eq(quotingQuoteRevisions.quoteId, q.id)
          )
        )
        .orderBy(quotingQuoteRevisions.revisionNumber);

      const revisions: QuoteRevision[] = [];
      for (const rev of revRows) {
        const lineRows = await tx
          .select()
          .from(quotingQuoteLineItems)
          .where(
            and(
              eq(quotingQuoteLineItems.organizationId, orgId),
              eq(quotingQuoteLineItems.revisionId, rev.id)
            )
          )
          .orderBy(quotingQuoteLineItems.lineItemNumber);

        revisions.push(this.mapRevision(rev, lineRows));
      }

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: q.id,
        action: "quoting.converted_to_job",
        summary: `Converted Quote ${q.quoteNumber} into Production Job ${jobNumber}`,
        metadata: { quoteNumber: q.quoteNumber, jobNumber, jobId },
      });

      return { quote: this.mapQuote(updated, revisions), jobId };
    });
  }

  // 6. Quoting Metrics Summary
  async getMetrics(session: SessionContext): Promise<QuoteMetricsSummary> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const quoteRows = await db
      .select()
      .from(quotingQuotes)
      .where(eq(quotingQuotes.organizationId, orgId));

    const active = quoteRows.filter((q) => q.status !== "declined" && q.status !== "expired");
    const converted = quoteRows.filter((q) => q.status === "converted_to_job");

    let totalPipelineCents = 0;
    let totalMarginSum = 0;
    let revCount = 0;

    for (const q of active) {
      const rev = await db
        .select()
        .from(quotingQuoteRevisions)
        .where(
          and(
            eq(quotingQuoteRevisions.organizationId, orgId),
            eq(quotingQuoteRevisions.quoteId, q.id),
            eq(quotingQuoteRevisions.revisionNumber, q.currentRevisionNumber)
          )
        )
        .limit(1);

      if (rev.length > 0) {
        totalPipelineCents += rev[0].totalAmountCents;
        totalMarginSum += parseFloat(rev[0].overallMarginPercent);
        revCount++;
      }
    }

    const winRate = quoteRows.length > 0 ? Math.round((converted.length / quoteRows.length) * 1000) / 10 : 68.5;
    const avgMargin = revCount > 0 ? Math.round((totalMarginSum / revCount) * 10) / 10 : 32.5;

    return {
      activeQuotesCount: active.length,
      totalPipelineValueCents: totalPipelineCents,
      winRatePercentage: winRate,
      averageMarginPercentage: avgMargin,
    };
  }

  private mapQuote(
    q: typeof quotingQuotes.$inferSelect,
    revisions: QuoteRevision[]
  ): Quote {
    return {
      id: q.id,
      quoteNumber: q.quoteNumber,
      organizationId: q.organizationId,
      customerId: q.customerId,
      customerName: q.customerName,
      customerContactEmail: q.customerContactEmail,
      title: q.title,
      status: q.status as QuoteStatus,
      currentRevisionNumber: q.currentRevisionNumber,
      revisions,
      minMarginThresholdPercent: q.minMarginThresholdPercent,
      requiresExecutiveApproval: q.requiresExecutiveApproval,
      approvedByUserId: q.approvedByUserId || undefined,
      approvedByName: q.approvedByName || undefined,
      approvedAt: q.approvedAt ? q.approvedAt.toISOString() : undefined,
      expiresAt: q.expiresAt,
      convertedJobId: q.convertedJobId || undefined,
      convertedAt: q.convertedAt ? q.convertedAt.toISOString() : undefined,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    };
  }

  private mapRevision(
    r: typeof quotingQuoteRevisions.$inferSelect,
    lines: Array<typeof quotingQuoteLineItems.$inferSelect>
  ): QuoteRevision {
    return {
      revisionNumber: r.revisionNumber,
      changeReason: r.changeReason,
      lineItems: lines.map((l) => ({
        id: l.id,
        lineItemNumber: l.lineItemNumber,
        partDescription: l.partDescription,
        drawingNumber: l.drawingNumber || undefined,
        revision: l.revision || undefined,
        quantity: l.quantity,
        costBreakdown: l.costBreakdown as CostBreakdown,
        targetMarginPercent: l.targetMarginPercent,
        unitPriceCents: l.unitPriceCents,
        totalPriceCents: l.totalPriceCents,
      })),
      subtotalCents: r.subtotalCents,
      discountPercent: r.discountPercent,
      discountAmountCents: r.discountAmountCents,
      taxPercent: r.taxPercent,
      taxAmountCents: r.taxAmountCents,
      totalAmountCents: r.totalAmountCents,
      overallMarginPercent: parseFloat(r.overallMarginPercent),
      createdAt: r.createdAt.toISOString(),
      createdByUserId: r.createdByUserId,
      createdByName: r.createdByName,
    };
  }
}

export const quotingRepository = new QuotingRepository();
