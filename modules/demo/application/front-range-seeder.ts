import { SessionContext } from "../../core/domain/types";
import { FRONT_RANGE_FIXTURE_DATA } from "../domain/front-range-scenario";
import { quoteService } from "../../quoting/application/quote-service";
import { jobService } from "../../jobs/application/job-service";
import { packetIntelligenceService } from "../../packet-intelligence/application/packet-intelligence-service";
import { purchasingService } from "../../purchasing/application/purchasing-service";
import { inventoryService } from "../../inventory/application/inventory-service";
import { shopfloorService } from "../../shopfloor/application/shopfloor-service";
import { qualityService } from "../../quality/application/quality-service";
import { maintenanceService } from "../../maintenance/application/maintenance-service";
import { packagingService } from "../../packaging/application/packaging-service";
import { shippingService } from "../../shipping/application/shipping-service";
import { fileService } from "../../core/application/file-service";
import { analyticsService } from "../../analytics/application/analytics-service";
import { activityService } from "../../core/application/activity-service";

export interface FrontRangeSeedingResult {
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
    maintenance: number;
    packaging: number;
    shipping: number;
    files: number;
    analytics: number;
    activityEvents: number;
  };
}

export class FrontRangeSeeder {
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
   * Seeds the complete Front Range Precision Manufacturing dataset into active demo organization.
   * STRICT GUARDRAIL: Immediately rejects any production or non-demo organization.
   */
  seed(session: SessionContext): FrontRangeSeedingResult {
    const org = this.assertDemoOrganization(session, "seed");
    const orgId = org.id;

    if (this.seededOrgs.has(orgId)) {
      return {
        success: true,
        organizationId: orgId,
        scenarioSlug: FRONT_RANGE_FIXTURE_DATA.organization.slug,
        totalRecordsSeeded: 0,
        breakdown: {
          quotes: 0,
          jobs: 0,
          packetDocuments: 0,
          purchasing: 0,
          inventory: 0,
          shopfloor: 0,
          quality: 0,
          maintenance: 0,
          packaging: 0,
          shipping: 0,
          files: 0,
          analytics: 0,
          activityEvents: 0,
        },
      };
    }

    const { customer, vendor, seededRecords, disruption } = FRONT_RANGE_FIXTURE_DATA;
    const now = new Date().toISOString();

    // 1. Quoting Domain
    const quote = {
      id: `qte_${orgId}_088`,
      organizationId: orgId,
      quoteNumber: seededRecords.quoteNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerContactEmail: customer.contactEmail,
      title: "Custom Aerospace Avionics Chassis Prototype",
      status: "converted_to_job" as const,
      currentRevisionNumber: 1,
      minMarginThresholdPercent: 25,
      requiresExecutiveApproval: false,
      approvedByUserId: "usr_marcus_vance",
      approvedByName: "Marcus Vance",
      approvedAt: now,
      expiresAt: "2026-10-31",
      convertedJobId: `job_${orgId}_104`,
      convertedAt: now,
      createdAt: now,
      updatedAt: now,
      revisions: [
        {
          revisionNumber: 1,
          changeReason: "Initial customer RFQ quote release.",
          subtotalCents: 770000,
          discountPercent: 0,
          discountAmountCents: 0,
          taxPercent: 0,
          taxAmountCents: 0,
          totalAmountCents: 770000,
          overallMarginPercent: 35.0,
          createdByUserId: "usr_marcus_vance",
          createdByName: "Marcus Vance",
          createdAt: now,
          lineItems: [
            {
              id: `qli_${orgId}_1`,
              lineItemNumber: 1,
              partDescription: "Aerospace Avionics Enclosure Chassis Base - Rev B",
              drawingNumber: "DWG-2026-AE-104",
              revision: "B",
              quantity: 50,
              costBreakdown: {
                materialCostCents: 4800,
                laborCostCents: 2400,
                machineCostCents: 1800,
                outsourcingCostCents: 0,
                freightCostCents: 500,
                overheadCostCents: 500,
                totalCostCents: 10000,
              },
              targetMarginPercent: 35,
              unitPriceCents: 15400,
              totalPriceCents: 770000,
            },
          ],
        },
      ],
    };
    quoteService["quotes"].set(quote.id, quote);

    // 2. Jobs Domain
    const job = {
      id: `job_${orgId}_104`,
      organizationId: orgId,
      jobNumber: seededRecords.jobNumber,
      title: "Aerospace Avionics Enclosure Chassis",
      customerId: customer.id,
      customerName: customer.name,
      currentStatus: "in_progress" as const,
      priority: "rush" as const,
      currentRevision: "B",
      targetDueDate: "2026-09-15",
      estimatedLaborHours: 24,
      notes: "High-precision avionics box for satellite comms array. Tolerance critical on flange bends.",
      revisions: [
        {
          revision: "A",
          changeSummary: "Initial CAD release.",
          changedByUserId: "usr_sarah_lin",
          createdAt: now,
        },
        {
          revision: "B",
          changeSummary: "Updated flange bend angle tolerance to +/-0.005in per customer CAD rev B.",
          changedByUserId: "usr_elena_rostova",
          createdAt: now,
        },
      ],
      timeline: [
        {
          id: `time_${orgId}_1`,
          fromStatus: "draft" as const,
          toStatus: "intake_review" as const,
          actorUserId: "usr_marcus_vance",
          actorName: "Marcus Vance",
          reason: "Quote converted to production order.",
          timestamp: now,
        },
        {
          id: `time_${orgId}_2`,
          fromStatus: "intake_review" as const,
          toStatus: "in_progress" as const,
          actorUserId: "usr_sarah_lin",
          actorName: "Sarah Lin",
          reason: "Engineering drawings approved and released to shopfloor queue.",
          timestamp: now,
        },
      ],
      version: 2,
      createdAt: now,
      updatedAt: now,
    };
    jobService["jobs"].set(job.id, job);

    // 3. Job Packets & Drawing Intelligence Domain
    const packetDoc = {
      id: `doc_pkt_${orgId}_104`,
      organizationId: orgId,
      jobId: job.id,
      jobNumber: job.jobNumber,
      fileName: "Apex-Avionics-Enclosure-RevB.pdf",
      fileStorageKey: "drawings/front-range/Apex-Avionics-Enclosure-RevB.pdf",
      fileSizeBytes: 1845000,
      mimeType: "application/pdf",
      documentType: "engineering_drawing" as const,
      extractionStatus: "approved" as const,
      aiModelUsed: "synthetic-drawing-parser-v3.0",
      extractedEntities: [
        { key: "material", label: "Material Callout", rawValue: "5052-H32 Aluminum Sheet (0.090in)", normalizedValue: "5052-H32", confidenceScore: 0.99, approved: true },
        { key: "hardware", label: "Hardware Callout", rawValue: "8x M4-0.7 PEM Clinch Studs 12mm", normalizedValue: "HRD-PEM-M4", confidenceScore: 0.98, approved: true },
        { key: "tolerance", label: "Flange Bend Tolerance", rawValue: "+/- 0.005 in (90.0 deg)", normalizedValue: "+/-0.005in", confidenceScore: 0.97, approved: true },
        { key: "finish", label: "Surface Finish", rawValue: "MIL-A-8625 Type II Clear Anodize", normalizedValue: "CLEAR_ANODIZE", confidenceScore: 0.99, approved: true },
      ],
      inconsistencies: [],
      uploadedAt: now,
    };
    packetIntelligenceService["documents"].set(packetDoc.id, packetDoc);

    // 4. Purchasing & Material Shortages Domain
    const shortage = {
      id: `sh_${orgId}_1`,
      jobId: job.id,
      jobNumber: job.jobNumber,
      itemCode: seededRecords.shortageItemCode,
      description: "5052-H32 Aluminum Sheet 0.090in x 48in x 96in",
      requiredQuantity: 12,
      onHandQuantity: 4,
      shortageQuantity: 8,
      uom: "sheets",
      neededByDate: "2026-09-02",
      urgency: "urgent" as const,
    };
    purchasingService["shortages"].set(`${orgId}:${shortage.id}`, shortage);

    const po = {
      id: `po_${orgId}_042`,
      poNumber: seededRecords.purchaseOrderNumber,
      organizationId: orgId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      status: "received_complete" as const,
      lineItems: [
        {
          id: `poli_${orgId}_1`,
          lineNumber: 1,
          itemCode: seededRecords.shortageItemCode,
          description: "5052-H32 Aluminum Sheet 0.090in x 48in x 96in Mill Cert Included",
          quantityOrdered: 8,
          quantityReceived: 8,
          uom: "sheets",
          unitCostCents: 48000,
          totalCostCents: 384000,
          linkedJobId: job.id,
          linkedJobNumber: job.jobNumber,
        },
      ],
      subtotalCostCents: 384000,
      shippingCostCents: 15000,
      taxCostCents: 0,
      totalCostCents: 399000,
      approvalThresholdCents: 500000,
      requiresManagerApproval: false,
      approvedByUserId: "usr_marcus_vance",
      approvedByName: "Marcus Vance",
      approvedAt: now,
      expectedDeliveryDate: "2026-09-01",
      issuedAt: now,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    purchasingService["purchaseOrders"].set(po.id, po);

    const receipt = {
      id: `rec_${orgId}_019`,
      organizationId: orgId,
      poId: po.id,
      poNumber: po.poNumber,
      packingSlipNumber: "PS-CO-89942",
      receivedDate: "2026-09-01",
      receivedByUserId: "usr_dave_miller",
      receivedByName: "Dave Miller",
      itemsReceived: [
        {
          itemCode: seededRecords.shortageItemCode,
          quantityReceived: 8,
          lotNumber: seededRecords.lotNumber,
        },
      ],
      notes: "Certified Mill Test Report #MT-9042 verified. Gauge checked 0.090in thickness.",
      createdAt: now,
    };
    purchasingService["receipts"].set(`${orgId}:${receipt.id}`, receipt);

    // 5. Inventory & Movement Ledger Domain
    FRONT_RANGE_FIXTURE_DATA.locations.forEach((loc) => {
      const id = `loc_${orgId}_${loc.locationCode}`;
      inventoryService["locations"].set(id, {
        id,
        organizationId: orgId,
        locationCode: loc.locationCode,
        name: loc.name,
        type: loc.type,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    });

    FRONT_RANGE_FIXTURE_DATA.inventoryItems.forEach((item) => {
      const id = `item_${orgId}_${item.itemCode}`;
      inventoryService["items"].set(id, {
        id,
        organizationId: orgId,
        itemCode: item.itemCode,
        description: item.description,
        category: item.category,
        unitOfMeasure: item.unitOfMeasure,
        reorderPoint: String(item.reorderPoint),
        reorderQuantity: String(item.reorderQuantity),
        standardCostCents: item.standardCostCents,
        lotTrackingRequired: item.lotTrackingRequired,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    });

    // 6. Shopfloor & Digital Traveler Domain
    FRONT_RANGE_FIXTURE_DATA.workCenters.forEach((wc) => {
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
      id: `trv_${orgId}_104`,
      organizationId: orgId,
      travelerNumber: seededRecords.travelerNumber,
      qrCodeData: `yorkstead://traveler/${seededRecords.travelerNumber}`,
      jobId: job.id,
      jobNumber: job.jobNumber,
      partDescription: "Aerospace Avionics Enclosure Chassis Base",
      customerName: customer.name,
      totalQuantity: 50,
      currentStepIndex: 3,
      status: "active" as const,
      priority: "rush" as const,
      targetDueDate: "2026-09-15",
      version: 1,
      createdAt: now,
      updatedAt: now,
      operations: [
        {
          id: `op_${orgId}_10`,
          sequence: 10,
          workCenterCode: "WC-LASER-01",
          workCenterName: "Mitsubishi 4kW Fiber Laser Cell",
          operationName: "CNC Laser Profile & Cutout Profile",
          requiredQuantity: 50,
          completedQuantity: 50,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_dave_miller",
          assignedOperatorName: "Dave Miller",
          actualLaborMinutes: 180,
        },
        {
          id: `op_${orgId}_20`,
          sequence: 20,
          workCenterCode: "WC-BRAKE-01",
          workCenterName: "Amada 100-Ton CNC Press Brake",
          operationName: "6-Axis CNC Brake Flange Forming",
          requiredQuantity: 50,
          completedQuantity: 48,
          scrappedQuantity: 2,
          status: "completed" as const,
          assignedOperatorId: "usr_dave_miller",
          assignedOperatorName: "Dave Miller",
          actualLaborMinutes: 140,
        },
        {
          id: `op_${orgId}_30`,
          sequence: 30,
          workCenterCode: "WC-WELD-01",
          workCenterName: "TIG Robotic Welding & PEM Insertion",
          operationName: "PEM Stud Insertion & Corner TIG Weld",
          requiredQuantity: 48,
          completedQuantity: 48,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_elena_rostova",
          assignedOperatorName: "Elena Rostova",
          actualLaborMinutes: 95,
        },
        {
          id: `op_${orgId}_40`,
          sequence: 40,
          workCenterCode: "WC-FINISH-01",
          workCenterName: "Chemical Conversion & Powder Coat Line",
          operationName: "Clear Anodize MIL-A-8625 & Final Pack Prep",
          requiredQuantity: 48,
          completedQuantity: 0,
          scrappedQuantity: 0,
          status: "running" as const,
          assignedOperatorId: "usr_elena_rostova",
          assignedOperatorName: "Elena Rostova",
          actualLaborMinutes: 0,
        },
      ],
      blockers: [
        {
          id: `blk_${orgId}_1`,
          operationId: `op_${orgId}_10`,
          reportedByUserId: "usr_dave_miller",
          reportedByName: "Dave Miller",
          reason: disruption.symptomDescription,
          status: "resolved" as const,
          resolvedByUserId: "usr_dave_miller",
          resolvedAt: now,
          createdAt: now,
        },
      ],
    };
    shopfloorService["travelers"].set(traveler.id, traveler);

    // 7. Quality & NCR Domain
    const inspection = {
      id: `insp_${orgId}_044`,
      organizationId: orgId,
      inspectionType: "first_article" as const,
      jobId: job.id,
      jobNumber: job.jobNumber,
      partDescription: "Aerospace Avionics Enclosure Chassis Base",
      travelerOperationId: `op_${orgId}_20`,
      inspectorUserId: "usr_elena_rostova",
      inspectorName: "Elena Rostova",
      status: "passed_with_concession" as const,
      sampleSize: 5,
      passedQuantity: 4,
      failedQuantity: 1,
      checklist: [
        { id: "chk_1", characteristic: "Overall Length", targetSpec: "14.500 +/-0.010 in", result: "pass" as const, measuredValue: "14.502 in" },
        { id: "chk_2", characteristic: "Flange Bend Angle", targetSpec: "90.0 +/-0.5 deg", result: "fail" as const, measuredValue: "90.8 deg (Part #2)", notes: "Backgauge datum offset" },
        { id: "chk_3", characteristic: "PEM Clinch Stud Torque Test", targetSpec: "25 in-lbs minimum", result: "pass" as const, measuredValue: "28 in-lbs (No rotation)" },
      ],
      ncrId: `ncr_${orgId}_012`,
      completedAt: now,
      createdAt: now,
    };
    qualityService["inspections"].set(inspection.id, inspection);

    const ncr = {
      id: `ncr_${orgId}_012`,
      organizationId: orgId,
      ncrNumber: seededRecords.ncrNumber,
      jobId: job.id,
      jobNumber: job.jobNumber,
      partDescription: "Aerospace Avionics Enclosure Chassis Base",
      operationName: "6-Axis CNC Brake Flange Forming",
      defectDescription: "Flange bend angle out of tolerance (+0.8 deg) on 2 parts due to backgauge calibration offset.",
      defectCategory: "dimensional_out_of_spec",
      severity: "minor" as const,
      status: "closed" as const,
      defectQuantity: 2,
      containmentActions: [
        "Quarantine affected 2 pieces in LOC-QUARANTINE",
        "Re-zero Amada press brake backgauge datum axis",
        "Perform 100% angle check on next 10 formed parts",
      ],
      rootCauseAnalysis: "Tooling backgauge datum drift after high-tonnage stainless run.",
      disposition: "rework" as const,
      dispositionNotes: "Re-struck parts on CNC brake tooling with verified angle 90.1 deg. Verified 100% compliant.",
      scrapCostCents: 0,
      reworkLaborMinutes: 25,
      remakeCostCents: 0,
      createdByUserId: "usr_elena_rostova",
      createdByName: "Elena Rostova",
      approvedByUserId: "usr_elena_rostova",
      approvedByName: "Elena Rostova",
      closedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    qualityService["ncrs"].set(ncr.id, ncr);

    // 8. Maintenance & Equipment Health Domain
    FRONT_RANGE_FIXTURE_DATA.equipment.forEach((eq) => {
      maintenanceService["equipment"].set(`${orgId}:${eq.assetTag}`, {
        id: `eq_${orgId}_${eq.assetTag}`,
        organizationId: orgId,
        assetTag: eq.assetTag,
        name: eq.name,
        manufacturer: eq.manufacturer,
        modelNumber: eq.modelNumber,
        serialNumber: eq.serialNumber,
        workCenterCode: eq.workCenterCode,
        locationCode: eq.locationCode,
        criticality: eq.criticality,
        status: "operational",
        qrCodeData: `yorkstead://equipment/${eq.assetTag}`,
        lastServiceDate: "2026-08-15",
        nextScheduledPmDate: "2026-09-15",
        totalRunHours: eq.totalRunHours,
      });
    });

    const downtime = {
      id: `dt_${orgId}_001`,
      organizationId: orgId,
      equipmentId: `eq_${orgId}_EQ-LASER-01`,
      assetTag: "EQ-LASER-01",
      category: "unplanned_breakdown" as const,
      reason: disruption.rootCause,
      impactSummary: disruption.mitigationImpact,
      startedAt: "2026-08-28T14:15:00Z",
      resolvedAt: "2026-08-28T14:50:00Z",
      durationMinutes: 35,
      reportedByUserId: "usr_dave_miller",
      reportedByName: "Dave Miller",
      resolvedByUserId: "usr_dave_miller",
      resolvedByName: "Dave Miller",
      workOrderId: `wo_${orgId}_009`,
      createdAt: now,
    };
    maintenanceService["downtimeIntervals"].set(downtime.id, downtime);

    const workOrder = {
      id: `wo_${orgId}_009`,
      organizationId: orgId,
      workOrderNumber: seededRecords.workOrderNumber,
      equipmentId: `eq_${orgId}_EQ-LASER-01`,
      assetTag: "EQ-LASER-01",
      type: "corrective_emergency" as const,
      status: "closed_returned_to_service" as const,
      title: disruption.title,
      description: disruption.correctiveAction,
      priority: "emergency" as const,
      assignedTechnicianId: "usr_dave_miller",
      assignedTechnicianName: "Dave Miller",
      replacementPartsUsed: [{ itemCode: "ORING-VITON-N2", description: "Viton Manifold O-Ring 22 bar", quantity: 2 }],
      actualLaborMinutes: 35,
      returnToServiceAuthorizedByUserId: "usr_dave_miller",
      returnToServiceAuthorizedByName: "Dave Miller",
      returnToServiceNotes: "Purged N2 line, pressure verified stable at 22 bar. Test cut passed.",
      completedAt: now,
      createdAt: now,
    };
    maintenanceService["workOrders"].set(workOrder.id, workOrder);

    // 9. Packaging & Palletization Domain
    const pkgUnit = {
      id: `pkg_${orgId}_042`,
      organizationId: orgId,
      packageNumber: seededRecords.packageNumber,
      containerType: "crate" as const,
      totalQuantity: 48,
      netWeightLbs: 360.0,
      tareWeightLbs: 45.0,
      grossWeightLbs: 405.0,
      maxCapacityLbs: 1000.0,
      dimensionsInches: { length: 48, width: 40, height: 36 },
      labelBarcode: `BC-${seededRecords.packageNumber}`,
      status: "sealed_ready_for_shipping" as const,
      sealedAt: now,
      sealedByUserId: "usr_dave_miller",
      sealedByName: "Dave Miller",
      items: [
        {
          id: `pkgi_${orgId}_1`,
          jobId: job.id,
          jobNumber: job.jobNumber,
          partDescription: "Aerospace Avionics Enclosure Chassis Base",
          quantityPacked: 48,
          unitWeightLbs: 7.5,
          lotNumber: seededRecords.lotNumber,
        },
      ],
      createdAt: now,
    };
    packagingService["packages"].set(`${orgId}:${pkgUnit.packageNumber}`, pkgUnit);

    // 10. Shipping & Outbound Manifests Domain
    const manifest = {
      id: `shp_${orgId}_088`,
      organizationId: orgId,
      manifestNumber: seededRecords.manifestNumber,
      carrierType: "ltl_freight" as const,
      carrierName: "Old Dominion Freight Line",
      trackingOrProNumber: "ODFL-982341109",
      driverName: "Hank Kowalski",
      trailerOrPlateNumber: "TR-8814",
      packageNumbers: [pkgUnit.packageNumber],
      totalPackages: 1,
      totalGrossWeightLbs: 405.0,
      status: "delivered" as const,
      billOfLadingBarcode: `BOL-${seededRecords.manifestNumber}-FRM`,
      dispatchedAt: now,
      dispatchedByUserId: "usr_dave_miller",
      dispatchedByName: "Dave Miller",
      deliveredAt: now,
      stops: [
        {
          stopSequence: 1,
          destinationCustomerName: customer.name,
          destinationAddress: "1200 Space Technology Blvd, Longmont, CO 80501",
          packageNumbers: [pkgUnit.packageNumber],
          status: "delivered" as const,
          signedBy: "R. Sterling",
          deliveredAt: "2026-09-03T10:15:00Z",
        },
      ],
      packages: [
        {
          id: `shppkg_${orgId}_1`,
          packageNumber: pkgUnit.packageNumber,
          grossWeightLbs: 405.0,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    shippingService["manifests"].set(manifest.id, manifest);

    // 11. Files & Document Vault Domain
    const files = [
      {
        id: `file_${orgId}_dwg`,
        organizationId: orgId,
        uploadedByUserId: "usr_elena_rostova",
        uploadedByName: "Elena Rostova",
        filename: "Apex-Avionics-Enclosure-RevB.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1845000,
        storageKey: "drawings/front-range/Apex-Avionics-Enclosure-RevB.pdf",
        status: "clean" as const,
        entityType: "job",
        entityId: job.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `file_${orgId}_mtr`,
        organizationId: orgId,
        uploadedByUserId: "usr_dave_miller",
        uploadedByName: "Dave Miller",
        filename: "Mill-Test-Report-5052-H32-Lot088.pdf",
        mimeType: "application/pdf",
        sizeBytes: 840200,
        storageKey: "certs/front-range/Mill-Test-Report-5052-H32-Lot088.pdf",
        status: "clean" as const,
        entityType: "purchase_order",
        entityId: po.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `file_${orgId}_fai`,
        organizationId: orgId,
        uploadedByUserId: "usr_elena_rostova",
        uploadedByName: "Elena Rostova",
        filename: "FAI-Inspection-Report-INS-044.pdf",
        mimeType: "application/pdf",
        sizeBytes: 620400,
        storageKey: "quality/front-range/FAI-Inspection-Report-INS-044.pdf",
        status: "clean" as const,
        entityType: "inspection",
        entityId: inspection.id,
        createdAt: now,
        updatedAt: now,
      },
    ];
    files.forEach((f) => fileService["fileRecords"].set(f.id, f));

    // 12. Analytics & Operational Planning Suggestions
    const suggestion = {
      id: `sug_${orgId}_001`,
      organizationId: orgId,
      title: "Workcenter Rebalance: Route Secondary Forming to Brake Cell #2 during Laser Shift 2",
      category: "workcenter_rebalance" as const,
      rationale: "Forming queue projected to exceed buffer threshold by 18% during peak laser throughput.",
      constraints: ["Maintain AS9102 First Article certified operator on duty", "Preserve tooling clearance"],
      tradeOffs: ["+15 min setup time on Brake #2 vs -3.5 hours backlog wait time"],
      confidenceScore: 0.94,
      requiresHumanApproval: true as const,
      status: "approved" as const,
      approvedByUserId: "usr_sarah_lin",
      approvedByName: "Sarah Lin",
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    analyticsService["suggestions"].set(suggestion.id, suggestion);

    // 13. Comprehensive Activity Audit Events Trail
    const events = [
      { action: "quotes.created", entity: "quote" as const, id: quote.id, summary: `Customer RFQ received from ${customer.name}. Quote ${quote.quoteNumber} drafted.` },
      { action: "quotes.approved", entity: "quote" as const, id: quote.id, summary: `Quote ${quote.quoteNumber} approved with 35% gross margin policy.` },
      { action: "quotes.converted_to_job", entity: "quote" as const, id: quote.id, summary: `Quote ${quote.quoteNumber} converted to production order ${job.jobNumber}.` },
      { action: "packets.document_extracted", entity: "packet" as const, id: packetDoc.id, summary: `Engineering drawing ${packetDoc.fileName} extracted with 4 certified callouts.` },
      { action: "purchasing.shortage_flagged", entity: "shortage" as const, id: shortage.id, summary: `Material shortage flagged for ${shortage.description}: 8 sheets required.` },
      { action: "purchasing.po_issued", entity: "purchase_order" as const, id: po.id, summary: `Purchase order ${po.poNumber} issued to ${vendor.name}.` },
      { action: "purchasing.material_received", entity: "receipt" as const, id: receipt.id, summary: `8 sheets received under Lot ${seededRecords.lotNumber} with Mill Cert verified.` },
      { action: "shopfloor.traveler_released", entity: "traveler" as const, id: traveler.id, summary: `Digital Traveler ${traveler.travelerNumber} released across 4 workcenters.` },
      { action: "quality.fai_recorded", entity: "inspection" as const, id: inspection.id, summary: `First Article Inspection recorded: ${inspection.passedQuantity} passed, ${inspection.failedQuantity} flagged for concession.` },
      { action: "quality.ncr_dispositioned", entity: "ncr" as const, id: ncr.id, summary: `NCR ${ncr.ncrNumber} dispositioned to rework; flange angle calibrated and closed.` },
      { action: "packaging.container_sealed", entity: "package" as const, id: pkgUnit.packageNumber, summary: `Crate ${pkgUnit.packageNumber} sealed: 48 finished chassis units (Gross 405 lbs).` },
      { action: "shipping.manifest_delivered", entity: "manifest" as const, id: manifest.id, summary: `Carrier ${manifest.carrierName} PRO ${manifest.trackingOrProNumber} delivered to ${customer.name}.` },
    ];

    events.forEach((e) => {
      activityService.logActivity({
        organizationId: orgId,
        actorId: "usr_sarah_lin",
        actorName: "Sarah Lin",
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
      scenarioSlug: FRONT_RANGE_FIXTURE_DATA.organization.slug,
      totalRecordsSeeded: FRONT_RANGE_FIXTURE_DATA.counts.totalConnectedRecords,
      breakdown: {
        quotes: FRONT_RANGE_FIXTURE_DATA.counts.quotes,
        jobs: FRONT_RANGE_FIXTURE_DATA.counts.jobs,
        packetDocuments: FRONT_RANGE_FIXTURE_DATA.counts.packetDocs,
        purchasing: FRONT_RANGE_FIXTURE_DATA.counts.purchasingPo + FRONT_RANGE_FIXTURE_DATA.counts.purchasingShortages + FRONT_RANGE_FIXTURE_DATA.counts.purchasingReceipts,
        inventory: FRONT_RANGE_FIXTURE_DATA.counts.inventoryLocations + FRONT_RANGE_FIXTURE_DATA.counts.inventoryItems + FRONT_RANGE_FIXTURE_DATA.counts.inventoryLots + FRONT_RANGE_FIXTURE_DATA.counts.inventoryBalances + FRONT_RANGE_FIXTURE_DATA.counts.inventoryMovements,
        shopfloor: FRONT_RANGE_FIXTURE_DATA.counts.workCenters + FRONT_RANGE_FIXTURE_DATA.counts.travelers + FRONT_RANGE_FIXTURE_DATA.counts.travelerOperations + FRONT_RANGE_FIXTURE_DATA.counts.travelerBlockers,
        quality: FRONT_RANGE_FIXTURE_DATA.counts.qualityInspections + FRONT_RANGE_FIXTURE_DATA.counts.qualityNcrs,
        maintenance: FRONT_RANGE_FIXTURE_DATA.counts.equipmentAssets + FRONT_RANGE_FIXTURE_DATA.counts.maintenanceDowntimes + FRONT_RANGE_FIXTURE_DATA.counts.maintenanceWorkOrders,
        packaging: FRONT_RANGE_FIXTURE_DATA.counts.packagingSpecs + FRONT_RANGE_FIXTURE_DATA.counts.packagingUnits + FRONT_RANGE_FIXTURE_DATA.counts.packagedItems,
        shipping: FRONT_RANGE_FIXTURE_DATA.counts.shippingManifests + FRONT_RANGE_FIXTURE_DATA.counts.shippingStops + FRONT_RANGE_FIXTURE_DATA.counts.shippingPackages,
        files: FRONT_RANGE_FIXTURE_DATA.counts.fileVaultRecords,
        analytics: FRONT_RANGE_FIXTURE_DATA.counts.planningSuggestions,
        activityEvents: FRONT_RANGE_FIXTURE_DATA.counts.auditEvents,
      },
    };
  }

  /**
   * Resets the Front Range demo dataset for the active demo organization to golden baseline.
   * STRICT GUARDRAIL: Rejects production customer organizations.
   */
  reset(session: SessionContext): FrontRangeSeedingResult {
    this.assertDemoOrganization(session, "reset");
    this.clean(session);
    return this.seed(session);
  }

  /**
   * Removes seeded Front Range demo records for the organization.
   * STRICT GUARDRAIL: Rejects production customer organizations.
   */
  clean(session: SessionContext): { success: boolean; recordsRemoved: number } {
    this.assertDemoOrganization(session, "clean");
    const orgId = session.activeOrganization.id;

    if (!this.seededOrgs.has(orgId)) {
      return { success: true, recordsRemoved: 0 };
    }

    // Clear memory maps for this orgId
    quoteService["quotes"].delete(`qte_${orgId}_088`);
    jobService["jobs"].delete(`job_${orgId}_104`);
    packetIntelligenceService["documents"].delete(`doc_pkt_${orgId}_104`);
    purchasingService["shortages"].delete(`${orgId}:sh_${orgId}_1`);
    purchasingService["purchaseOrders"].delete(`po_${orgId}_042`);
    purchasingService["receipts"].delete(`${orgId}:rec_${orgId}_019`);
    shopfloorService["travelers"].delete(`trv_${orgId}_104`);
    qualityService["inspections"].delete(`insp_${orgId}_044`);
    qualityService["ncrs"].delete(`ncr_${orgId}_012`);
    maintenanceService["downtimeIntervals"].delete(`dt_${orgId}_001`);
    maintenanceService["workOrders"].delete(`wo_${orgId}_009`);
    packagingService["packages"].delete(`${orgId}:${FRONT_RANGE_FIXTURE_DATA.seededRecords.packageNumber}`);
    shippingService["manifests"].delete(`shp_${orgId}_088`);
    fileService["fileRecords"].delete(`file_${orgId}_dwg`);
    fileService["fileRecords"].delete(`file_${orgId}_mtr`);
    fileService["fileRecords"].delete(`file_${orgId}_fai`);
    analyticsService["suggestions"].delete(`sug_${orgId}_001`);

    this.seededOrgs.delete(orgId);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: orgId,
      action: "demo.organization_cleaned",
      summary: `Cleaned Front Range demo records for organization '${session.activeOrganization.name}'.`,
    });

    return { success: true, recordsRemoved: FRONT_RANGE_FIXTURE_DATA.counts.totalConnectedRecords };
  }
}

export const frontRangeSeeder = new FrontRangeSeeder();
