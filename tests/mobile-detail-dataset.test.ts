import { describe, it, expect } from "bun:test";
import { mobileDetailSeeder } from "../modules/demo/application/mobile-detail-seeder";
import { MOBILE_DETAIL_FIXTURE_DATA } from "../modules/demo/domain/mobile-detail-scenario";
import { quoteService } from "../modules/quoting/application/quote-service";
import { jobService } from "../modules/jobs/application/job-service";
import { inventoryService } from "../modules/inventory/application/inventory-service";
import { shopfloorService } from "../modules/shopfloor/application/shopfloor-service";
import { qualityService } from "../modules/quality/application/quality-service";
import { packagingService } from "../modules/packaging/application/packaging-service";
import { fileService } from "../modules/core/application/file-service";
import { analyticsService } from "../modules/analytics/application/analytics-service";
import { activityService } from "../modules/core/application/activity-service";
import { SessionContext, Organization, User, Membership } from "../modules/core/domain/types";

describe("Peak Mobile Detail: Rich End-to-End Synthetic Dataset Suite", () => {
  const prodOrg: Organization = {
    id: "org_mobile_detail_real_prod",
    name: "Peak Mobile Detail Services (Production)",
    slug: "peak-mobile-detail-prod",
    status: "active",
    isDemo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const demoOrg: Organization = {
    id: `org_${Date.now()}_mobile_detail_demo`,
    name: "Peak Mobile Detail",
    slug: "peak-mobile-detail",
    status: "active",
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUser: User = {
    id: "usr_austin_ramirez",
    email: "austin@peakmobiledetail.com",
    name: "Austin Ramirez",
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
      mobileDetailSeeder.seed(prodSession);
    }).toThrow("Forbidden: Cannot seed production customer organization");
  });

  it("STRICT SAFETY GUARDRAIL: Refuses to reset or clean production customer organization", () => {
    expect(() => {
      mobileDetailSeeder.reset(prodSession);
    }).toThrow("Forbidden: Cannot");

    expect(() => {
      mobileDetailSeeder.clean(prodSession);
    }).toThrow("Forbidden: Cannot clean production customer organization");
  });

  it("Successfully seeds the complete Peak Mobile Detail connected dataset into demo tenant", () => {
    const seedResult = mobileDetailSeeder.seed(demoSession);
    expect(seedResult.success).toBe(true);
    expect(seedResult.totalRecordsSeeded).toBe(MOBILE_DETAIL_FIXTURE_DATA.counts.totalConnectedRecords);

    // 1. Quoting Domain
    const quote = quoteService.getQuote(demoSession, `qte_${demoOrg.id}_dtl_104`);
    expect(quote).toBeDefined();
    expect(quote?.quoteNumber).toBe(MOBILE_DETAIL_FIXTURE_DATA.seededRecords.quoteNumber);
    expect(quote?.status).toBe("converted_to_job");
    expect(quote?.convertedJobId).toBe(`job_${demoOrg.id}_dtl_104`);

    // 2. Jobs Domain
    const job = jobService.getJob(demoSession, `job_${demoOrg.id}_dtl_104`);
    expect(job).toBeDefined();
    expect(job?.jobNumber).toBe(MOBILE_DETAIL_FIXTURE_DATA.seededRecords.jobNumber);

    // 3. Inventory Items
    const item = inventoryService.getItem(demoSession, "CHEM-CERAMIC-50ML");
    expect(item).toBeDefined();
    expect(item?.standardCostCents).toBe(11000);

    // 4. Shopfloor / Field Service Digital Traveler
    const traveler = shopfloorService.getTraveler(demoSession, `trv_${demoOrg.id}_dtl_104`);
    expect(traveler).toBeDefined();
    expect(traveler?.operations.length).toBe(4);

    // 5. Quality Inspection & Gloss Depth Checkpoint
    const inspection = qualityService.getInspection(demoSession, `insp_${demoOrg.id}_dtl_104`);
    expect(inspection).toBeDefined();
    expect(inspection?.status).toBe("passed");
    expect(inspection?.checklist.length).toBe(4);

    // 6. Packaging & Customer Aftercare Kit
    const pkg = packagingService.getPackage(demoSession, MOBILE_DETAIL_FIXTURE_DATA.seededRecords.packageNumber);
    expect(pkg).toBeDefined();
    expect(pkg?.grossWeightLbs).toBe(4.0);

    // 7. Document Vault Files
    const files = fileService.listFiles(demoSession);
    expect(files.some((f) => f.id === `file_${demoOrg.id}_photos_audit`)).toBe(true);
    expect(files.some((f) => f.id === `file_${demoOrg.id}_ceramic_warranty`)).toBe(true);

    // 8. Planning Suggestion
    const suggestions = analyticsService.listSuggestions(demoSession);
    expect(suggestions.some((s) => s.id === `sug_${demoOrg.id}_van_route`)).toBe(true);

    // 9. Activity Audit Events
    const activities = activityService.getRecentActivities(demoSession);
    expect(activities.length).toBeGreaterThanOrEqual(8);
  });

  it("Guarantees idempotent demo seeding with zero duplicate records", () => {
    const repeatResult = mobileDetailSeeder.seed(demoSession);
    expect(repeatResult.success).toBe(true);
    expect(repeatResult.totalRecordsSeeded).toBe(0);
  });

  it("Maintains strict tenant isolation between production and demo organizations", () => {
    expect(() => quoteService.getQuote(prodSession, `qte_${demoOrg.id}_dtl_104`)).toThrow();
    expect(() => qualityService.getInspection(prodSession, `insp_${demoOrg.id}_dtl_104`)).toThrow();
  });

  it("Executes deterministic golden snapshot reset back to pristine state", () => {
    const resetResult = mobileDetailSeeder.reset(demoSession);
    expect(resetResult.success).toBe(true);
    expect(resetResult.totalRecordsSeeded).toBe(MOBILE_DETAIL_FIXTURE_DATA.counts.totalConnectedRecords);

    const reloadedJob = jobService.getJob(demoSession, `job_${demoOrg.id}_dtl_104`);
    expect(reloadedJob).toBeDefined();
  });
});
