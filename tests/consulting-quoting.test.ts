import { describe, expect, it, beforeEach } from "bun:test";
import { QuoteService } from "../modules/quoting/application/quote-service";
import { IdentityService } from "../modules/core/application/identity-service";
import { SyntheticEmailAdapter } from "../modules/core/domain/ports/email-port";
import { SessionContext } from "../modules/core/domain/types";

describe("Consulting Quoting & Proposal Cost-Modeling Module", () => {
  let quoteService: QuoteService;
  let identityService: IdentityService;
  let yorksteadSession: SessionContext;

  beforeEach(() => {
    quoteService = new QuoteService();
    identityService = new IdentityService(new SyntheticEmailAdapter());

    const tenant0 = identityService.ensureTenantZero();
    yorksteadSession = identityService.getSessionContext(tenant0.user.id);
  });

  it("calculates fixed-price Discovery & Workflow Audit with 50/50 payment milestones", () => {
    const proposal = quoteService.createConsultingProposal(yorksteadSession, {
      customerId: "cust_front_range",
      customerName: "Front Range Precision MFG",
      customerContactEmail: "m.vance@frontrangemfg.com",
      title: "Shopfloor Automation Discovery & Architecture Audit",
      costModelType: "discovery_audit",
      estimatedEngineeringHours: 40,
      hourlyRateCents: 17500, // $175.00/hr -> $7,000 cost
      cloudComputePassThroughCents: 0,
      deliverableSummary: ["Architecture Scoping", "Gap Analysis", "SOW Roadmap"],
      targetMarginPercent: 40, // $7,000 / 0.6 = $11,667 fee
    });

    expect(proposal.quoteNumber).toContain("PROP-");
    expect(proposal.status).toBe("draft");
    expect(proposal.consultingScope).toBeDefined();
    expect(proposal.consultingScope?.costModelType).toBe("discovery_audit");

    const rev = proposal.revisions[0];
    expect(rev.overallMarginPercent).toBe(40);
    expect(rev.totalAmountCents).toBe(1166667); // $11,666.67 in cents

    // Check payment milestones (50% Kickoff / 50% Delivery)
    const milestones = proposal.consultingScope!.paymentMilestones;
    expect(milestones.length).toBe(2);
    expect(milestones[0].percentage).toBe(50);
    expect(milestones[1].percentage).toBe(50);
    expect(milestones[0].amountCents + milestones[1].amountCents).toBe(rev.totalAmountCents);

    // Verify Cloudflare R2 reference
    expect(proposal.consultingScope?.proposalPdfR2Key).toContain("r2://proposals/");
  });

  it("calculates Milestone-Based Custom Software Development with 30/30/40 payment schedule", () => {
    const proposal = quoteService.createConsultingProposal(yorksteadSession, {
      customerId: "cust_summit",
      customerName: "Summit Facility Services",
      customerContactEmail: "ops@summitfacility.com",
      title: "Multi-Facility Janitorial QR Dispatch & Inspection App",
      costModelType: "custom_software_milestone",
      estimatedEngineeringHours: 200,
      hourlyRateCents: 17500, // $35,000 labor
      cloudComputePassThroughCents: 50000, // $500 compute
      deliverableSummary: ["Offline PWA", "Dispatch Engine", "Client Portal"],
      targetMarginPercent: 45,
    });

    expect(proposal.consultingScope?.costModelType).toBe("custom_software_milestone");
    const milestones = proposal.consultingScope!.paymentMilestones;
    expect(milestones.length).toBe(3);
    expect(milestones[0].percentage).toBe(30); // Kickoff Deposit
    expect(milestones[1].percentage).toBe(30); // Staging Preview
    expect(milestones[2].percentage).toBe(40); // Production Cutover
  });

  it("calculates Monthly Retainer Infrastructure & Maintenance SLA", () => {
    const proposal = quoteService.createConsultingProposal(yorksteadSession, {
      customerId: "cust_alpine",
      customerName: "Alpine Robotics",
      customerContactEmail: "sarah@alpinerobotics.com",
      title: "24/7 Cloud Run & Neon Postgres Telemetry SLA",
      costModelType: "monthly_sla_retainer",
      estimatedEngineeringHours: 15,
      hourlyRateCents: 20000, // $3,000 labor
      cloudComputePassThroughCents: 30000, // $300 compute
      deliverableSummary: ["99.9% Uptime SLA", "Automated Backups", "Security Patching"],
      targetMarginPercent: 50,
    });

    expect(proposal.consultingScope?.costModelType).toBe("monthly_sla_retainer");
    const milestones = proposal.consultingScope!.paymentMilestones;
    expect(milestones.length).toBe(1);
    expect(milestones[0].percentage).toBe(100);
    expect(milestones[0].triggerCondition).toBe("1st of Each Month");
  });

  it("flags proposals with margin under 25% for mandatory executive review", () => {
    const proposal = quoteService.createConsultingProposal(yorksteadSession, {
      customerId: "cust_discount",
      customerName: "Discount Client",
      customerContactEmail: "cheap@client.com",
      title: "Discounted Software Build",
      costModelType: "custom_software_milestone",
      estimatedEngineeringHours: 100,
      hourlyRateCents: 17500,
      targetMarginPercent: 15, // Below 25% floor
      deliverableSummary: ["Quick Build"],
    });

    expect(proposal.requiresExecutiveApproval).toBe(true);
    expect(proposal.status).toBe("internal_review");
  });
});
