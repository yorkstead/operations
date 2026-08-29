import { SessionContext } from "../../core/domain/types";
import { SIGNWORKS_FIXTURE_DATA } from "../domain/signworks-scenario";
import { quoteService } from "../../quoting/application/quote-service";
import { jobService } from "../../jobs/application/job-service";
import { packetIntelligenceService } from "../../packet-intelligence/application/packet-intelligence-service";
import { purchasingService } from "../../purchasing/application/purchasing-service";
import { inventoryService } from "../../inventory/application/inventory-service";
import { shopfloorService } from "../../shopfloor/application/shopfloor-service";
import { qualityService } from "../../quality/application/quality-service";
import { packagingService } from "../../packaging/application/packaging-service";
import { shippingService } from "../../shipping/application/shipping-service";
import { fileService } from "../../core/application/file-service";
import { analyticsService } from "../../analytics/application/analytics-service";
import { activityService } from "../../core/application/activity-service";

export interface SignworksSeedingResult {
  success: boolean;
  organizationId: string;
  scenarioSlug: string;
  totalRecordsSeeded: number;
  breakdown: {
    quotes: number;
    jobs: number;
    packetDocuments: number;
    purchasing: number;
    inventory: number;
    shopfloor: number;
    quality: number;
    packaging: number;
    shipping: number;
    files: number;
    analytics: number;
    activityEvents: number;
  };
}

export class SignworksSeeder {
  private seededOrgs: Set<string> = new Set();

  private assertDemoOrganization(session: SessionContext, operation: string) {
    if (!session?.activeOrganization) {
      throw new Error("Unauthorized: Active session required.");
    }
    const org = session.activeOrganization;
    if (org.isDemo !== true || org.id === "org_yorkstead_systems" || org.slug === "yorkstead") {
      throw new Error(
        `Forbidden: Cannot ${operation} production customer organization '${org.name}' (${org.id}). Demo operations require isDemo: true.`
      );
    }
    return org;
  }

