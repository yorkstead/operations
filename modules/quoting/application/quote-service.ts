import {
  Quote,
  QuoteRevision,
  QuoteLineItem,
  CostBreakdown,
  QuoteMetricsSummary,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";
import { notificationService } from "../../core/application/notification-service";
import { jobService } from "../../jobs/application/job-service";

export class QuoteService {
  private quotes: Map<string, Quote> = new Map();

  constructor() {
    this.seedDefaultQuote("org_default");
  }

  private seedDefaultQuote(orgId: string) {
    const cost: CostBreakdown = {
      materialCostCents: 4200, // $42.00
      laborCostCents: 2800,    // $28.00
      machineCostCents: 1500,  // $15.00
      outsourcingCostCents: 0,
      freightCostCents: 500,   // $5.00
      overheadCostCents: 1000, // $10.00
      totalCostCents: 10000,   // $100.00
    };

    // 35% margin -> $100 / (1 - 0.35) = $153.85 -> 15385 cents
    const unitPriceCents = Math.round(cost.totalCostCents / (1 - 0.35));
    const qty = 50;
    const lineTotal = unitPriceCents * qty; // $7,692.50

    const lineItem: QuoteLineItem = {
      id: "qli_1",
      lineItemNumber: 1,
      partDescription: "Precision Laser Cut Flanges - 0.25in 304 SS",
      drawingNumber: "DWG-FLANGE-304",
      revision: "C",
      quantity: qty,
      costBreakdown: cost,
      targetMarginPercent: 35,
      unitPriceCents,
      totalPriceCents: lineTotal,
    };

    const rev: QuoteRevision = {
      revisionNumber: 1,
      changeReason: "Initial customer RFQ estimation",
      lineItems: [lineItem],
      subtotalCents: lineTotal,
      discountPercent: 0,
      discountAmountCents: 0,
      taxPercent: 0,
      taxAmountCents: 0,
      totalAmountCents: lineTotal,
      overallMarginPercent: 35,
      createdAt: new Date().toISOString(),
      createdByUserId: "usr_estimator",
      createdByName: "Lead Estimator",
    };

    const quote: Quote = {
      id: "qte_1",
      quoteNumber: "QTE-2026-104",
      organizationId: orgId,
      customerId: "cust_1",
      customerName: "Alpine Aerospace Systems",
      customerContactEmail: "procurement@alpineaero.com",
      title: "Precision Laser Cut Flanges Batch #4",
      status: "approved",
      currentRevisionNumber: 1,
      revisions: [rev],
      minMarginThresholdPercent: 25,
      requiresExecutiveApproval: false,
      approvedByUserId: "usr_owner",
      approvedByName: "Operations Director",
      approvedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.quotes.set(`${orgId}:${quote.quoteNumber}`, quote);
  }

  private ensureQuotesSeeded(orgId: string) {
    const existing = Array.from(this.quotes.values()).filter((q) => q.organizationId === orgId);
    if (existing.length === 0) {
      this.seedDefaultQuote(orgId);
    }
  }

  // 1. Create Initial Quote (Rev 1)
  createQuote(
    session: SessionContext,
    params: {
      customerId: string;
      customerName: string;
      customerContactEmail: string;
      title: string;
      lineItems: {
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
      }[];
      discountPercent?: number;
      taxPercent?: number;
    }
  ): Quote {
    authorizationService.requireCapability(session, "quoting:create_quote");

    const orgId = session.activeOrganization.id;
    const count = Array.from(this.quotes.values()).filter((q) => q.organizationId === orgId).length + 1;
    const quoteNumber = `QTE-${new Date().getFullYear()}-${count.toString().padStart(3, "0")}`;
    const id = `qte_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const lineItems: QuoteLineItem[] = params.lineItems.map((item, idx) => {
      const totalCostCents =
        item.materialCostCents +
        item.laborCostCents +
        item.machineCostCents +
        (item.outsourcingCostCents || 0) +
        (item.freightCostCents || 0) +
        (item.overheadCostCents || 0);

      const marginDec = Math.min(0.95, Math.max(0.01, item.targetMarginPercent / 100));
      const unitPriceCents = Math.round(totalCostCents / (1 - marginDec));
      const totalPriceCents = unitPriceCents * item.quantity;

      return {
        id: `qli_${Date.now()}_${idx}`,
        lineItemNumber: idx + 1,
        partDescription: item.partDescription.trim(),
        drawingNumber: item.drawingNumber?.trim(),
        revision: item.revision?.trim(),
        quantity: item.quantity,
        costBreakdown: {
          materialCostCents: item.materialCostCents,
          laborCostCents: item.laborCostCents,
          machineCostCents: item.machineCostCents,
          outsourcingCostCents: item.outsourcingCostCents || 0,
          freightCostCents: item.freightCostCents || 0,
          overheadCostCents: item.overheadCostCents || 0,
          totalCostCents,
        },
        targetMarginPercent: item.targetMarginPercent,
        unitPriceCents,
        totalPriceCents,
      };
    });

    const subtotalCents = lineItems.reduce((acc, li) => acc + li.totalPriceCents, 0);
    const totalCosts = lineItems.reduce((acc, li) => acc + li.costBreakdown.totalCostCents * li.quantity, 0);
    const discountPercent = params.discountPercent || 0;
    const discountAmountCents = Math.round(subtotalCents * (discountPercent / 100));
    const discountedSubtotal = subtotalCents - discountAmountCents;
    const taxPercent = params.taxPercent || 0;
    const taxAmountCents = Math.round(discountedSubtotal * (taxPercent / 100));
    const totalAmountCents = discountedSubtotal + taxAmountCents;

    const overallMarginPercent =
      discountedSubtotal > 0
        ? Math.round(((discountedSubtotal - totalCosts) / discountedSubtotal) * 1000) / 10
        : 0;

    const minMarginThresholdPercent = 25;
    const requiresExecutiveApproval = overallMarginPercent < minMarginThresholdPercent || discountPercent > 10;

    const rev: QuoteRevision = {
      revisionNumber: 1,
      changeReason: "Initial Quote Creation",
      lineItems,
      subtotalCents,
      discountPercent,
      discountAmountCents,
      taxPercent,
      taxAmountCents,
      totalAmountCents,
      overallMarginPercent,
      createdAt: now,
      createdByUserId: session.user.id,
      createdByName: session.user.name,
    };

    const quote: Quote = {
      id,
      quoteNumber,
      organizationId: orgId,
      customerId: params.customerId,
      customerName: params.customerName.trim(),
      customerContactEmail: params.customerContactEmail.trim(),
      title: params.title.trim(),
      status: requiresExecutiveApproval ? "internal_review" : "draft",
      currentRevisionNumber: 1,
      revisions: [rev],
      minMarginThresholdPercent,
      requiresExecutiveApproval,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now,
      updatedAt: now,
    };

    this.quotes.set(`${orgId}:${quoteNumber}`, quote);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: id,
      action: "quoting.created",
      summary: `Created Quote ${quoteNumber} (${params.customerName}) for $${(totalAmountCents / 100).toFixed(2)} (Margin: ${overallMarginPercent}%).`,
    });

    return quote;
  }

  // 2. Create Traceable Revision
  createRevision(
    session: SessionContext,
    quoteNumber: string,
    params: {
      changeReason: string;
      lineItems: {
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
      }[];
      discountPercent?: number;
      taxPercent?: number;
    }
  ): Quote {
    authorizationService.requireCapability(session, "quoting:create_quote");

    const quote = this.findQuote(session, quoteNumber);
    const nextRevNum = quote.currentRevisionNumber + 1;
    const now = new Date().toISOString();

    const lineItems: QuoteLineItem[] = params.lineItems.map((item, idx) => {
      const totalCostCents =
        item.materialCostCents +
        item.laborCostCents +
        item.machineCostCents +
        (item.outsourcingCostCents || 0) +
        (item.freightCostCents || 0) +
        (item.overheadCostCents || 0);

      const marginDec = Math.min(0.95, Math.max(0.01, item.targetMarginPercent / 100));
      const unitPriceCents = Math.round(totalCostCents / (1 - marginDec));
      const totalPriceCents = unitPriceCents * item.quantity;

      return {
        id: `qli_${Date.now()}_${idx}`,
        lineItemNumber: idx + 1,
        partDescription: item.partDescription.trim(),
        drawingNumber: item.drawingNumber?.trim(),
        revision: item.revision?.trim(),
        quantity: item.quantity,
        costBreakdown: {
          materialCostCents: item.materialCostCents,
          laborCostCents: item.laborCostCents,
          machineCostCents: item.machineCostCents,
          outsourcingCostCents: item.outsourcingCostCents || 0,
          freightCostCents: item.freightCostCents || 0,
          overheadCostCents: item.overheadCostCents || 0,
          totalCostCents,
        },
        targetMarginPercent: item.targetMarginPercent,
        unitPriceCents,
        totalPriceCents,
      };
    });

    const subtotalCents = lineItems.reduce((acc, li) => acc + li.totalPriceCents, 0);
    const totalCosts = lineItems.reduce((acc, li) => acc + li.costBreakdown.totalCostCents * li.quantity, 0);
    const discountPercent = params.discountPercent || 0;
    const discountAmountCents = Math.round(subtotalCents * (discountPercent / 100));
    const discountedSubtotal = subtotalCents - discountAmountCents;
    const taxPercent = params.taxPercent || 0;
    const taxAmountCents = Math.round(discountedSubtotal * (taxPercent / 100));
    const totalAmountCents = discountedSubtotal + taxAmountCents;

    const overallMarginPercent =
      discountedSubtotal > 0
        ? Math.round(((discountedSubtotal - totalCosts) / discountedSubtotal) * 1000) / 10
        : 0;

    const requiresExecutiveApproval = overallMarginPercent < quote.minMarginThresholdPercent || discountPercent > 10;

    const newRev: QuoteRevision = {
      revisionNumber: nextRevNum,
      changeReason: params.changeReason.trim(),
      lineItems,
      subtotalCents,
      discountPercent,
      discountAmountCents,
      taxPercent,
      taxAmountCents,
      totalAmountCents,
      overallMarginPercent,
      createdAt: now,
      createdByUserId: session.user.id,
      createdByName: session.user.name,
    };

    quote.revisions.push(newRev);
    quote.currentRevisionNumber = nextRevNum;
    quote.requiresExecutiveApproval = requiresExecutiveApproval;
    quote.status = requiresExecutiveApproval ? "internal_review" : "draft";
    quote.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: quote.id,
      action: "quoting.revision_created",
      summary: `Created Revision ${nextRevNum} for Quote ${quoteNumber}: ${params.changeReason}`,
    });

    this.quotes.set(`${session.activeOrganization.id}:${quoteNumber}`, quote);
    return quote;
  }

  // 3. Approve Quote (Margin Policy & Executive Approval Guardrail)
  approveQuote(session: SessionContext, quoteNumber: string): Quote {
    const quote = this.findQuote(session, quoteNumber);

    if (quote.requiresExecutiveApproval) {
      // Require administrative margin approval capability
      authorizationService.requireCapability(session, "quoting:approve_margin");
    } else {
      authorizationService.requireCapability(session, "quoting:create_quote");
    }

    const now = new Date().toISOString();
    quote.status = "approved";
    quote.approvedByUserId = session.user.id;
    quote.approvedByName = session.user.name;
    quote.approvedAt = now;
    quote.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: quote.id,
      action: "quoting.approved",
      summary: `Quote ${quoteNumber} approved by ${session.user.name}.`,
    });

    this.quotes.set(`${session.activeOrganization.id}:${quoteNumber}`, quote);
    return quote;
  }

  // 4. Accept Quote and Handoff to Live Job (Idempotent Conversion)
  acceptQuoteAndHandoffToJob(session: SessionContext, quoteNumber: string): { quote: Quote; jobId: string } {
    authorizationService.requireCapability(session, "quoting:convert_to_job");

    const quote = this.findQuote(session, quoteNumber);

    // If already converted, return existing job mapping idempotently
    if (quote.convertedJobId) {
      return { quote, jobId: quote.convertedJobId };
    }

    const latestRev = quote.revisions[quote.revisions.length - 1];
    const now = new Date().toISOString();

    // Create Live Job via JobService aggregate
    const job = jobService.createJob(session, {
      title: `${quote.title} (from ${quote.quoteNumber})`,
      customerId: quote.customerId,
      customerName: quote.customerName,
      priority: "standard",
      targetDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: `Converted from Quote ${quote.quoteNumber} (Rev ${latestRev.revisionNumber}). Total Value: $${(latestRev.totalAmountCents / 100).toFixed(2)}.`,
    });

    quote.status = "converted_to_job";
    quote.convertedJobId = job.id;
    quote.convertedAt = now;
    quote.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: job.id,
      action: "quoting.converted_to_job",
      summary: `Quote ${quoteNumber} accepted & converted into live job ${job.jobNumber}.`,
    });

    notificationService.dispatchNotification({
      organizationId: session.activeOrganization.id,
      recipientUserId: "production_manager",
      title: `New Job from Quote: ${job.jobNumber}`,
      message: `Quote ${quoteNumber} accepted by ${quote.customerName}. Job ${job.jobNumber} created.`,
      link: `/jobs?jobId=${job.id}`,
    });

    this.quotes.set(`${session.activeOrganization.id}:${quoteNumber}`, quote);
    return { quote, jobId: job.id };
  }

  // 5. Metrics & Lookups
  getQuoteMetrics(session: SessionContext): QuoteMetricsSummary {
    const orgQuotes = Array.from(this.quotes.values()).filter(
      (q) => q.organizationId === session.activeOrganization.id
    );

    const activeQuotes = orgQuotes.filter((q) => q.status !== "declined" && q.status !== "expired");
    const convertedQuotes = orgQuotes.filter((q) => q.status === "converted_to_job");

    const totalPipelineValueCents = activeQuotes.reduce((acc, q) => {
      const rev = q.revisions[q.revisions.length - 1];
      return acc + (rev ? rev.totalAmountCents : 0);
    }, 0);

    const winRate = orgQuotes.length > 0 ? Math.round((convertedQuotes.length / orgQuotes.length) * 1000) / 10 : 68.5;
    const avgMargin =
      orgQuotes.length > 0
        ? Math.round(
            (orgQuotes.reduce((acc, q) => {
              const rev = q.revisions[q.revisions.length - 1];
              return acc + (rev ? rev.overallMarginPercent : 0);
            }, 0) /
              orgQuotes.length) *
              10
          ) / 10
        : 33.4;

    return {
      activeQuotesCount: activeQuotes.length,
      totalPipelineValueCents,
      winRatePercentage: winRate,
      averageMarginPercentage: avgMargin,
    };
  }

  listQuotes(session: SessionContext): Quote[] {
    return Array.from(this.quotes.values()).filter(
      (q) => q.organizationId === session.activeOrganization.id
    );
  }

  getQuote(session: SessionContext, quoteNumberOrId: string): Quote {
    return this.findQuote(session, quoteNumberOrId);
  }

  private findQuote(session: SessionContext, idOrNumber: string): Quote {
    const quote = Array.from(this.quotes.values()).find(
      (q) =>
        (q.id === idOrNumber || q.quoteNumber === idOrNumber) &&
        q.organizationId === session.activeOrganization.id
    );
    if (!quote) {
      throw new Error(`Quote '${idOrNumber}' not found.`);
    }
    return quote;
  }
}

export const quoteService = new QuoteService();
