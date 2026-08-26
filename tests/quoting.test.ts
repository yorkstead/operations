import { describe, expect, it, beforeEach } from "bun:test";
import { QuoteService } from "../modules/quoting/application/quote-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("QuoteFlow & Estimating Module", () => {
  let quoteService: QuoteService;
  let identityService: IdentityService;

  beforeEach(() => {
    quoteService = new QuoteService();
    identityService = new IdentityService();
  });

  it("calculates cost breakdown, unit prices, and overall margins in integer cents", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const quote = quoteService.createQuote(session, {
      customerId: "cust_1",
      customerName: "Alpine Aerospace",
      customerContactEmail: "buyer@alpine.com",
      title: "Titanium Brackets RFQ",
      lineItems: [
        {
          partDescription: "Titanium Bracket",
          quantity: 10,
          materialCostCents: 5000, // $50.00
          laborCostCents: 3000,    // $30.00
          machineCostCents: 2000,  // $20.00
          targetMarginPercent: 30, // 30% margin -> total cost $100 / (1 - 0.3) = $142.86 -> 14286 cents
        },
      ],
    });

    expect(quote.quoteNumber).toContain("QTE-");
    expect(quote.status).toBe("draft");
    expect(quote.revisions.length).toBe(1);

    const rev = quote.revisions[0];
    expect(rev.lineItems[0].costBreakdown.totalCostCents).toBe(10000);
    expect(rev.lineItems[0].unitPriceCents).toBe(14286);
    expect(rev.totalAmountCents).toBe(142860); // 10 * 14286
    expect(rev.overallMarginPercent).toBe(30);
  });

  it("enforces margin threshold policy and flags low-margin quotes for executive review", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    // Target margin 15% is below 25% floor
    const quote = quoteService.createQuote(session, {
      customerId: "cust_2",
      customerName: "Budget Metalworks",
      customerContactEmail: "procure@budget.com",
      title: "Discounted Flanges",
      lineItems: [
        {
          partDescription: "Mild Steel Plate",
          quantity: 100,
          materialCostCents: 1000,
          laborCostCents: 500,
          machineCostCents: 500,
          targetMarginPercent: 15,
        },
      ],
    });

    expect(quote.status).toBe("internal_review");
    expect(quote.requiresExecutiveApproval).toBe(true);

    // Approve with owner credentials
    const approved = quoteService.approveQuote(session, quote.quoteNumber);
    expect(approved.status).toBe("approved");
    expect(approved.approvedByUserId).toBe(owner.id);
  });

  it("converts accepted quote to live job idempotently", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const quote = quoteService.createQuote(session, {
      customerId: "cust_1",
      customerName: "Alpine Aerospace",
      customerContactEmail: "buyer@alpine.com",
      title: "Laser Parts Run",
      lineItems: [
        {
          partDescription: "Laser Flange",
          drawingNumber: "DWG-109",
          quantity: 25,
          materialCostCents: 2000,
          laborCostCents: 1000,
          machineCostCents: 1000,
          targetMarginPercent: 35,
        },
      ],
    });

    const { quote: converted, jobId } = quoteService.acceptQuoteAndHandoffToJob(session, quote.quoteNumber);
    expect(converted.status).toBe("converted_to_job");
    expect(converted.convertedJobId).toBe(jobId);

    // Second call is idempotent
    const secondCall = quoteService.acceptQuoteAndHandoffToJob(session, quote.quoteNumber);
    expect(secondCall.jobId).toBe(jobId);
  });
});
