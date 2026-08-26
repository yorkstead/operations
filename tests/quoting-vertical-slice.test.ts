import { describe, expect, it } from "bun:test";
import { QuoteService } from "../modules/quoting/application/quote-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const quoteService = new QuoteService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "estimator_lead@acme.com",
  name: "Estimator Lead",
  organizationName: "Acme Estimating",
  organizationSlug: "acme-estimating",
});

identityService.createOrganization(userA.id, "Rival Estimators", "rival-estimators");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("QuoteFlow & Estimating Vertical Slice: Cost Models, Margins, Job Handoff & IDOR", () => {
  let createdQuoteNumber: string;

  it("creates quote estimate with multi-tier integer cents cost breakdown", () => {
    const quote = quoteService.createQuote(tenantA, {
      customerId: "cust_aerospace",
      customerName: "Alpine Aerospace",
      customerContactEmail: "buyer@alpine.com",
      title: "Precision Titanium Brackets Run",
      lineItems: [
        {
          partDescription: "Titanium Bracket",
          quantity: 20,
          materialCostCents: 6000,
          laborCostCents: 4000,
          machineCostCents: 2000,
          targetMarginPercent: 35,
        },
      ],
    });

    createdQuoteNumber = quote.quoteNumber;
    expect(quote.quoteNumber).toContain("QTE-");
    expect(quote.status).toBe("draft");
    expect(quote.revisions[0].lineItems[0].costBreakdown.totalCostCents).toBe(12000);
    expect(quote.revisions[0].lineItems[0].unitPriceCents).toBe(18462); // 12000 / (1 - 0.35)
  });

  it("enforces margin floor policy (< 25%) and requires executive approval", () => {
    const lowMarginQuote = quoteService.createQuote(tenantA, {
      customerId: "cust_budget",
      customerName: "Budget Metalworks",
      customerContactEmail: "procure@budget.com",
      title: "Discounted High-Volume Run",
      lineItems: [
        {
          partDescription: "Basic Bracket",
          quantity: 100,
          materialCostCents: 1000,
          laborCostCents: 500,
          machineCostCents: 500,
          targetMarginPercent: 15,
        },
      ],
    });

    expect(lowMarginQuote.status).toBe("internal_review");
    expect(lowMarginQuote.requiresExecutiveApproval).toBe(true);

    const approved = quoteService.approveQuote(tenantA, lowMarginQuote.quoteNumber);
    expect(approved.status).toBe("approved");
    expect(approved.approvedByUserId).toBe(tenantA.user.id);
  });

  it("converts accepted quote into live production job idempotently", () => {
    const { quote: converted, jobId } = quoteService.acceptQuoteAndHandoffToJob(tenantA, createdQuoteNumber);
    expect(converted.status).toBe("converted_to_job");
    expect(converted.convertedJobId).toBe(jobId);

    const secondCall = quoteService.acceptQuoteAndHandoffToJob(tenantA, createdQuoteNumber);
    expect(secondCall.jobId).toBe(jobId);
  });

  it("strictly enforces tenant boundary and denies cross-tenant quote lookups (IDOR)", () => {
    const orgBQuotes = quoteService.listQuotes(tenantB);
    expect(orgBQuotes.some((q) => q.quoteNumber === createdQuoteNumber)).toBe(false);
  });
});
