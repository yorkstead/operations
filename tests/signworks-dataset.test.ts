import { describe, it, expect } from "bun:test";
import { signworksSeeder } from "../modules/demo/application/signworks-seeder";
import { SIGNWORKS_FIXTURE_DATA } from "../modules/demo/domain/signworks-scenario";
import { quoteService } from "../modules/quoting/application/quote-service";
import { jobService } from "../modules/jobs/application/job-service";
import { packetIntelligenceService } from "../modules/packet-intelligence/application/packet-intelligence-service";
import { purchasingService } from "../modules/purchasing/application/purchasing-service";
import { inventoryService } from "../modules/inventory/application/inventory-service";
import { shopfloorService } from "../modules/shopfloor/application/shopfloor-service";
import { qualityService } from "../modules/quality/application/quality-service";
import { packagingService } from "../modules/packaging/application/packaging-service";
import { shippingService } from "../modules/shipping/application/shipping-service";
import { fileService } from "../modules/core/application/file-service";
import { analyticsService } from "../modules/analytics/application/analytics-service";
import { activityService } from "../modules/core/application/activity-service";
import { SessionContext, Organization, User, Membership } from "../modules/core/domain/types";

describe("Mile High Signworks: Rich End-to-End Synthetic Dataset Suite", () => {
  const prodOrg: Organization = {
    id: "org_signworks_real_prod",
    name: "Mile High Signworks LLC (Production)",
    slug: "mile-high-signworks-prod",
    status: "active",
    isDemo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoOrg: Organization = {
    id: `org_${Date.now()}_signworks_demo`,
    name: "Mile High Signworks",
    slug: "mile-high-signworks",
    status: "active",
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUser: User = {
    id: "usr_tyler_cruz",
    email: "tyler@milehighsignworks.com",
    name: "Tyler Cruz",
    status: "active",
    isGlobalOwner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createMembership = (org: Organization): Membership => ({
    id: `mem_${org.id}_${mockUser.id}`,
    organizationId: org.id,
    userId: mockUser.id,
    role: "owner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const prodSession: SessionContext = {
    user: mockUser,
    activeOrganization: prodOrg,
    currentMembership: createMembership(prodOrg),
    allMemberships: [{ membership: createMembership(prodOrg), organization: prodOrg }],
  };

  const demoSession: SessionContext = {
    user: mockUser,
    activeOrganization: demoOrg,
    currentMembership: createMembership(demoOrg),
    allMemberships: [{ membership: createMembership(demoOrg), organization: demoOrg }],
  };

  it("STRICT SAFETY GUARDRAIL: Refuses to seed production customer organization", () => {
    expect(() => {
      signworksSeeder.seed(prodSession);
    }).toThrow("Forbidden: Cannot seed production customer organization");
  });

  it("STRICT SAFETY GUARDRAIL: Refuses to reset or clean production customer organization", () => {
    expect(() => {
      signworksSeeder.reset(prodSession);
    }).toThrow("Forbidden: Cannot");

    expect(() => {
      signworksSeeder.clean(prodSession);
    }).toThrow("Forbidden: Cannot clean production customer organization");
  });

  it("Successfully seeds the complete Mile High Signworks connected dataset into demo tenant", () => {
    const seedResult = signworksSeeder.seed(demoSession);
    expect(seedResult.success).toBe(true);
    expect(seedResult.totalRecordsSeeded).toBe(SIGNWORKS_FIXTURE_DATA.counts.totalConnectedRecords);

    // 1. Quoting Domain
    const quote = quoteService.getQuote(demoSession, `qte_${demoOrg.id}_sgn_09`);
    expect(quote).toBeDefined();
    expect(quote?.quoteNumber).toBe(SIGNWORKS_FIXTURE_DATA.seededRecords.quoteNumber);
    expect(quote?.status).toBe("converted_to_job");
    expect(quote?.convertedJobId).toBe(`job_${demoOrg.id}_sgn_09`);

    // 2. Jobs Domain
    const job = jobService.getJob(demoSession, `job_${demoOrg.id}_sgn_09`);
    expect(job).toBeDefined();
    expect(job?.jobNumber).toBe(SIGNWORKS_FIXTURE_DATA.seededRecords.jobNumber);
    expect(job?.currentRevision).toBe("C");

    // 3. Drawing Intelligence Packet
    const packetDocs = packetIntelligenceService.listDocuments(demoSession, { jobId: job.id });
    expect(packetDocs.length).toBeGreaterThanOrEqual(1);
    expect(packetDocs[0].extractionStatus).toBe("approved");

    // 4. Purchasing & Shortages
    const shortages = purchasingService.listShortages(demoSession);
    expect(shortages.length).toBeGreaterThanOrEqual(1);
    const po = purchasingService.getPurchaseOrder(demoSession, `po_${demoOrg.id}_sgn_04`);
    expect(po).toBeDefined();
    expect(po?.status).toBe("received_complete");

    // 5. Inventory Items
    const item = inventoryService.getItem(demoSession, "LED-HALO-3000K");
    expect(item).toBeDefined();
    expect(item?.standardCostCents).toBe(4200);

    // 6. Shopfloor Digital Traveler
    const traveler = shopfloorService.getTraveler(demoSession, `trv_${demoOrg.id}_sgn_09`);
    expect(traveler).toBeDefined();
    expect(traveler?.operations.length).toBe(4);

    // 7. Quality UL Checkpoint
    const inspection = qualityService.getInspection(demoSession, `insp_${demoOrg.id}_sgn_09`);
    expect(inspection).toBeDefined();
    expect(inspection?.status).toBe("passed");
    expect(inspection?.checklist.length).toBe(4);

    // 8. Packaging & Shipping
    const pkg = packagingService.getPackage(demoSession, SIGNWORKS_FIXTURE_DATA.seededRecords.packageNumber);
    expect(pkg).toBeDefined();
    expect(pkg?.grossWeightLbs).toBe(280.0);

    const manifest = shippingService.getManifest(demoSession, `shp_${demoOrg.id}_sgn_09`);
    expect(manifest).toBeDefined();
    expect(manifest?.status).toBe("delivered");
    expect(manifest?.stops[0].signedBy).toBe("Marcus Vance");

    // 9. Document Vault Files
    const files = fileService.listFiles(demoSession);
    expect(files.some((f) => f.id === `file_${demoOrg.id}_art_dwg`)).toBe(true);

    // 10. Planning Suggestion
    const suggestions = analyticsService.listSuggestions(demoSession);
    expect(suggestions.some((s) => s.id === `sug_${demoOrg.id}_crane_route`)).toBe(true);

    // 11. Activity Audit Events
    const activities = activityService.getRecentActivities(demoSession);
    expect(activities.length).toBeGreaterThanOrEqual(7);
  });

  it("Guarantees idempotent demo seeding with zero duplicate records", () => {
    const repeatResult = signworksSeeder.seed(demoSession);
    expect(repeatResult.success).toBe(true);
    expect(repeatResult.totalRecordsSeeded).toBe(0);
  });

  it("Maintains strict tenant isolation between production and demo organizations", () => {
    expect(() => quoteService.getQuote(prodSession, `qte_${demoOrg.id}_sgn_09`)).toThrow();
    expect(() => qualityService.getInspection(prodSession, `insp_${demoOrg.id}_sgn_09`)).toThrow();
  });

  it("Executes deterministic golden snapshot reset back to pristine state", () => {
    const resetResult = signworksSeeder.reset(demoSession);
    expect(resetResult.success).toBe(true);
    expect(resetResult.totalRecordsSeeded).toBe(SIGNWORKS_FIXTURE_DATA.counts.totalConnectedRecords);

    const reloadedJob = jobService.getJob(demoSession, `job_${demoOrg.id}_sgn_09`);
    expect(reloadedJob).toBeDefined();
  });
});
