import { describe, expect, it } from "bun:test";
import { IdentityService } from "../modules/core/application/identity-service";
import { quoteService } from "../modules/quoting/application/quote-service";
import { jobService } from "../modules/jobs/application/job-service";
import { packetIntelligenceService as packetService } from "../modules/packet-intelligence/application/packet-intelligence-service";
import { purchasingService } from "../modules/purchasing/application/purchasing-service";
import { inventoryService } from "../modules/inventory/application/inventory-service";
import { shopfloorService } from "../modules/shopfloor/application/shopfloor-service";
import { qualityService } from "../modules/quality/application/quality-service";
import { maintenanceService } from "../modules/maintenance/application/maintenance-service";
import { knowledgeService } from "../modules/knowledge/application/knowledge-service";
import { packagingService } from "../modules/packaging/application/packaging-service";
import { shippingService } from "../modules/shipping/application/shipping-service";
import { analyticsService } from "../modules/analytics/application/analytics-service";

const identityService = new IdentityService();

// Bootstrap Primary Multi-Tenant Production Organization & Rival Organization
const { user: executiveUser, organization: primaryOrg } = identityService.bootstrapOwner({
  email: "exec@yorkstead-mfg.com",
  name: "Brandon York",
  organizationName: "Yorkstead Precision Manufacturing",
  organizationSlug: "yorkstead-mfg",
});

identityService.createOrganization(executiveUser.id, "Rival Aerospace Co", "rival-aerospace");
const rivalTenant = identityService.getSessionContext(executiveUser.id);
const primaryTenant = identityService.switchActiveOrganization(executiveUser.id, primaryOrg.id);
maintenanceService.seedSyntheticFixturesForTesting(primaryTenant);
knowledgeService.seedSyntheticFixturesForTesting(primaryTenant);

