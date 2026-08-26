import {
  OperationalMetric,
  NeedsAttentionItem,
  CapacitySignal,
  PlanningSuggestion,
  ExecutiveDashboardSummary,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";
import { jobService } from "../../jobs/application/job-service";
import { qualityService } from "../../quality/application/quality-service";
import { maintenanceService } from "../../maintenance/application/maintenance-service";
import { shippingService } from "../../shipping/application/shipping-service";
import { quoteService } from "../../quoting/application/quote-service";
import { purchasingService } from "../../purchasing/application/purchasing-service";

export class AnalyticsService {
  private suggestions: Map<string, PlanningSuggestion> = new Map();

  constructor() {
    this.seedDefaultSuggestions("org_default");
  }

  private seedDefaultSuggestions(orgId: string) {
    const sug1: PlanningSuggestion = {
      id: "sug_1",
      title: "Rebalance Press Brake Shift Allocation to Prevent Overload",
      category: "workcenter_rebalance",
      rationale: "EQ-BRAKE-02 is committed at 104.2% weekly capacity across 3 released aerospace jobs.",
      constraints: [
        "Qualified Operator Dave Miller must oversee high-tonnage forming setup.",
        "Secondary brake (EQ-BRAKE-01) tooling requires 45-minute changeover.",
      ],
      tradeOffs: [
        "Adds 45min setup downtime but relieves bottleneck and ensures on-time shipment for JOB-2026-104.",
      ],
      confidenceScore: 0.92,
      requiresHumanApproval: true,
      status: "pending",
    };
    this.suggestions.set(`${orgId}:${sug1.id}`, sug1);
  }

  // 1. Get Comprehensive Executive Metrics (Reconciled to module facts)
  getExecutiveDashboardMetrics(session: SessionContext): ExecutiveDashboardSummary {
    const now = new Date().toISOString();

    // Pull verified domain metrics from respective modules
    const jobs = jobService.listJobs(session);
    const qualityMetrics = qualityService.getQualityMetrics(session);
    const fleetMetrics = maintenanceService.getMaintenanceMetrics(session);
    const shippingMetrics = shippingService.getShippingMetrics(session);
    const quoteMetrics = quoteService.getQuoteMetrics(session);
    const purchasingMetrics = purchasingService.getPurchasingMetrics(session);

    // Compute Schedule Adherence
    const activeJobs = jobs.filter((j) => j.currentStatus !== "closed" && j.currentStatus !== "completed");
    const onTrackJobs = activeJobs.filter((j) => j.currentStatus !== "on_hold");
    const scheduleAdherence = activeJobs.length > 0 ? Math.round((onTrackJobs.length / activeJobs.length) * 1000) / 10 : 94.5;

    const metrics: OperationalMetric[] = [
      {
        metricKey: "schedule_adherence",
        title: "Schedule Adherence Rate",
        businessQuestion: "What percentage of active released production jobs are proceeding without holds?",
        owner: "Operations Director",
        formula: "(Active Jobs without Blockers / Total Active Jobs) * 100",
        grain: "Shopfloor Active Work Orders",
        sourceOfTruth: "JobService.listJobs",
        valueFormatted: `${scheduleAdherence}%`,
        numericValue: scheduleAdherence,
        unit: "%",
        targetFormatted: ">= 95.0%",
        targetNumeric: 95.0,
        status: scheduleAdherence >= 95 ? "healthy" : scheduleAdherence >= 90 ? "warning" : "critical",
        freshnessTimestamp: now,
        knownLimitations: "Excludes draft RFQs; reflects only released shopfloor work orders.",
      },
      {
        metricKey: "first_pass_yield",
        title: "First Pass Quality Yield (FPY)",
        businessQuestion: "What percentage of inspected parts pass FAI without non-conformance disposition?",
        owner: "Quality Manager",
        formula: "(Accepted FAI Inspections / Total Inspections) * 100",
        grain: "First Article & In-Process Inspection Sheets",
        sourceOfTruth: "QualityService.getQualityMetrics",
        valueFormatted: `${qualityMetrics.firstPassYieldPercentage}%`,
        numericValue: qualityMetrics.firstPassYieldPercentage,
        unit: "%",
        targetFormatted: ">= 98.0%",
        targetNumeric: 98.0,
        status: qualityMetrics.firstPassYieldPercentage >= 98 ? "healthy" : "warning",
        freshnessTimestamp: now,
        knownLimitations: "Covers verified FAI checkpoints; does not include minor in-station visual touch-ups.",
      },
      {
        metricKey: "fleet_uptime",
        title: "Equipment Availability & Fleet Uptime",
        businessQuestion: "What percentage of capital machinery is currently operational and ready for production?",
        owner: "Plant Maintenance Lead",
        formula: "((Total Fleet Hours - Unscheduled Downtime) / Total Fleet Hours) * 100",
        grain: "Machine Downtime Intervals",
        sourceOfTruth: "MaintenanceService.getMaintenanceMetrics",
        valueFormatted: `${fleetMetrics.operationalUptimePercentage}%`,
        numericValue: fleetMetrics.operationalUptimePercentage,
        unit: "%",
        targetFormatted: ">= 95.0%",
        targetNumeric: 95.0,
        status: fleetMetrics.operationalUptimePercentage >= 95 ? "healthy" : "warning",
        freshnessTimestamp: now,
        knownLimitations: "Scheduled preventive maintenance windows are excluded from unscheduled downtime.",
      },
      {
        metricKey: "on_time_shipment",
        title: "On-Time Dispatch Rate (OTD)",
        businessQuestion: "What percentage of shipments are dispatched on or before customer promise date?",
        owner: "Logistics Lead",
        formula: "(On-Time Dispatched Shipments / Total Shipments) * 100",
        grain: "Shipping Manifests & BOL Records",
        sourceOfTruth: "ShippingService.getLogisticsMetrics",
        valueFormatted: `${shippingMetrics.onTimeDeliveryPercentage}%`,
        numericValue: shippingMetrics.onTimeDeliveryPercentage,
        unit: "%",
        targetFormatted: ">= 98.0%",
        targetNumeric: 98.0,
        status: shippingMetrics.onTimeDeliveryPercentage >= 98 ? "healthy" : "warning",
        freshnessTimestamp: now,
        knownLimitations: "Measured from factory dock gate dispatch timestamp.",
      },
      {
        metricKey: "quote_win_rate",
        title: "Quote-to-Job Conversion Rate",
        businessQuestion: "What percentage of approved customer RFQs convert into active production jobs?",
        owner: "Sales & Estimating Director",
        formula: "(Converted Quotes / Total Issued Quotes) * 100",
        grain: "Quote Revisions & Job Handoffs",
        sourceOfTruth: "QuoteService.getQuoteMetrics",
        valueFormatted: `${quoteMetrics.winRatePercentage}%`,
        numericValue: quoteMetrics.winRatePercentage,
        unit: "%",
        targetFormatted: ">= 65.0%",
        targetNumeric: 65.0,
        status: quoteMetrics.winRatePercentage >= 65 ? "healthy" : "warning",
        freshnessTimestamp: now,
        knownLimitations: "Calculated across quotes issued in current operating cycle.",
      },
      {
        metricKey: "supplier_reliability",
        title: "Vendor On-Time Delivery Rate",
        businessQuestion: "What percentage of raw material and hardware purchase orders arrive by promise date?",
        owner: "Purchasing Agent",
        formula: "(On-Time PO Receipts / Total Completed POs) * 100",
        grain: "Purchase Orders & Dock Receipts",
        sourceOfTruth: "PurchasingService.getPurchasingMetrics",
        valueFormatted: `${purchasingMetrics.onTimeSupplierDeliveryPercentage}%`,
        numericValue: purchasingMetrics.onTimeSupplierDeliveryPercentage,
        unit: "%",
        targetFormatted: ">= 95.0%",
        targetNumeric: 95.0,
        status: purchasingMetrics.onTimeSupplierDeliveryPercentage >= 95 ? "healthy" : "warning",
        freshnessTimestamp: now,
        knownLimitations: "Reflects approved tier-1 supplier receipts.",
      },
    ];

    // 2. Needs Attention Queue (Live aggregation across factory operations)
    const needsAttentionQueue: NeedsAttentionItem[] = [];

    // Shortages
    const shortages = purchasingService.listShortages(session);
    for (const sh of shortages) {
      if (sh.urgency === "urgent" || sh.urgency === "critical_line_down") {
        needsAttentionQueue.push({
          id: `na_sh_${sh.id}`,
          module: "purchasing",
          severity: "critical",
          title: `Material Shortage Holding ${sh.jobNumber || "Released Jobs"}`,
          description: `${sh.description}: Need ${sh.shortageQuantity} ${sh.uom} by ${sh.neededByDate}.`,
          recommendedAction: "Transmit expedited purchase order to preferred distributor.",
          constraints: ["Standard supplier lead time is 3 days.", "Overnight freight surcharge applies."],
          tradeOffs: ["$150 freight fee avoids 48h workcenter idle time."],
          link: `/purchasing`,
          actionLabel: "Expedite Material PO",
        });
      }
    }

    // Equipment Downtime
    const assets = maintenanceService.listEquipment(session);
    for (const asset of assets) {
      if (asset.status !== "operational") {
        needsAttentionQueue.push({
          id: `na_asset_${asset.id}`,
          module: "maintenance",
          severity: "critical",
          title: `Unscheduled Downtime: ${asset.name} (${asset.assetTag})`,
          description: "Machine halted on error code; work order queued for return-to-service signoff.",
          recommendedAction: "Review technician work log and authorize return-to-service checklist.",
          constraints: ["Requires dual technician and quality signoff before LOTO release."],
          tradeOffs: ["Ensures optical calibration before resuming laser cutting."],
          link: `/maintenance`,
          actionLabel: "Authorize Maintenance Signoff",
        });
      }
    }

    // Capacity Signals
    const capacitySignals: CapacitySignal[] = [
      {
        workCenterCode: "WC-LASER",
        workCenterName: "Laser Cutting Cell (6kW Fiber)",
        availableHoursWeekly: 80,
        committedHoursWeekly: 62.5,
        utilizationPercentage: 78.1,
        status: "balanced",
      },
      {
        workCenterCode: "WC-BRAKE",
        workCenterName: "CNC Press Brake Cell (220-Ton)",
        availableHoursWeekly: 80,
        committedHoursWeekly: 83.4,
        utilizationPercentage: 104.2,
        status: "overloaded",
      },
      {
        workCenterCode: "WC-WELD",
        workCenterName: "TIG/MIG Welding & Assembly",
        availableHoursWeekly: 120,
        committedHoursWeekly: 94.0,
        utilizationPercentage: 78.3,
        status: "balanced",
      },
      {
        workCenterCode: "WC-FINISH",
        workCenterName: "Deburring, Graining & Powder Coat",
        availableHoursWeekly: 80,
        committedHoursWeekly: 72.0,
        utilizationPercentage: 90.0,
        status: "near_capacity",
      },
    ];

    const orgSuggestions = Array.from(this.suggestions.values());

    return {
      metrics,
      needsAttentionQueue,
      capacitySignals,
      planningSuggestions: orgSuggestions,
      lastRefreshedAt: now,
    };
  }

  // 3. Human Confirmation for Planning Suggestions
  approvePlanningSuggestion(session: SessionContext, suggestionId: string): PlanningSuggestion {
    authorizationService.requireCapability(session, "jobs:update_status");

    const sug = Array.from(this.suggestions.values()).find((s) => s.id === suggestionId);
    if (!sug) {
      throw new Error(`Planning suggestion '${suggestionId}' not found.`);
    }

    const now = new Date().toISOString();
    sug.status = "approved";
    sug.approvedByUserId = session.user.id;
    sug.approvedByName = session.user.name;
    sug.approvedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: sug.id,
      action: "analytics.suggestion_approved",
      summary: `Approved operational rebalance plan: "${sug.title}" by ${session.user.name}.`,
    });

    return sug;
  }

  dismissPlanningSuggestion(
    session: SessionContext,
    suggestionId: string,
    reason: string
  ): PlanningSuggestion {
    authorizationService.requireCapability(session, "jobs:update_status");

    const sug = Array.from(this.suggestions.values()).find((s) => s.id === suggestionId);
    if (!sug) {
      throw new Error(`Planning suggestion '${suggestionId}' not found.`);
    }

    sug.status = "dismissed";
    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: sug.id,
      action: "analytics.suggestion_dismissed",
      summary: `Dismissed AI Planning Suggestion "${sug.title}" (Reason: ${reason})`,
    });

    return sug;
  }
}

export const analyticsService = new AnalyticsService();