  /**
   * Seeds the complete Mile High Signworks dataset into active demo organization.
   * STRICT GUARDRAIL: Immediately rejects any production or non-demo organization.
   */
  seed(session: SessionContext): SignworksSeedingResult {
    const org = this.assertDemoOrganization(session, "seed");
    const orgId = org.id;

    if (this.seededOrgs.has(orgId)) {
      return {
        success: true,
        organizationId: orgId,
        scenarioSlug: SIGNWORKS_FIXTURE_DATA.organization.slug,
        totalRecordsSeeded: 0,
        breakdown: {
          quotes: 0,
          jobs: 0,
          packetDocuments: 0,
          purchasing: 0,
          inventory: 0,
          shopfloor: 0,
          quality: 0,
          packaging: 0,
          shipping: 0,
          files: 0,
          analytics: 0,
          activityEvents: 0,
        },
      };
    }

    const { customer, vendor, seededRecords, workCenters, inventoryItems, project } = SIGNWORKS_FIXTURE_DATA;
    const now = new Date().toISOString();

    // 1. Quoting Domain
    const quote = {
      id: `qte_${orgId}_sgn_09`,
      organizationId: orgId,
      quoteNumber: seededRecords.quoteNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerContactEmail: customer.contactEmail,
      title: "RiNo Brewery Reverse Channel Letters Facade Signage",
      status: "converted_to_job" as const,
      currentRevisionNumber: 1,
      costModelType: "manufacturing_custom" as const,
      minMarginThresholdPercent: 30,
      requiresExecutiveApproval: false,
      executiveSignoffUserId: undefined,
      notes: "Halo-Lit reverse channel letters with matte black polyurethane finish and 3000K warm LEDs.",
      targetDeliveryDate: "2026-08-25",
      expiresAt: "2026-09-30T00:00:00Z",
      convertedJobId: `job_${orgId}_sgn_09`,
      convertedAt: now,
      createdAt: now,
      updatedAt: now,
      revisions: [
        {
          revisionNumber: 1,
          changeReason: "Initial estimation and contract signoff.",
          subtotalCents: 2450000,
          discountPercent: 0,
          discountAmountCents: 0,
          taxPercent: 0,
          taxAmountCents: 0,
          totalAmountCents: 2450000,
          overallMarginPercent: 38.5,
          createdAt: now,
          createdByUserId: "usr_tyler_cruz",
          createdByName: "Tyler Cruz",
          lineItems: [
            {
              id: `qli_${orgId}_1`,
              lineItemNumber: 1,
              partDescription: project.signType,
              drawingNumber: "DWG-RINO-2026-REV-C",
              revision: "C",
              quantity: 1,
              costBreakdown: {
                materialCostCents: 580000,
                laborCostCents: 620000,
                machineCostCents: 210000,
                outsourcingCostCents: 0,
                freightCostCents: 0,
                overheadCostCents: 96000,
                totalCostCents: 1506000,
              },
              targetMarginPercent: 38.5,
              unitPriceCents: 2450000,
              totalPriceCents: 2450000,
            },
          ],
        },
      ],
    };
    quoteService["quotes"].set(quote.id, quote);

    // 2. Jobs Domain
    const job = {
      id: `job_${orgId}_sgn_09`,
      organizationId: orgId,
      jobNumber: seededRecords.jobNumber,
      title: "RiNo Arts Brewery Halo-Lit Channel Letters Facade Sign",
      customerId: customer.id,
      customerName: customer.name,
      currentStatus: "in_progress" as const,
      priority: "standard" as const,
      currentRevision: "C",
      targetDueDate: "2026-08-25",
      estimatedLaborHours: 32,
      notes: "Permit PERMIT-DEN-2026-881 approved. Dedicated 120V 20A circuit verified on facade.",
      revisions: [
        {
          revision: "C",
          changeSummary: "Updated halo standoff distance to 1.5in per client architectural review.",
          changedByUserId: "usr_tyler_cruz",
          createdAt: now,
        },
      ],
      timeline: [
        {
          id: `time_${orgId}_1`,
          fromStatus: "draft" as const,
          toStatus: "intake_review" as const,
          actorUserId: "usr_tyler_cruz",
          actorName: "Tyler Cruz",
          reason: "Quote converted to live fabrication order.",
          timestamp: now,
        },
        {
          id: `time_${orgId}_2`,
          fromStatus: "intake_review" as const,
          toStatus: "in_progress" as const,
          actorUserId: "usr_tyler_cruz",
          actorName: "Tyler Cruz",
          reason: "Drawing Rev C approved and permit Denver-881 attached.",
          timestamp: now,
        },
      ],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    jobService["jobs"].set(job.id, job);

    // 3. Job Packets & Drawing Intelligence Domain
    const packetDoc = {
      id: `doc_pkt_${orgId}_sgn_09`,
      organizationId: orgId,
      jobId: job.id,
      jobNumber: job.jobNumber,
      fileName: "RiNo_Brewery_Facade_Signage_RevC.pdf",
      fileStorageKey: "drawings/signworks/RiNo_Brewery_Facade_Signage_RevC.pdf",
      fileSizeBytes: 8420000,
      mimeType: "application/pdf",
      documentType: "engineering_drawing" as const,
      extractionStatus: "approved" as const,
      aiModelUsed: "synthetic-drawing-parser-v3.0",
      extractedEntities: [
        { key: "letter_height", label: "Letter Height Callout", rawValue: "42 inches (1067mm)", normalizedValue: "42in", confidenceScore: 0.99, approved: true },
        { key: "lighting_spec", label: "LED Module Type", rawValue: "Warm White 3000K IP67 Halo", normalizedValue: "LED-HALO-3000K", confidenceScore: 0.98, approved: true },
        { key: "finish_spec", label: "Coating Specification", rawValue: "Matte Black Satin Polyurethane", normalizedValue: "MATTE_BLACK_SATIN", confidenceScore: 0.97, approved: true },
        { key: "electrical_spec", label: "Power Supply Callout", rawValue: "Mean Well 12V 60W IP67 Class 2", normalizedValue: "PSU-MEANWELL-60W", confidenceScore: 0.99, approved: true },
      ],
      inconsistencies: [],
      uploadedAt: now,
    };
    packetIntelligenceService["documents"].set(packetDoc.id, packetDoc);

    // 4. Purchasing & Shortages Domain
    const shortage = {
      id: `sh_${orgId}_sgn_1`,
      jobId: job.id,
      jobNumber: job.jobNumber,
      itemCode: "LED-HALO-3000K",
      description: "Warm White 3000K IP67 Halo LED Modules (50-Pack)",
      requiredQuantity: 6,
      onHandQuantity: 2,
      shortageQuantity: 4,
      uom: "BOX",
      neededByDate: "2026-08-22",
      urgency: "standard" as const,
    };
    purchasingService["shortages"].set(`${orgId}:${shortage.id}`, shortage);

    const po = {
      id: `po_${orgId}_sgn_04`,
      poNumber: seededRecords.purchaseOrderNumber,
      organizationId: orgId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.contactEmail,
      status: "received_complete" as const,
      lineItems: [
        {
          id: `poli_${orgId}_1`,
          lineNumber: 1,
          itemCode: "LED-HALO-3000K",
          description: "Warm White 3000K IP67 Halo LED Modules (50-Pack)",
          quantityOrdered: 6,
          quantityReceived: 6,
          uom: "BOX",
          unitCostCents: 4200,
          totalCostCents: 25200,
          linkedJobId: job.id,
          linkedJobNumber: job.jobNumber,
        },
        {
          id: `poli_${orgId}_2`,
          lineNumber: 2,
          itemCode: "PSU-MEANWELL-60W",
          description: "Mean Well 12V 60W IP67 Class 2 LED Power Supply",
          quantityOrdered: 4,
          quantityReceived: 4,
          uom: "EA",
          unitCostCents: 3800,
          totalCostCents: 15200,
          linkedJobId: job.id,
          linkedJobNumber: job.jobNumber,
        },
      ],
      subtotalCostCents: 40400,
      shippingCostCents: 2500,
      taxCostCents: 0,
      totalCostCents: 42900,
      approvalThresholdCents: 200000,
      requiresManagerApproval: false,
      approvedByUserId: "usr_tyler_cruz",
      approvedByName: "Tyler Cruz",
      approvedAt: now,
      expectedDeliveryDate: "2026-08-22",
      issuedAt: now,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    purchasingService["purchaseOrders"].set(po.id, po);

    const receipt = {
      id: `rec_${orgId}_sgn_02`,
      organizationId: orgId,
      poId: po.id,
      poNumber: po.poNumber,
      packingSlipNumber: "PS-DSS-2026-904",
      receivedDate: "2026-08-22",
      receivedByUserId: "usr_tyler_cruz",
      receivedByName: "Tyler Cruz",
      itemsReceived: [
        { itemCode: "LED-HALO-3000K", quantityReceived: 6, lotNumber: seededRecords.lotNumber },
        { itemCode: "PSU-MEANWELL-60W", quantityReceived: 4, lotNumber: "LOT-2026-MW-60W" },
      ],
      createdAt: now,
    };
    purchasingService["receipts"].set(`${orgId}:${receipt.id}`, receipt);

    // 5. Inventory Items & Movements
    inventoryItems.forEach((item, idx) => {
      const itemId = `item_${orgId}_${item.itemCode}`;
      const inventoryItem = {
        id: itemId,
        organizationId: orgId,
        itemCode: item.itemCode,
        description: item.description,
        category: item.category,
        unitOfMeasure: item.uom,
        reorderPoint: String(item.reorderThreshold),
        reorderQuantity: String(item.initialQuantity),
        standardCostCents: item.unitCostCents,
        lotTrackingRequired: true,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      };
      inventoryService["items"].set(itemId, inventoryItem);

      const movementId = `mov_${orgId}_${idx + 1}`;
      const movement = {
        id: movementId,
        organizationId: orgId,
        itemId,
        itemCode: item.itemCode,
        lotNumber: item.lotNumber,
        movementType: "issue_to_job" as const,
        quantity: String(item.allocatedQuantity),
        unitCostCents: item.unitCostCents,
        fromLocationCode: "LOC-RACK-ELECTRICAL",
        toLocationCode: "WC-ELEC-01",
        referenceType: "job",
        referenceId: job.jobNumber,
        actorUserId: "usr_tyler_cruz",
        actorName: "Tyler Cruz",
        occurredAt: now,
        createdAt: now,
      };
      inventoryService["movements"].set(movementId, movement);
    });

    // 6. Shopfloor Work Centers & Digital Traveler
    workCenters.forEach((wc) => {
      shopfloorService["workCenters"].set(`${orgId}:${wc.code}`, {
        id: `wc_${orgId}_${wc.code}`,
        organizationId: orgId,
        code: wc.code,
        name: wc.name,
        type: wc.type,
        status: "available",
        hourlyCostRate: wc.hourlyCostRate,
      });
    });

    const traveler = {
      id: `trv_${orgId}_sgn_09`,
      organizationId: orgId,
      travelerNumber: seededRecords.travelerNumber,
      qrCodeData: `yorkstead://traveler/${seededRecords.travelerNumber}`,
      jobId: job.id,
      jobNumber: job.jobNumber,
      partDescription: project.signType,
      customerName: customer.name,
      totalQuantity: 1,
      currentStepIndex: 3,
      status: "active" as const,
      priority: "standard" as const,
      targetDueDate: "2026-08-25",
      version: 1,
      createdAt: now,
      updatedAt: now,
      operations: [
        {
          id: `op_${orgId}_10`,
          sequence: 10,
          workCenterCode: "WC-ROUTER-01",
          workCenterName: "AXYZ 5010 CNC Router Table",
          operationName: "CNC Routing 0.080 Aluminum Backs & 0.50in Acrylic Spacers",
          requiredQuantity: 1,
          completedQuantity: 1,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_tyler_cruz",
          assignedOperatorName: "Tyler Cruz",
          actualLaborMinutes: 120,
        },
        {
          id: `op_${orgId}_20`,
          sequence: 20,
          workCenterCode: "WC-BENDER-01",
          workCenterName: "SDS ChannelBender Automatic Station",
          operationName: "Channel Letter Return Bending & Corner TIG Tack",
          requiredQuantity: 1,
          completedQuantity: 1,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_tyler_cruz",
          assignedOperatorName: "Tyler Cruz",
          actualLaborMinutes: 180,
        },
        {
          id: `op_${orgId}_30`,
          sequence: 30,
          workCenterCode: "WC-ELEC-01",
          workCenterName: "UL 48 Certified Wiring & LED Bench",
          operationName: "3000K Halo LED Module Layout & 12V Driver Wiring",
          requiredQuantity: 1,
          completedQuantity: 1,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_tyler_cruz",
          assignedOperatorName: "Tyler Cruz",
          actualLaborMinutes: 240,
        },
        {
          id: `op_${orgId}_40`,
          sequence: 40,
          workCenterCode: "WC-BOOTH-01",
          workCenterName: "Matte Polyurethane Paint & Cure Booth",
          operationName: "Matte Black Polyurethane Exterior Finish & Thermal Cure",
          requiredQuantity: 1,
          completedQuantity: 1,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_tyler_cruz",
          assignedOperatorName: "Tyler Cruz",
          actualLaborMinutes: 90,
        },
      ],
      blockers: [],
    };
    shopfloorService["travelers"].set(traveler.id, traveler);

    // 7. Quality & UL 48 Electrical Checkpoint
    const inspection = {
      id: `insp_${orgId}_sgn_09`,
      organizationId: orgId,
      inspectionType: "final_acceptance" as const,
      jobId: job.id,
      jobNumber: job.jobNumber,
      partDescription: project.signType,
      travelerOperationId: `op_${orgId}_30`,
      inspectorUserId: "usr_tyler_cruz",
      inspectorName: "Tyler Cruz (Certified UL Sign Fabricator)",
      status: "passed" as const,
      sampleSize: 1,
      passedQuantity: 1,
      failedQuantity: 0,
      checklist: [
        { id: "chk_ul_1", characteristic: "UL 48 Ground Continuity Test", targetSpec: "< 0.1 ohm ground bond resistance", result: "pass" as const, measuredValue: "0.04 ohms" },
        { id: "chk_ul_2", characteristic: "Dielectric Voltage Withstand (Hipot)", targetSpec: "1200 VAC for 1 second no breakdown", result: "pass" as const, measuredValue: "Passed 1.2 kV" },
        { id: "chk_ul_3", characteristic: "Halo Luminance Output Balance", targetSpec: "3000K +/- 100K uniform back-glow", result: "pass" as const, measuredValue: "2985K calibrated" },
        { id: "chk_ul_4", characteristic: "UL 48 Serialized Listing Hologram Label Attached", targetSpec: "Affixed inside primary J-box", result: "pass" as const, measuredValue: "UL-CO-2026-881" },
      ],
      completedAt: now,
      createdAt: now,
    };
    qualityService["inspections"].set(inspection.id, inspection);

    // 8. Packaging & Crating Domain
    const pkgUnit = {
      id: `pkg_${orgId}_sgn_09`,
      organizationId: orgId,
      packageNumber: seededRecords.packageNumber,
      containerType: "crate" as const,
      totalQuantity: 1,
      netWeightLbs: 235.0,
      tareWeightLbs: 45.0,
      grossWeightLbs: 280.0,
      maxCapacityLbs: 800.0,
      dimensionsInches: { length: 288, width: 48, height: 24 },
      labelBarcode: `BC-${seededRecords.packageNumber}`,
      status: "sealed_ready_for_shipping" as const,
      sealedAt: now,
      sealedByUserId: "usr_tyler_cruz",
      sealedByName: "Tyler Cruz",
      items: [
        {
          id: `pkgi_${orgId}_1`,
          jobId: job.id,
          jobNumber: job.jobNumber,
          partDescription: project.signType,
          quantityPacked: 1,
          unitWeightLbs: 235.0,
          lotNumber: seededRecords.lotNumber,
        },
      ],
      createdAt: now,
    };
    packagingService["packages"].set(`${orgId}:${pkgUnit.packageNumber}`, pkgUnit);

    // 9. Shipping & Crane Truck Installation Manifest
    const manifest = {
      id: `shp_${orgId}_sgn_09`,
      organizationId: orgId,
      manifestNumber: seededRecords.manifestNumber,
      carrierType: "dedicated_flatbed" as const,
      carrierName: "Mile High Signworks Crane Truck #4",
      trackingOrProNumber: "CRANE-TRUCK-04",
      driverName: "Tyler Cruz",
      trailerOrPlateNumber: "CO-COMM-8914",
      packageNumbers: [pkgUnit.packageNumber],
      totalPackages: 1,
      totalGrossWeightLbs: 280.0,
      status: "delivered" as const,
      billOfLadingBarcode: `BOL-${seededRecords.manifestNumber}-MHS`,
      dispatchedAt: now,
      dispatchedByUserId: "usr_tyler_cruz",
      dispatchedByName: "Tyler Cruz",
      deliveredAt: now,
      stops: [
        {
          stopSequence: 1,
          destinationCustomerName: customer.name,
          destinationAddress: customer.address,
          packageNumbers: [pkgUnit.packageNumber],
          status: "delivered" as const,
          signedBy: "Marcus Vance",
          deliveredAt: "2026-08-25T16:30:00Z",
        },
      ],
      packages: [
        {
          id: `shppkg_${orgId}_1`,
          packageNumber: pkgUnit.packageNumber,
          grossWeightLbs: 280.0,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    shippingService["manifests"].set(manifest.id, manifest);

    // 10. Document Vault Files
    const files = [
      {
        id: `file_${orgId}_art_dwg`,
        organizationId: orgId,
        uploadedByUserId: "usr_tyler_cruz",
        uploadedByName: "Tyler Cruz",
        filename: "RiNo_Brewery_Facade_Signage_RevC.pdf",
        mimeType: "application/pdf",
        sizeBytes: 8420000,
        storageKey: "drawings/signworks/RiNo_Brewery_Facade_Signage_RevC.pdf",
        status: "clean" as const,
        entityType: "job",
        entityId: job.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `file_${orgId}_ul_cert`,
        organizationId: orgId,
        uploadedByUserId: "usr_tyler_cruz",
        uploadedByName: "Tyler Cruz",
        filename: "Denver-Electrical-Permit-881-Approved.pdf",
        mimeType: "application/pdf",
        sizeBytes: 412000,
        storageKey: "permits/signworks/Denver-Electrical-Permit-881-Approved.pdf",
        status: "clean" as const,
        entityType: "job",
        entityId: job.id,
        createdAt: now,
        updatedAt: now,
      },
    ];
    files.forEach((f) => fileService["fileRecords"].set(f.id, f));

    // 11. Analytics Suggestion
    const suggestion = {
      id: `sug_${orgId}_crane_route`,
      organizationId: orgId,
      title: "Logistics Optimization: Schedule Boom Truck Crane Hoist during RiNo Morning Pedestrian Lull",
      category: "workcenter_rebalance" as const,
      rationale: "Blake St pedestrian traffic peaks at 17:00. Scheduling crane outrigger deployment at 07:30 avoids right-of-way sidewalk barricade delays.",
      constraints: ["Maintain city right-of-way permit window", "Certified crane operator on duty"],
      tradeOffs: ["Early 06:30 shop departure vs saving 90 minutes of pedestrian traffic hold time"],
      confidenceScore: 0.95,
      requiresHumanApproval: true as const,
      status: "approved" as const,
      approvedByUserId: "usr_tyler_cruz",
      approvedByName: "Tyler Cruz",
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    analyticsService["suggestions"].set(suggestion.id, suggestion);

    // 12. Comprehensive Activity Audit Events Trail
    const events = [
      { action: "quotes.created", entity: "quote" as const, id: quote.id, summary: `Quote ${quote.quoteNumber} drafted for ${customer.name} ($24,500.00).` },
      { action: "quotes.converted_to_job", entity: "quote" as const, id: quote.id, summary: `Quote ${quote.quoteNumber} converted to production order ${job.jobNumber}.` },
      { action: "packets.document_extracted", entity: "packet" as const, id: packetDoc.id, summary: "Architectural vector drawing Rev C approved with 4 callouts." },
      { action: "purchasing.po_issued", entity: "purchase_order" as const, id: po.id, summary: `Purchase order ${po.poNumber} issued to ${vendor.name}.` },
      { action: "shopfloor.traveler_released", entity: "traveler" as const, id: traveler.id, summary: `Digital Traveler ${traveler.travelerNumber} released for channel letter fabrication.` },
      { action: "quality.ul_inspected", entity: "inspection" as const, id: inspection.id, summary: "UL 48 electrical grounding and luminance test passed (4/4 checklist items verified)." },
      { action: "shipping.manifest_delivered", entity: "manifest" as const, id: manifest.id, summary: `Crane Truck #4 installed facade signage at ${customer.name}. Sign-off signed by Marcus Vance.` },
    ];

    events.forEach((e) => {
      activityService.logActivity({
        organizationId: orgId,
        actorId: "usr_tyler_cruz",
        actorName: "Tyler Cruz",
        entityType: e.entity,
        entityId: e.id,
        action: e.action,
        summary: e.summary,
      });
    });

    this.seededOrgs.add(orgId);

    return {
      success: true,
      organizationId: orgId,
      scenarioSlug: SIGNWORKS_FIXTURE_DATA.organization.slug,
      totalRecordsSeeded: SIGNWORKS_FIXTURE_DATA.counts.totalConnectedRecords,
      breakdown: {
        quotes: SIGNWORKS_FIXTURE_DATA.counts.quotes,
        jobs: SIGNWORKS_FIXTURE_DATA.counts.jobs,
        packetDocuments: SIGNWORKS_FIXTURE_DATA.counts.packetDocs,
        purchasing: SIGNWORKS_FIXTURE_DATA.counts.purchasingPo + SIGNWORKS_FIXTURE_DATA.counts.purchasingShortages + SIGNWORKS_FIXTURE_DATA.counts.purchasingReceipts,
        inventory: SIGNWORKS_FIXTURE_DATA.counts.inventoryItems + SIGNWORKS_FIXTURE_DATA.counts.inventoryMovements,
        shopfloor: SIGNWORKS_FIXTURE_DATA.counts.workCenters + SIGNWORKS_FIXTURE_DATA.counts.travelers + SIGNWORKS_FIXTURE_DATA.counts.travelerOperations,
        quality: SIGNWORKS_FIXTURE_DATA.counts.qualityInspections,
        packaging: SIGNWORKS_FIXTURE_DATA.counts.packagingUnits,
        shipping: SIGNWORKS_FIXTURE_DATA.counts.shippingManifests,
        files: SIGNWORKS_FIXTURE_DATA.counts.fileVaultRecords,
        analytics: SIGNWORKS_FIXTURE_DATA.counts.planningSuggestions,
        activityEvents: SIGNWORKS_FIXTURE_DATA.counts.auditEvents,
      },
    };
  }

  /**
   * Resets Mile High Signworks dataset for active demo organization to golden baseline.
   * STRICT GUARDRAIL: Rejects production customer organizations.
   */
  reset(session: SessionContext): SignworksSeedingResult {
    this.assertDemoOrganization(session, "reset");
    this.clean(session);
    return this.seed(session);
  }

  /**
   * Removes seeded Mile High Signworks demo records for the organization.
   * STRICT GUARDRAIL: Rejects production customer organizations.
   */
  clean(session: SessionContext): { success: boolean; recordsRemoved: number } {
    this.assertDemoOrganization(session, "clean");
    const orgId = session.activeOrganization.id;

    if (!this.seededOrgs.has(orgId)) {
      return { success: true, recordsRemoved: 0 };
    }

    quoteService["quotes"].delete(`qte_${orgId}_sgn_09`);
    jobService["jobs"].delete(`job_${orgId}_sgn_09`);
    packetIntelligenceService["documents"].delete(`doc_pkt_${orgId}_sgn_09`);
    purchasingService["shortages"].delete(`${orgId}:sh_${orgId}_sgn_1`);
    purchasingService["purchaseOrders"].delete(`po_${orgId}_sgn_04`);
    purchasingService["receipts"].delete(`${orgId}:rec_${orgId}_sgn_02`);
    shopfloorService["travelers"].delete(`trv_${orgId}_sgn_09`);
    qualityService["inspections"].delete(`insp_${orgId}_sgn_09`);
    packagingService["packages"].delete(`${orgId}:${SIGNWORKS_FIXTURE_DATA.seededRecords.packageNumber}`);
    shippingService["manifests"].delete(`shp_${orgId}_sgn_09`);
    fileService["fileRecords"].delete(`file_${orgId}_art_dwg`);
    fileService["fileRecords"].delete(`file_${orgId}_ul_cert`);
    analyticsService["suggestions"].delete(`sug_${orgId}_crane_route`);

    this.seededOrgs.delete(orgId);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: orgId,
      action: "demo.organization_cleaned",
      summary: `Cleaned Mile High Signworks demo records for organization '${session.activeOrganization.name}'.`,
    });

    return { success: true, recordsRemoved: SIGNWORKS_FIXTURE_DATA.counts.totalConnectedRecords };
  }
}

export const signworksSeeder = new SignworksSeeder();