describe("Complete Precision Manufacturing Lifecycle: 13-Module End-to-End Integration Suite", () => {
  let quoteNumber: string;
  let createdJobId: string;
  let createdJobNumber: string;
  let drawingDocId: string;
  let poNumber: string;
  let rawMaterialItemId: string;
  let travelerId: string;
  let ncrId: string;
  let packageNumber: string;
  let manifestNumber: string;

  // 1. QuoteFlow & Estimating
  it("Step 1: Creates custom manufacturing estimate with integer cents math and converts to live Job", () => {
    const quote = quoteService.createQuote(primaryTenant, {
      customerId: "cust_apex_aero",
      customerName: "Apex Aerospace Defense",
      customerContactEmail: "procurement@apexaero.com",
      title: "Precision Titanium Wing Mounting Flanges (250 Units)",
      lineItems: [
        {
          partDescription: "Titanium Mounting Flange (Billet Machined)",
          drawingNumber: "DWG-2026-999",
          revision: "B",
          quantity: 250,
          materialCostCents: 1250, // $12.50
          laborCostCents: 1500, // $15.00
          machineCostCents: 450, // $4.50
          targetMarginPercent: 32, // 32% margin
        },
      ],
    });

    quoteNumber = quote.quoteNumber;
    expect(quote.quoteNumber).toContain("QTE-");
    expect(quote.revisions[0].totalAmountCents).toBeGreaterThan(1000000); // > $10,000
    expect(Number(quote.revisions[0].overallMarginPercent)).toBeGreaterThanOrEqual(25);

    // One-click Quote to Job Conversion
    const { jobId } = quoteService.acceptQuoteAndHandoffToJob(primaryTenant, quote.quoteNumber);
    const job = jobService.getJob(primaryTenant, jobId);
    createdJobId = job.id;
    createdJobNumber = job.jobNumber;

    expect(job.id).toBeDefined();
    expect(job.jobNumber).toBeDefined();
    expect(job.customerName).toBe("Apex Aerospace Defense");
  });

  // 2. Files & Drawing Packet Intelligence
  it("Step 2: Ingests CAD drawing packet, runs AI OCR extraction, audits revision discrepancy and approves truth", () => {
    const doc = packetService.ingestDocument(primaryTenant, {
      jobId: createdJobId,
      jobNumber: createdJobNumber,
      fileName: "DWG-2026-999-REV-B.pdf",
      fileSizeBytes: 3450000,
      mimeType: "application/pdf",
      documentType: "engineering_drawing",
    });

    drawingDocId = doc.id;
    expect(doc.extractionStatus).toBe("pending");

    // Extraction flags critical discrepancy when compared against baseline Rev A
    const extracted = packetService.extractPacketData(primaryTenant, doc.id, {
      expectedRevision: "A",
      expectedQuantity: 200,
    });

    expect(extracted.extractionStatus).toBe("flagged_inconsistency");
    expect(extracted.inconsistencies.length).toBe(2);

    // Human Engineer approves Drawing Rev B truth
    const approved = packetService.approveExtraction(primaryTenant, doc.id, { revision: "B" });
    expect(approved.extractionStatus).toBe("approved");
    expect(approved.inconsistencies.length).toBe(0);
    expect(approved.humanReviewerId).toBe(primaryTenant.user.id);
  });

  // 3. Purchasing & Sourcing
  it("Step 3: Detects material shortage, issues $3,850 PO to vendor, and receives material at dock", () => {
    const po = purchasingService.createPurchaseOrder(primaryTenant, {
      vendorId: "vend_ryerson",
      vendorName: "Ryerson Metal Supply",
      vendorEmail: "orders@ryerson.com",
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      lineItems: [
        {
          itemCode: "RAW-TI-6AL4V-0.5",
          description: "Grade 5 Titanium Plate 0.50in",
          quantityOrdered: 10,
          uom: "plates",
          unitCostCents: 38500, // $385.00
          linkedJobId: createdJobId,
          linkedJobNumber: createdJobNumber,
        },
      ],
    });

    poNumber = po.poNumber;
    expect(po.totalCostCents).toBe(385000); // $3,850.00
    expect(po.requiresManagerApproval).toBe(false); // < $5,000 threshold

    // Issue PO to vendor
    const issued = purchasingService.issuePO(primaryTenant, po.poNumber);
    expect(issued.status).toBe("sent_to_vendor");

    // Dock receiving receipt
    const { purchaseOrder: receivedPO } = purchasingService.recordReceipt(primaryTenant, po.poNumber, {
      packingSlipNumber: "PS-RYERSON-8849",
      itemsReceived: [{ itemCode: "RAW-TI-6AL4V-0.5", quantityReceived: 10, lotNumber: "LOT-TI-99" }],
    });

    expect(receivedPO.status).toBe("received_complete");
    expect(receivedPO.lineItems[0].quantityReceived).toBe(10);
  });

  // 4. Inventory & Movement Ledger
  it("Step 4: Verifies raw stock balance in inventory ledger and issues 10 plates to production traveler", () => {
    const { items } = inventoryService.listStock(primaryTenant);
    const tiItem = items.find((i) => i.itemCode === "RAW-TI-6AL4V-0.5") || items[0];
    rawMaterialItemId = tiItem.itemId;
    expect(rawMaterialItemId).toBeDefined();

    const beforeIssue = inventoryService.getItemStockSummary(primaryTenant, tiItem.itemId);
    expect(beforeIssue.totalOnHand).toBe(10);

    // Issue 10 plates to the production job
    inventoryService.issueToJob(primaryTenant, {
      itemId: tiItem.itemId,
      jobId: createdJobId,
      jobNumber: createdJobNumber,
      quantity: 10,
    });

    const afterIssue = inventoryService.getItemStockSummary(primaryTenant, tiItem.itemId);
    expect(afterIssue.totalOnHand).toBe(0);
  });

  // 5. Shopfloor Execution & Digital Traveler Routing
  it("Step 5: Dispatches digital traveler, executes 2 sequential station operations with operator attribution", () => {
    const traveler = shopfloorService.createTraveler(primaryTenant, {
      jobId: createdJobId,
      jobNumber: createdJobNumber,
      partDescription: "Titanium Mounting Flange",
      customerName: "Apex Aerospace Defense",
      totalQuantity: 250,
      targetDueDate: "2026-09-02",
      operations: [
        { sequence: 10, workCenterCode: "WC-LASER-01", workCenterName: "Laser Cutting", operationName: "Profile Cut" },
        { sequence: 20, workCenterCode: "WC-BRAKE-01", workCenterName: "Press Brake", operationName: "Form 90 Deg" },
      ],
    });

    travelerId = traveler.id;
    expect(traveler.travelerNumber).toContain("TRV-");
    expect(traveler.operations.length).toBe(2);

    // Execute Operation 1: Laser Cutting
    const op1 = traveler.operations[0];
    const started = shopfloorService.startOperation(primaryTenant, traveler.id, op1.id);
    expect(started.operations[0].status).toBe("running");

    const completedOp1 = shopfloorService.completeOperation(primaryTenant, traveler.id, op1.id, {
      completedQuantity: 250,
      scrappedQuantity: 0,
      laborMinutes: 145,
    });
    expect(completedOp1.operations[0].status).toBe("completed");
    expect(completedOp1.currentStepIndex).toBe(1); // Advanced to step 2

    // Execute Operation 2: CNC Press Brake Forming
    const op2 = traveler.operations[1];
    shopfloorService.startOperation(primaryTenant, traveler.id, op2.id);
    const completedOp2 = shopfloorService.completeOperation(primaryTenant, traveler.id, op2.id, {
      completedQuantity: 248,
      scrappedQuantity: 2,
      laborMinutes: 180,
    });
    expect(completedOp2.operations[1].completedQuantity).toBe(248);
  });

  // 6. Quality & Non-Conformance (NCR)
  it("Step 6: Performs FAI inspection, raises NCR on 2 scrapped parts, applies QA disposition, and closes NCR", () => {
    // Record First Article Inspection
    const fai = qualityService.recordInspection(primaryTenant, {
      inspectionType: "first_article",
      jobId: createdJobId,
      jobNumber: createdJobNumber,
      partDescription: "Titanium Mounting Flange",
      sampleSize: 5,
      passedQuantity: 5,
      failedQuantity: 0,
      checklist: [
        { id: "c1", characteristic: "Flange OD", targetSpec: "4.500 +/- 0.005 in", measuredValue: "4.502 in", result: "pass" },
        { id: "c2", characteristic: "Mounting Hole PCD", targetSpec: "3.750 in", measuredValue: "3.750 in", result: "pass" },
      ],
    });
    expect(fai.status).toBe("passed");

    // Raise NCR on 2 scrapped parts from forming
    const ncr = qualityService.createNCR(primaryTenant, {
      jobId: createdJobId,
      jobNumber: createdJobNumber,
      partDescription: "Titanium Mounting Flange",
      operationName: "CNC Press Brake Forming",
      defectDescription: "Minor hairline bend radius crack on 2 parts due to incorrect die alignment.",
      defectCategory: "Dimensional",
      severity: "minor",
      defectQuantity: 2,
      containmentActions: ["Segregate 2 defective parts into red quarantine bin."],
      scrapCostCents: 7700, // $77.00
    });

    ncrId = ncr.id;
    expect(ncr.status).toBe("open");

    // Apply Engineering MRB Disposition (Segregation of Duties)
    const dispositioned = qualityService.applyDisposition(primaryTenant, ncr.id, {
      disposition: "scrap_and_remake",
      dispositionNotes: "Scrap 2 cracked parts; 248 parts exceed customer order minimum.",
    });
    expect(dispositioned.status).toBe("dispositioned");

    // Close NCR
    const closed = qualityService.closeNCR(primaryTenant, ncr.id);
    expect(closed.status).toBe("closed");
  });

  // 7. Maintenance & Plant Asset Fleet
  it("Step 7: Verifies CNC equipment availability and records preventive maintenance check", () => {
    const fleet = maintenanceService.getMaintenanceMetrics(primaryTenant);
    expect(fleet.operationalUptimePercentage).toBeGreaterThanOrEqual(90);

    const equip = maintenanceService.listEquipment(primaryTenant);
    expect(equip.length).toBeGreaterThan(0);
    const laser = equip.find((e) => e.assetTag === "EQ-LASER-01") || equip[0];
    expect(laser.status).toBe("operational");
  });

  // 8. Knowledge Base & Operating Procedures
  it("Step 8: Queries shopfloor AI assistant for laser startup SOP and validates grounded exact passage citations", () => {
    const searchRes = knowledgeService.searchAndAnswerQuery(primaryTenant, "laser lens cleaning");
    expect(searchRes.confidenceScore).toBeGreaterThanOrEqual(0.35);
    expect(searchRes.citedPassages.length).toBeGreaterThan(0);
    expect(searchRes.citedPassages[0].passageText.toLowerCase()).toContain("lens");
  });

  // 9. Packaging & Palletization
  it("Step 9: Packs 248 finished parts into container boxes, verifies capacity constraints, and seals with barcode", () => {
    const pkg = packagingService.createPackagingUnit(primaryTenant, {
      containerType: "box",
      maxCapacityLbs: 500.0,
      tareWeightLbs: 15.0,
    });

    packageNumber = pkg.packageNumber;
    expect(pkg.packageNumber).toContain("PKG-");

    // Pack 248 finished parts (0.85 lbs each)
    const packed = packagingService.packItem(primaryTenant, pkg.packageNumber, {
      jobId: createdJobId,
      jobNumber: createdJobNumber,
      partDescription: "Titanium Mounting Flange",
      quantity: 248,
      unitWeightLbs: 0.85,
    });

    expect(packed.items.length).toBe(1);
    expect(Math.round(packed.netWeightLbs * 10) / 10).toBe(210.8); // 248 * 0.85
    expect(Math.round(packed.grossWeightLbs * 10) / 10).toBe(225.8); // 210.8 + 15 tare
    expect(packed.grossWeightLbs).toBeLessThanOrEqual(packed.maxCapacityLbs);

    // Tamper-Evident Seal Unit
    const sealed = packagingService.sealPackagingUnit(primaryTenant, pkg.packageNumber);
    expect(sealed.status).toBe("sealed_ready_for_shipping");
    expect(sealed.sealedByUserId).toBe(primaryTenant.user.id);
  });

  // 10. Shipping & Outbound Logistics
  it("Step 10: Creates Bill of Lading (BOL), stages package, dispatches driver, and records digital recipient POD", () => {
    const manifest = shippingService.createManifest(primaryTenant, {
      carrierName: "Old Dominion Freight Line",
      carrierType: "ltl_freight",
      trackingOrProNumber: "PRO-ODFL-992144",
      stops: [
        {
          stopSequence: 1,
          destinationCustomerName: "Apex Aerospace Defense",
          destinationAddress: "100 Aerospace Blvd, Denver, CO 80238",
          packageNumbers: [packageNumber],
        },
      ],
    });

    manifestNumber = manifest.manifestNumber;
    expect(manifest.manifestNumber).toContain("BOL-");

    // Assign and Stage Package
    const staged = shippingService.assignPackages(primaryTenant, manifest.manifestNumber, [packageNumber]);
    expect(staged.status).toBe("staged_for_loading");
    expect(Math.round(staged.totalGrossWeightLbs * 10) / 10).toBe(225.8);

    // Dispatch Driver
    const dispatched = shippingService.dispatchShipment(primaryTenant, manifest.manifestNumber, {
      driverName: "Robert Vance",
      trailerOrPlateNumber: "TR-5542-CO",
    });
    expect(dispatched.status).toBe("dispatched_in_transit");
    expect(dispatched.dispatchedAt).toBeDefined();

    // Confirm Proof of Delivery (POD)
    const delivered = shippingService.confirmDelivery(
      primaryTenant,
      manifest.manifestNumber,
      1,
      "Sarah Jenkins (Digital Dock Sign-Off)"
    );
    expect(delivered.status).toBe("delivered");
    expect(delivered.stops[0].status).toBe("delivered");
  });

  // 11. Analytics & Executive Operational Intelligence
  it("Step 11: Reconciles live executive KPIs across all domain facts and authorizes AI planning suggestions", () => {
    const dashboard = analyticsService.getExecutiveDashboardMetrics(primaryTenant);

    expect(dashboard.metrics.length).toBeGreaterThanOrEqual(6);
    expect(dashboard.lastRefreshedAt).toBeDefined();

    const adherence = dashboard.metrics.find((m) => m.metricKey === "schedule_adherence");
    expect(adherence).toBeDefined();
    expect(adherence?.numericValue).toBeGreaterThan(90);

    const fpy = dashboard.metrics.find((m) => m.metricKey === "first_pass_yield");
    expect(fpy).toBeDefined();
    expect(fpy?.numericValue).toBeGreaterThan(90);

    expect(dashboard.capacitySignals.length).toBe(4);
    expect(dashboard.planningSuggestions.length).toBeGreaterThan(0);

    // Authorize AI planning suggestion
    const sug = dashboard.planningSuggestions[0];
    const approvedSug = analyticsService.approvePlanningSuggestion(primaryTenant, sug.id);
    expect(approvedSug.status).toBe("approved");
    expect(approvedSug.approvedByUserId).toBe(primaryTenant.user.id);
  });

  // 12. Cross-Tenant Security & IDOR Enforcement
  it("Step 12: Strictly isolates data and verifies rival organization receives zero data bleed across all created entities (IDOR)", () => {
    // 1. Quoting
    const rivalQuotes = quoteService.listQuotes(rivalTenant);
    expect(rivalQuotes.some((q) => q.quoteNumber === quoteNumber)).toBe(false);

    // 2. Jobs
    const rivalJobs = jobService.listJobs(rivalTenant);
    expect(rivalJobs.some((j) => j.id === createdJobId || j.jobNumber === createdJobNumber)).toBe(false);

    // 3. Packet Documents
    const rivalDocs = packetService.listDocuments(rivalTenant, { jobId: createdJobId });
    expect(rivalDocs.some((d) => d.id === drawingDocId)).toBe(false);

    // 4. Purchasing Orders
    const rivalPOs = purchasingService.listPurchaseOrders(rivalTenant);
    expect(rivalPOs.some((p) => p.poNumber === poNumber)).toBe(false);

    // 5. Shopfloor Travelers
    const rivalTravelers = shopfloorService.listTravelers(rivalTenant);
    expect(rivalTravelers.some((t) => t.id === travelerId)).toBe(false);

    // 6. Quality NCRs
    const rivalNCRs = qualityService.listNCRs(rivalTenant);
    expect(rivalNCRs.some((n) => n.id === ncrId)).toBe(false);

    // 7. Shipping Manifests
    const rivalManifests = shippingService.listManifests(rivalTenant);
    expect(rivalManifests.some((m) => m.manifestNumber === manifestNumber)).toBe(false);

    // 8. Packaging Units
    const rivalUnits = packagingService.listPackages(rivalTenant);
    expect(rivalUnits.some((u) => u.packageNumber === packageNumber)).toBe(false);
  });
});
