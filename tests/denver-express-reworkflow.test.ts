import { describe, expect, it, beforeEach } from "bun:test";
import { QuoteService } from "../modules/quoting/application/quote-service";
import { EngagementService } from "../modules/engagements/application/engagement-service";
import { IdentityService } from "../modules/core/application/identity-service";
import { SyntheticEmailAdapter } from "../modules/core/domain/ports/email-port";
import { SessionContext } from "../modules/core/domain/types";

describe("Prompt 03: Denver Express ReworkFlow & Field Hardware Dispatch", () => {
  let quoteService: QuoteService;
  let engagementService: EngagementService;
  let identityService: IdentityService;
  let yorksteadSession: SessionContext;

  beforeEach(() => {
    quoteService = new QuoteService();
    engagementService = new EngagementService();
    identityService = new IdentityService(new SyntheticEmailAdapter());

    const tenant0 = identityService.ensureTenantZero();
    yorksteadSession = identityService.getSessionContext(tenant0.user.id);
  });

  it("verifies Denver Express ReworkFlow proposal (QTE-2026-090) in quoting pipeline", () => {
    const quotes = quoteService.listQuotes(yorksteadSession);
    const denverQuote = quotes.find((q) => q.quoteNumber === "QTE-2026-090");

    expect(denverQuote).toBeDefined();
    expect(denverQuote?.customerName).toContain("Denver Express");
    expect(denverQuote?.status).toBe("approved");

    const rev = denverQuote?.revisions[0];
    expect(rev).toBeDefined();
    expect(rev?.totalAmountCents).toBe(950000); // $9,500.00
    expect(rev?.overallMarginPercent).toBe(42.0);

    const consulting = denverQuote?.consultingScope;
    expect(consulting).toBeDefined();
    expect(consulting?.costModelType).toBe("custom_software_milestone");
    expect(consulting?.estimatedEngineeringHours).toBe(58);
    expect(consulting?.paymentMilestones.length).toBe(3);

    // Verify 50% / 30% / 20% milestone schedule
    const milestones = consulting?.paymentMilestones || [];
    expect(milestones[0].percentage).toBe(50);
    expect(milestones[0].amountCents).toBe(475000); // $4,750.00
    expect(milestones[1].percentage).toBe(30);
    expect(milestones[1].amountCents).toBe(285000); // $2,850.00
    expect(milestones[2].percentage).toBe(20);
    expect(milestones[2].amountCents).toBe(190000); // $1,900.00
  });

  it("verifies Denver Express engagement with milestones and staging status", () => {
    const engagements = engagementService.listEngagements(yorksteadSession);
    const deEngagement = engagements.find((e) => e.id === "eng_denver_express_reworkflow");

    expect(deEngagement).toBeDefined();
    expect(deEngagement?.stage).toBe("staging_qa");
    expect(deEngagement?.stagingUrl).toBe("https://rework.yorkstead.com");
    expect(deEngagement?.repositoryUrl).toBe("https://github.com/yorkstead/rework-flow.git");
    expect(deEngagement?.contractValueCents).toBe(950000);

    // Verify 3 milestone checkpoints
    expect(deEngagement?.milestones.length).toBe(3);
    expect(deEngagement?.milestones[0].completed).toBe(true);
    expect(deEngagement?.milestones[1].completed).toBe(true);
    expect(deEngagement?.milestones[2].completed).toBe(false);

    // Verify 5 deliverables
    expect(deEngagement?.deliverables.length).toBe(5);
    const completedDelivs = deEngagement?.deliverables.filter((d) => d.status === "completed") || [];
    expect(completedDelivs.length).toBe(3);

    // Verify file vault attachments
    expect(deEngagement?.fileVault.length).toBe(2);
    expect(deEngagement?.fileVault[0].filename).toBe("Denver_Express_ReworkFlow_Master_Brief.pdf");
  });
});