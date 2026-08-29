import { describe, expect, it } from "bun:test";
import { DemoSeedingService } from "../modules/demo/application/demo-seeding-service";
import { frontRangeSeeder } from "../modules/demo/application/front-range-seeder";
import { FRONT_RANGE_FIXTURE_DATA } from "../modules/demo/domain/front-range-scenario";
import { IdentityService } from "../modules/core/application/identity-service";
import { quoteService } from "../modules/quoting/application/quote-service";
import { jobService } from "../modules/jobs/application/job-service";
import { packetIntelligenceService } from "../modules/packet-intelligence/application/packet-intelligence-service";
import { purchasingService } from "../modules/purchasing/application/purchasing-service";
import { inventoryService } from "../modules/inventory/application/inventory-service";
import { shopfloorService } from "../modules/shopfloor/application/shopfloor-service";
import { qualityService } from "../modules/quality/application/quality-service";
import { maintenanceService } from "../modules/maintenance/application/maintenance-service";
import { packagingService } from "../modules/packaging/application/packaging-service";
import { shippingService } from "../modules/shipping/application/shipping-service";
import { fileService } from "../modules/core/application/file-service";
import { analyticsService } from "../modules/analytics/application/analytics-service";
import { activityService } from "../modules/core/application/activity-service";

describe("Front Range Precision Manufacturing: Rich End-to-End Synthetic Dataset Suite", () => {
  const identityService = new IdentityService();
  const demoSeedingService = new DemoSeedingService();

  // 1. Production Customer Tenant Setup (Must NEVER receive synthetic seeds)
  const { user: prodUser } = identityService.bootstrapOwner({
    email: "sarah.director@frontrangemfg-live.com",
    name: "Sarah Lin (Live)",
    organizationName: "Front Range Real Production",
    organizationSlug: "front-range-live-prod",
  });
  const prodSession = identityService.getSessionContext(prodUser.id);
  prodSession.activeOrganization.isDemo = false;

  // 2. Demo Sandbox Tenant Setup (Explicitly marked isDemo: true)
  const demoOrg = identityService.createOrganization(
    prodUser.id,
    "Front Range Precision Manufacturing",
    "front-range-manufacturing"
  );
  demoOrg.isDemo = true;

  const demoSession = identityService.switchActiveOrganization(prodUser.id, demoOrg.id);
  demoSession.activeOrganization.isDemo = true;

  it("STRICT SAFETY GUARDRAIL: Refuses to seed production customer organization", () => {
    expect(() => {
      demoSeedingService.seedDemoOrganization(prodSession);
    }).toThrow("Forbidden: Cannot seed production customer organization");

    expect(() => {
      frontRangeSeeder.seed(prodSession);
    }).toThrow("Forbidden: Cannot seed production customer organization");
  });

  it("STRICT SAFETY GUARDRAIL: Refuses to reset or clean production customer organization", () => {
    expect(() => {
      demoSeedingService.resetDemoOrganization(prodSession);
    }).toThrow("Forbidden: Cannot");

    expect(() => {
      demoSeedingService.cleanDemoOrganization(prodSession);
    }).toThrow("Forbidden: Cannot clean production customer organization");
  });

  it("Successfully seeds the complete 60-record Front Range connected storyline into demo tenant", () => {
    const seedResult = demoSeedingService.seedDemoOrganization(demoSession);
    expect(seedResult.success).toBe(true);
    expect(seedResult.seededEntitiesCount).toBe(FRONT_RANGE_FIXTURE_DATA.counts.totalConnectedRecords);

    // Verify Quote domain
    const quote = quoteService.getQuote(demoSession, `qte_${demoOrg.id}_088`);
    expect(quote).toBeDefined();
    expect(quote?.quoteNumber).toBe(FRONT_RANGE_FIXTURE_DATA.seededRecords.quoteNumber);
    expect(quote?.status).toBe("converted_to_job");
    expect(quote?.convertedJobId).toBe(`job_${demoOrg.id}_104`);

    // Verify Job domain
    const job = jobService.getJob(demoSession, `job_${demoOrg.id}_104`);
    expect(job).toBeDefined();
    expect(job?.jobNumber).toBe(FRONT_RANGE_FIXTURE_DATA.seededRecords.jobNumber);
    expect(job?.currentRevision).toBe("B");
    expect(job?.priority).toBe("rush");

    // Verify Job Packet / Drawing domain
    const packetDocs = packetIntelligenceService.listDocuments(demoSession, { jobId: job.id });
    expect(packetDocs.length).toBeGreaterThanOrEqual(1);
    const packetDoc = packetDocs[0];
    expect(packetDoc.id).toBe(`doc_pkt_${demoOrg.id}_104`);
    expect(packetDoc.extractionStatus).toBe("approved");

    // Verify Purchasing & Shortage domain
    const shortages = purchasingService.listShortages(demoSession);
    expect(shortages.some((s) => s.itemCode === FRONT_RANGE_FIXTURE_DATA.seededRecords.shortageItemCode)).toBe(true);

    const pos = purchasingService.listPurchaseOrders(demoSession);
    const po = pos.find((p) => p.poNumber === FRONT_RANGE_FIXTURE_DATA.seededRecords.purchaseOrderNumber);
    expect(po).toBeDefined();
    expect(po?.poNumber).toBe(FRONT_RANGE_FIXTURE_DATA.seededRecords.purchaseOrderNumber);
    expect(po?.status).toBe("received_complete");
    expect(po?.lineItems[0].linkedJobId).toBe(job.id);

    // Verify Inventory & Movement domain
    const stock = inventoryService.listStock(demoSession);
    expect(stock.items.some((i) => i.itemCode === FRONT_RANGE_FIXTURE_DATA.seededRecords.shortageItemCode)).toBe(true);

    const locations = inventoryService.listLocations(demoSession);
    expect(locations.length).toBeGreaterThanOrEqual(4);

    // Verify Shopfloor Digital Traveler domain
    const traveler = shopfloorService.getTraveler(demoSession, `trv_${demoOrg.id}_104`);
    expect(traveler).toBeDefined();
    expect(traveler?.travelerNumber).toBe(FRONT_RANGE_FIXTURE_DATA.seededRecords.travelerNumber);
    expect(traveler?.operations.length).toBe(4);
    expect(traveler?.operations[0].completedQuantity).toBe(50);
    expect(traveler?.operations[1].completedQuantity).toBe(48);
    expect(traveler?.operations[1].scrappedQuantity).toBe(2);

    // Verify Quality & NCR domain
    const inspection = qualityService.getInspection(demoSession, `insp_${demoOrg.id}_044`);
    expect(inspection).toBeDefined();
    expect(inspection?.status).toBe("passed_with_concession");
    expect(inspection?.checklist.length).toBe(3);

    const ncr = qualityService.getNCR(demoSession, `ncr_${demoOrg.id}_012`);
    expect(ncr).toBeDefined();
    expect(ncr?.ncrNumber).toBe(FRONT_RANGE_FIXTURE_DATA.seededRecords.ncrNumber);
    expect(ncr?.disposition).toBe("rework");

    // Verify Maintenance & Asset domain
    const equipment = maintenanceService.getEquipment(demoSession, "EQ-LASER-01");
    expect(equipment).toBeDefined();
    expect(equipment?.status).toBe("operational");

    const downtimes = maintenanceService.listDowntimes(demoSession, { assetTag: "EQ-LASER-01" });
    expect(downtimes.length).toBeGreaterThanOrEqual(1);
    expect(downtimes[0].durationMinutes).toBe(35);

    const workOrders = maintenanceService.listWorkOrders(demoSession, { assetTag: "EQ-LASER-01" });
    const wo = workOrders.find((w) => w.workOrderNumber === FRONT_RANGE_FIXTURE_DATA.seededRecords.workOrderNumber);
    expect(wo).toBeDefined();
    expect(wo?.status).toBe("closed_returned_to_service");

    // Verify Packaging & Palletization domain
    const packages = packagingService.listPackages(demoSession);
    const crate = packages.find((p) => p.packageNumber === FRONT_RANGE_FIXTURE_DATA.seededRecords.packageNumber);
    expect(crate).toBeDefined();
    expect(crate?.containerType).toBe("crate");
    expect(crate?.grossWeightLbs).toBe(405.0);
    expect(crate?.status).toBe("sealed_ready_for_shipping");
    expect(crate?.items[0].jobId).toBe(job.id);

    // Verify Shipping & Manifest domain
    const manifest = shippingService.getManifest(demoSession, `shp_${demoOrg.id}_088`);
    expect(manifest).toBeDefined();
    expect(manifest?.manifestNumber).toBe(FRONT_RANGE_FIXTURE_DATA.seededRecords.manifestNumber);
    expect(manifest?.status).toBe("delivered");
    expect(manifest?.stops[0].signedBy).toBe("R. Sterling");

    // Verify File Storage Vault domain
    const files = fileService.listFiles(demoSession);
    expect(files.some((f) => f.id === `file_${demoOrg.id}_dwg`)).toBe(true);
    expect(files.some((f) => f.id === `file_${demoOrg.id}_mtr`)).toBe(true);
    expect(files.some((f) => f.id === `file_${demoOrg.id}_fai`)).toBe(true);

    // Verify Analytics & Capacity Planning domain
    const suggestions = analyticsService.listSuggestions(demoSession);
    expect(suggestions.some((s) => s.id === `sug_${demoOrg.id}_001`)).toBe(true);

    // Verify Activity & Audit Trail domain
    const activityEvents = activityService.getRecentActivities(demoOrg.id, 20);
    expect(activityEvents.length).toBeGreaterThanOrEqual(12);
  });

  it("Guarantees idempotent demo seeding with zero duplicate mutations", () => {
    const repeatResult = demoSeedingService.seedDemoOrganization(demoSession);
    expect(repeatResult.success).toBe(true);
    expect(repeatResult.seededEntitiesCount).toBe(0); // 0 new records created
  });

  it("Maintains strict tenant isolation between production and demo organizations", () => {
    const prodAudit = demoSeedingService.auditOrganizationContamination(prodSession);
    expect(prodAudit.isDemo).toBe(false);
    expect(prodAudit.totalSyntheticRecordsFound).toBe(0);

    const demoAudit = demoSeedingService.auditOrganizationContamination(demoSession);
    expect(demoAudit.isDemo).toBe(true);
    expect(demoAudit.totalSyntheticRecordsFound).toBe(FRONT_RANGE_FIXTURE_DATA.counts.totalConnectedRecords);
  });

  it("Executes deterministic golden snapshot reset back to pristine state", () => {
    const resetResult = demoSeedingService.resetDemoOrganization(demoSession);
    expect(resetResult.success).toBe(true);
    expect(resetResult.recordsResetCount).toBe(FRONT_RANGE_FIXTURE_DATA.counts.totalConnectedRecords);

    // Re-verify that records are intact post-reset
    const quotePostReset = quoteService.getQuote(demoSession, `qte_${demoOrg.id}_088`);
    expect(quotePostReset).toBeDefined();
    expect(quotePostReset?.quoteNumber).toBe(FRONT_RANGE_FIXTURE_DATA.seededRecords.quoteNumber);
  });
});
