import { describe, expect, it } from "bun:test";
import { KnowledgeService } from "../modules/knowledge/application/knowledge-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const knowledgeService = new KnowledgeService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "safety_officer@acme.com",
  name: "Safety Officer",
  organizationName: "Acme Safety Org",
  organizationSlug: "acme-safety",
});

identityService.createOrganization(userA.id, "Rival Factory", "rival-factory");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("Knowledge Base & SOP Vertical Slice: Structured Procedures, Cited Search & IDOR", () => {
  let createdArticleCode: string;

  it("creates a draft procedure with structured safety steps", () => {
    const draft = knowledgeService.createArticleDraft(tenantA, {
      category: "equipment_troubleshooting",
      title: "CNC Spindle Bearing Overheat Protocol",
      tags: ["cnc", "spindle", "bearing", "troubleshooting"],
      linkedEquipmentCodes: ["EQ-MILL-01"],
      content: "Diagnostic troubleshooting protocol for spindle temperature spikes.",
      structuredSteps: [
        {
          stepNumber: 1,
          title: "Thermal Infrared Imaging",
          instruction: "Measure front and rear spindle bearing caps using calibrated FLIR thermal camera.",
          safetyWarning: "Keep hands clear of rotating chuck during thermal measurement.",
        },
        {
          stepNumber: 2,
          title: "Chiller Flow Inspection",
          instruction: "Verify chiller supply temperature is 18C +/- 1C and flow rate exceeds 4.5 LPM.",
        },
      ],
    });

    createdArticleCode = draft.articleCode;
    expect(draft.articleCode).toContain("KNOW-");
    expect(draft.status).toBe("draft");
    expect(draft.revisions[0].structuredSteps.length).toBe(2);
    expect(draft.revisions[0].structuredSteps[0].safetyWarning).toBeDefined();
  });

  it("publishes procedure revision and stamps reviewer attribution", () => {
    const published = knowledgeService.publishArticleRevision(tenantA, createdArticleCode);
    expect(published.status).toBe("published");
    expect(published.revisions[0].reviewedByUserId).toBe(tenantA.user.id);
    expect(published.revisions[0].approvedAt).toBeDefined();
  });

  it("performs grounded cited search and extracts exact passage citation", () => {
    const queryRes = knowledgeService.searchAndAnswerQuery(tenantA, "bearing overheat");
    expect(queryRes.confidenceScore).toBeGreaterThanOrEqual(0.35);
    expect(queryRes.citedPassages.length).toBeGreaterThan(0);
    expect(queryRes.citedPassages[0].articleCode).toBe(createdArticleCode);
    expect(queryRes.citedPassages[0].passageText).toContain("spindle bearing caps");
  });

  it("emits uncertainty warning on out-of-domain queries", () => {
    const missing = knowledgeService.searchAndAnswerQuery(tenantA, "quantum hyperdrive plasma containment");
    expect(missing.confidenceScore).toBeLessThan(0.35);
    expect(missing.uncertaintyWarning).toBeDefined();
    expect(missing.citedPassages.length).toBe(0);
  });

  it("strictly enforces tenant boundary and denies cross-tenant procedure retrieval (IDOR)", () => {
    const orgBArticles = knowledgeService.listArticles(tenantB);
    expect(orgBArticles.some((a) => a.articleCode === createdArticleCode)).toBe(false);
  });
});
