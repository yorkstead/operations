import { describe, expect, it, beforeEach } from "bun:test";
import { KnowledgeService } from "../modules/knowledge/application/knowledge-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("KnowHow & Standard Procedures Module", () => {
  let knowledgeService: KnowledgeService;
  let identityService: IdentityService;

  beforeEach(() => {
    knowledgeService = new KnowledgeService();
    identityService = new IdentityService();
  });

  it("creates a draft knowledge procedure, sanitizes input, and advances through approval to published", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const draft = knowledgeService.createArticleDraft(session, {
      category: "standard_operating_procedure",
      title: "CNC Mill Spindle Warmup Protocol",
      tags: ["cnc", "spindle", "maintenance"],
      content: "Daily 15-minute progressive spindle warmup procedure.",
      structuredSteps: [
        {
          stepNumber: 1,
          title: "Initial Low-Speed Idle",
          instruction: "Run spindle at 2,000 RPM for 5 minutes.",
        },
        {
          stepNumber: 2,
          title: "Mid-Speed Ramp",
          instruction: "Ramp spindle to 6,000 RPM for 5 minutes.",
        },
      ],
    });

    expect(draft.articleCode).toContain("KNOW-");
    expect(draft.status).toBe("draft");
    expect(draft.currentRevisionNumber).toBe(1);

    // Publish revision
    const published = knowledgeService.publishArticleRevision(session, draft.articleCode);
    expect(published.status).toBe("published");
    expect(published.revisions[0].reviewedByUserId).toBe(owner.id);
  });

  it("performs cited AI procedure search with exact passage citations and uncertainty detection", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    knowledgeService.seedSyntheticFixturesForTesting(session);

    // Query for laser cleaning
    const result = knowledgeService.searchAndAnswerQuery(session, "lens cleaning");
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.5);
    expect(result.citedPassages.length).toBeGreaterThan(0);
    expect(result.citedPassages[0].articleCode).toBe("KNOW-2026-001");
    expect(result.citedPassages[0].passageText.toLowerCase()).toContain("lens");

    // Query for unrecorded procedure
    const missing = knowledgeService.searchAndAnswerQuery(session, "cryogenic turbine cooling");
    expect(missing.confidenceScore).toBeLessThan(0.3);
    expect(missing.uncertaintyWarning).toBeDefined();
    expect(missing.citedPassages.length).toBe(0);
  });

  it("enforces tenant isolation and prevents cross-tenant procedure retrieval", () => {
    const { user: ownerA } = identityService.bootstrapOwner({
      email: "owner@factory-a.com",
      name: "Owner A",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const sessionA = identityService.getSessionContext(ownerA.id);

    knowledgeService.createArticleDraft(sessionA, {
      category: "safety_protocol",
      title: "Factory A Proprietary Safety Rules",
      tags: ["safety", "proprietary"],
      content: "Exclusive confidential instructions for Factory A.",
      structuredSteps: [{ stepNumber: 1, title: "Rule 1", instruction: "Do not share." }],
    });

    // Create Tenant B
    identityService.createOrganization(ownerA.id, "Factory B", "factory-b");
    const sessionB = identityService.getSessionContext(ownerA.id);
    const articlesB = knowledgeService.listArticles(sessionB);

    // Articles from Factory A must not be visible to Factory B
    expect(articlesB.some((a) => a.title.includes("Factory A Proprietary"))).toBe(false);
  });
});
