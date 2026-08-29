import { SessionContext } from "../../core/domain/types";
import { MOBILE_DETAIL_FIXTURE_DATA } from "../domain/mobile-detail-scenario";
import { quoteService } from "../../quoting/application/quote-service";
import { jobService } from "../../jobs/application/job-service";
import { inventoryService } from "../../inventory/application/inventory-service";
import { shopfloorService } from "../../shopfloor/application/shopfloor-service";
import { qualityService } from "../../quality/application/quality-service";
import { packagingService } from "../../packaging/application/packaging-service";
import { fileService } from "../../core/application/file-service";
import { analyticsService } from "../../analytics/application/analytics-service";
import { activityService } from "../../core/application/activity-service";

export interface MobileDetailSeedingResult {
  success: boolean;
  organizationId: string;
  scenarioSlug: string;
  totalRecordsSeeded: number;
  breakdown: {
    quotes: number;
    jobs: number;
    inventory: number;
    shopfloor: number;
    quality: number;
    packaging: number;
    files: number;
    analytics: number;
    activityEvents: number;
  };
}

export class MobileDetailSeeder {
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
   * Seeds the complete Peak Mobile Detail dataset into active demo organization.
   * STRICT GUARDRAIL: Immediately rejects any production or non-demo organization.
   */
  seed(session: SessionContext): MobileDetailSeedingResult {
    const org = this.assertDemoOrganization(session, "seed");
    const orgId = org.id;

    if (this.seededOrgs.has(orgId)) {
      return {
        success: true,
        organizationId: orgId,
        scenarioSlug: MOBILE_DETAIL_FIXTURE_DATA.organization.slug,
        totalRecordsSeeded: 0,
        breakdown: {
          quotes: 0,
          jobs: 0,
          inventory: 0,
          shopfloor: 0,
          quality: 0,
          packaging: 0,
          files: 0,
          analytics: 0,
          activityEvents: 0,
        },
      };
    }

    const { customer, seededRecords, inventoryItems, appointment } = MOBILE_DETAIL_FIXTURE_DATA;
    const now = new Date().toISOString();

    // 1. Quoting Domain
    const quote = {
      id: `qte_${orgId}_dtl_104`,
      organizationId: orgId,
      quoteNumber: seededRecords.quoteNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerContactEmail: customer.contactEmail,
      title: "Porsche 911 GT3 RS Track-Pack Ceramic Shield & Dry-Ice Detail",
      status: "converted_to_job" as const,
      currentRevisionNumber: 1,
      costModelType: "manufacturing_custom" as const,
      minMarginThresholdPercent: 40,
      requiresExecutiveApproval: false,
      executiveSignoffUserId: undefined,
      notes: "2024 Porsche 911 GT3 RS (Chalk Grey). Includes 9H ceramic coating + engine bay cryo-steam clean add-on.",
      targetDeliveryDate: "2026-08-25",
      expiresAt: "2026-09-30T00:00:00Z",
      convertedJobId: `job_${orgId}_dtl_104`,
      convertedAt: now,
      createdAt: now,
      updatedAt: now,
      revisions: [
        {
          revisionNumber: 1,
          changeReason: "Customer online booking with add-on confirmation.",
          subtotalCents: 85000,
          discountPercent: 0,
          discountAmountCents: 0,
          taxPercent: 0,
          taxAmountCents: 0,
          totalAmountCents: 85000,
          overallMarginPercent: 55.0,
          createdAt: now,
          createdByUserId: "usr_austin_ramirez",
          createdByName: "Austin Ramirez",
          lineItems: [
            {
              id: `qli_${orgId}_1`,
              lineItemNumber: 1,
              partDescription: appointment.packageName,
              drawingNumber: "SRV-CERAMIC-9H",
              revision: "A",
              quantity: 1,
              costBreakdown: {
                materialCostCents: 15600,
                laborCostCents: 18000,
                machineCostCents: 3000,
                outsourcingCostCents: 0,
                freightCostCents: 0,
                overheadCostCents: 1650,
                totalCostCents: 38250,
              },
              targetMarginPercent: 55.0,
              unitPriceCents: 85000,
              totalPriceCents: 85000,
            },
          ],
        },
      ],
    };
    quoteService["quotes"].set(quote.id, quote);

    // 2. Jobs Domain
    const job = {
      id: `job_${orgId}_dtl_104`,
      organizationId: orgId,
      jobNumber: seededRecords.jobNumber,
      title: "Porsche 911 GT3 RS Mobile Ceramic Coating Service",
      customerId: customer.id,
      customerName: customer.name,
      currentStatus: "in_progress" as const,
      priority: "standard" as const,
      currentRevision: "A",
      targetDueDate: "2026-08-25",
      estimatedLaborHours: 6,
      notes: "Location: 1120 Pearl St, Boulder. Austin Ramirez & Mobile Rig Unit #1 assigned.",
      revisions: [
        {
          revision: "A",
          changeSummary: "Booking confirmation with cryo-steam add-on.",
          changedByUserId: "usr_austin_ramirez",
          createdAt: now,
        },
      ],
      timeline: [
        {
          id: `time_${orgId}_1`,
          fromStatus: "draft" as const,
          toStatus: "intake_review" as const,
          actorUserId: "usr_austin_ramirez",
          actorName: "Austin Ramirez",
          reason: "Customer confirmed mobile detail booking via SMS.",
          timestamp: now,
        },
        {
          id: `time_${orgId}_2`,
          fromStatus: "intake_review" as const,
          toStatus: "in_progress" as const,
          actorUserId: "usr_austin_ramirez",
          actorName: "Austin Ramirez",
          reason: "Mobile rig arrived on-site and began two-bucket contact decon wash.",
          timestamp: now,
        },
      ],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    jobService["jobs"].set(job.id, job);

    // 3. Inventory Items & Movements
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
        fromLocationCode: "LOC-VAN-RIG-01",
        toLocationCode: "JOB-2026-DTL-104",
        referenceType: "job",
        referenceId: job.jobNumber,
        actorUserId: "usr_austin_ramirez",
        actorName: "Austin Ramirez",
        occurredAt: now,
        createdAt: now,
      };
      inventoryService["movements"].set(movementId, movement);
    });

    // 4. Shopfloor / Field Service Digital Traveler
    const traveler = {
      id: `trv_${orgId}_dtl_104`,
      organizationId: orgId,
      travelerNumber: seededRecords.travelerNumber,
      qrCodeData: `yorkstead://traveler/${seededRecords.travelerNumber}`,
      jobId: job.id,
      jobNumber: job.jobNumber,
      partDescription: appointment.packageName,
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
          workCenterCode: "WC-MOBILE-RIG-01",
          workCenterName: "Mobile Rig Unit #1 (Mercedes Sprinter 2500)",
          operationName: "pH-Neutral Snow Foam Decon & Chemical Iron Fallout Remover",
          requiredQuantity: 1,
          completedQuantity: 1,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_austin_ramirez",
          assignedOperatorName: "Austin Ramirez",
          actualLaborMinutes: 75,
        },
        {
          id: `op_${orgId}_20`,
          sequence: 20,
          workCenterCode: "WC-MOBILE-RIG-01",
          workCenterName: "Mobile Rig Unit #1 (Mercedes Sprinter 2500)",
          operationName: "Paint Depth Gauge Mapping & Single-Stage DA Polish",
          requiredQuantity: 1,
          completedQuantity: 1,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_austin_ramirez",
          assignedOperatorName: "Austin Ramirez",
          actualLaborMinutes: 120,
        },
        {
          id: `op_${orgId}_30`,
          sequence: 30,
          workCenterCode: "WC-MOBILE-RIG-01",
          workCenterName: "Mobile Rig Unit #1 (Mercedes Sprinter 2500)",
          operationName: "Dry-Ice Cryo-Steam Engine Bay Decon & Alcantara Steam Extraction",
          requiredQuantity: 1,
          completedQuantity: 1,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_austin_ramirez",
          assignedOperatorName: "Austin Ramirez",
          actualLaborMinutes: 60,
        },
        {
          id: `op_${orgId}_40`,
          sequence: 40,
          workCenterCode: "WC-MOBILE-RIG-01",
          workCenterName: "Mobile Rig Unit #1 (Mercedes Sprinter 2500)",
          operationName: "Gtechniq Crystal Serum Ultra 9H Ceramic Application & IR Cure",
          requiredQuantity: 1,
          completedQuantity: 1,
          scrappedQuantity: 0,
          status: "completed" as const,
          assignedOperatorId: "usr_austin_ramirez",
          assignedOperatorName: "Austin Ramirez",
          actualLaborMinutes: 90,
        },
      ],
      blockers: [],
    };
    shopfloorService["travelers"].set(traveler.id, traveler);

    // 5. Quality Inspection & Gloss Depth Reading Checkpoint
    const inspection = {
      id: `insp_${orgId}_dtl_104`,
      organizationId: orgId,
      inspectionType: "final_acceptance" as const,
      jobId: job.id,
      jobNumber: job.jobNumber,
      partDescription: "2024 Porsche 911 GT3 RS Ceramic Quartz Finish Inspection",
      travelerOperationId: `op_${orgId}_40`,
      inspectorUserId: "usr_austin_ramirez",
      inspectorName: "Austin Ramirez (Master Detailer)",
      status: "passed" as const,
      sampleSize: 4,
      passedQuantity: 4,
      failedQuantity: 0,
      checklist: [
        { id: "chk_gls_1", characteristic: "Paint Depth Gauge Clearcoat Safety Check", targetSpec: "> 100 microns across all panels", result: "pass" as const, measuredValue: "135 microns (Safe)" },
        { id: "chk_gls_2", characteristic: "Optical Gloss Meter Specular Reflection", targetSpec: "> 95 GU at 60 degree angle", result: "pass" as const, measuredValue: "98.4 GU (High Mirror)" },
        { id: "chk_gls_3", characteristic: "Ceramic Coating Hydrophobic Water Contact Angle", targetSpec: "> 110 degree bead angle", result: "pass" as const, measuredValue: "114 deg superhydrophobic" },
        { id: "chk_gls_4", characteristic: "Alcantara Low-Temp Steam & Brush Cleanliness", targetSpec: "Zero matting, 100% restored nap", result: "pass" as const, measuredValue: "Restored & Sealed" },
      ],
      completedAt: now,
      createdAt: now,
    };
    qualityService["inspections"].set(inspection.id, inspection);

    // 6. Packaging & Customer Aftercare Kit
    const pkgUnit = {
      id: `pkg_${orgId}_dtl_104`,
      organizationId: orgId,
      packageNumber: seededRecords.packageNumber,
      containerType: "box" as const,
      totalQuantity: 1,
      netWeightLbs: 3.5,
      tareWeightLbs: 0.5,
      grossWeightLbs: 4.0,
      maxCapacityLbs: 20.0,
      dimensionsInches: { length: 12, width: 10, height: 6 },
      labelBarcode: `BC-${seededRecords.packageNumber}`,
      status: "sealed_ready_for_shipping" as const,
      sealedAt: now,
      sealedByUserId: "usr_austin_ramirez",
      sealedByName: "Austin Ramirez",
      items: [
        {
          id: `pkgi_${orgId}_1`,
          jobId: job.id,
          jobNumber: job.jobNumber,
          partDescription: "Gtechniq Ceramic Aftercare Wash Kit & Plush Microfiber Towels",
          quantityPacked: 1,
          unitWeightLbs: 3.5,
          lotNumber: seededRecords.lotNumber,
        },
      ],
      createdAt: now,
    };
    packagingService["packages"].set(`${orgId}:${pkgUnit.packageNumber}`, pkgUnit);

    // 7. Document Vault Files
    const files = [
      {
        id: `file_${orgId}_photos_audit`,
        organizationId: orgId,
        uploadedByUserId: "usr_austin_ramirez",
        uploadedByName: "Austin Ramirez",
        filename: "Porsche-GT3RS-Before-After-Inspection-Audit.pdf",
        mimeType: "application/pdf",
        sizeBytes: 12450000,
        storageKey: "evidence/detail/Porsche-GT3RS-Before-After-Inspection-Audit.pdf",
        status: "clean" as const,
        entityType: "job",
        entityId: job.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `file_${orgId}_ceramic_warranty`,
        organizationId: orgId,
        uploadedByUserId: "usr_austin_ramirez",
        uploadedByName: "Austin Ramirez",
        filename: "Gtechniq-5-Year-Ceramic-Warranty-Certificate.pdf",
        mimeType: "application/pdf",
        sizeBytes: 620000,
        storageKey: "warranties/detail/Gtechniq-5-Year-Ceramic-Warranty-Certificate.pdf",
        status: "clean" as const,
        entityType: "job",
        entityId: job.id,
        createdAt: now,
        updatedAt: now,
      },
    ];
    files.forEach((f) => fileService["fileRecords"].set(f.id, f));

    // 8. Analytics Suggestion
    const suggestion = {
      id: `sug_${orgId}_van_route`,
      organizationId: orgId,
      title: "Route Efficiency: Cluster Flatirons & Downtown Boulder Bookings into Morning Shift",
      category: "workcenter_rebalance" as const,
      rationale: "Clustering Pearl St and Flatirons corporate park appointments saves 42 miles of transit and boosts daily van revenue by $450.",
      constraints: ["Ensure 2-hour IR cure window between jobs", "Maintain certified technician on rig"],
      tradeOffs: ["Tight 15-minute transit buffers vs unlocking a 3rd high-ticket ceramic job per day"],
      confidenceScore: 0.97,
      requiresHumanApproval: true as const,
      status: "approved" as const,
      approvedByUserId: "usr_austin_ramirez",
      approvedByName: "Austin Ramirez",
      approvedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    analyticsService["suggestions"].set(suggestion.id, suggestion);

    // 9. Comprehensive Activity Audit Trail
    const events = [
      { action: "quotes.created", entity: "quote" as const, id: quote.id, summary: `Customer booking quote ${quote.quoteNumber} created for ${customer.name} ($850.00).` },
      { action: "quotes.converted_to_job", entity: "quote" as const, id: quote.id, summary: `Quote ${quote.quoteNumber} converted to active mobile detail order ${job.jobNumber}.` },
      { action: "inventory.chemicals_issued", entity: "inventory_item" as const, id: "CHEM-CERAMIC-50ML", summary: "Gtechniq Crystal Serum Ultra 50ml issued to Mobile Rig #1." },
      { action: "shopfloor.traveler_released", entity: "traveler" as const, id: traveler.id, summary: `Digital Traveler ${traveler.travelerNumber} released across 4 mobile stages.` },
      { action: "quality.gloss_inspected", entity: "inspection" as const, id: inspection.id, summary: "Gloss meter score 98.4 GU and paint depth 135 microns verified." },
      { action: "packaging.care_kit_sealed", entity: "package" as const, id: pkgUnit.packageNumber, summary: "Customer ceramic aftercare kit packaged and sealed." },
      { action: "jobs.completed", entity: "job" as const, id: job.id, summary: `Mobile detail service completed. Simulated payment ${seededRecords.receiptId} captured.` },
      { action: "analytics.suggestion_approved", entity: "job" as const, id: suggestion.id, summary: "Boulder route clustering suggestion approved by Master Detailer." },
    ];

    events.forEach((e) => {
      activityService.logActivity({
        organizationId: orgId,
        actorId: "usr_austin_ramirez",
        actorName: "Austin Ramirez",
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
      scenarioSlug: MOBILE_DETAIL_FIXTURE_DATA.organization.slug,
      totalRecordsSeeded: MOBILE_DETAIL_FIXTURE_DATA.counts.totalConnectedRecords,
      breakdown: {
        quotes: MOBILE_DETAIL_FIXTURE_DATA.counts.quotes,
        jobs: MOBILE_DETAIL_FIXTURE_DATA.counts.jobs,
        inventory: MOBILE_DETAIL_FIXTURE_DATA.counts.inventoryItems + MOBILE_DETAIL_FIXTURE_DATA.counts.inventoryMovements,
        shopfloor: MOBILE_DETAIL_FIXTURE_DATA.counts.travelers + MOBILE_DETAIL_FIXTURE_DATA.counts.travelerOperations,
        quality: MOBILE_DETAIL_FIXTURE_DATA.counts.qualityInspections,
        packaging: MOBILE_DETAIL_FIXTURE_DATA.counts.packagingUnits,
        files: MOBILE_DETAIL_FIXTURE_DATA.counts.fileVaultRecords,
        analytics: MOBILE_DETAIL_FIXTURE_DATA.counts.planningSuggestions,
        activityEvents: MOBILE_DETAIL_FIXTURE_DATA.counts.auditEvents,
      },
    };
  }

  /**
   * Resets Peak Mobile Detail dataset for active demo organization to golden baseline.
   * STRICT GUARDRAIL: Rejects production customer organizations.
   */
  reset(session: SessionContext): MobileDetailSeedingResult {
    this.assertDemoOrganization(session, "reset");
    this.clean(session);
    return this.seed(session);
  }

  /**
   * Removes seeded Peak Mobile Detail demo records for the organization.
   * STRICT GUARDRAIL: Rejects production customer organizations.
   */
  clean(session: SessionContext): { success: boolean; recordsRemoved: number } {
    this.assertDemoOrganization(session, "clean");
    const orgId = session.activeOrganization.id;

    if (!this.seededOrgs.has(orgId)) {
      return { success: true, recordsRemoved: 0 };
    }

    quoteService["quotes"].delete(`qte_${orgId}_dtl_104`);
    jobService["jobs"].delete(`job_${orgId}_dtl_104`);
    shopfloorService["travelers"].delete(`trv_${orgId}_dtl_104`);
    qualityService["inspections"].delete(`insp_${orgId}_dtl_104`);
    packagingService["packages"].delete(`${orgId}:${MOBILE_DETAIL_FIXTURE_DATA.seededRecords.packageNumber}`);
    fileService["fileRecords"].delete(`file_${orgId}_photos_audit`);
    fileService["fileRecords"].delete(`file_${orgId}_ceramic_warranty`);
    analyticsService["suggestions"].delete(`sug_${orgId}_van_route`);

    this.seededOrgs.delete(orgId);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: orgId,
      action: "demo.organization_cleaned",
      summary: `Cleaned Peak Mobile Detail demo records for organization '${session.activeOrganization.name}'.`,
    });

    return { success: true, recordsRemoved: MOBILE_DETAIL_FIXTURE_DATA.counts.totalConnectedRecords };
  }
}

export const mobileDetailSeeder = new MobileDetailSeeder();
