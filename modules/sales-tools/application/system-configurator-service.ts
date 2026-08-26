import type {
  ConfiguratorSelections,
  SystemDiscussionBrief,
  CompatibilityNotice,
  RecommendedMilestone,
  SystemModuleId
} from "../domain/system-configurator";

export const availableModules: { id: SystemModuleId; name: string; category: string; description: string; basePriceMinCents: number; basePriceMaxCents: number }[] = [
  {
    id: "quoteflow_estimating",
    name: "QuoteFlow & Margin Estimating",
    category: "Commercial Governance",
    description: "Integer-cents machine run rates, material yield loss math, and 25% executive margin approval guardrails.",
    basePriceMinCents: 350000,
    basePriceMaxCents: 500000,
  },
  {
    id: "shopfloor_travelers",
    name: "Digital Shopfloor Travelers",
    category: "Manufacturing Execution",
    description: "Touchscreen station travelers with CAD revision locking, QR code scanning, and live blocker reporting.",
    basePriceMinCents: 450000,
    basePriceMaxCents: 650000,
  },
  {
    id: "quality_ncr",
    name: "Quality & NCR Containment",
    category: "Quality Assurance",
    description: "First Article Inspection (FAI) dimensional checklists and segregated scrap/rework quarantine workflows.",
    basePriceMinCents: 250000,
    basePriceMaxCents: 350000,
  },
  {
    id: "inventory_ledger",
    name: "Immutable Material Ledger",
    category: "Inventory & Purchasing",
    description: "Double-entry inventory ledger with negative stock overdraft prevention and dock receiving PO approvals.",
    basePriceMinCents: 350000,
    basePriceMaxCents: 450000,
  },
  {
    id: "shipping_palletization",
    name: "Pallet Load Builder & Shipping",
    category: "Logistics & Dispatch",
    description: "Container capacity constraint calculations, gross shipping weight math, and carrier BOL manifests.",
    basePriceMinCents: 300000,
    basePriceMaxCents: 400000,
  },
  {
    id: "maintenance_loto",
    name: "Maintenance, Telemetry & LOTO",
    category: "Plant Operations",
    description: "Equipment runtime monitoring, lockout/tagout safety checklists, and preventive maintenance work orders.",
    basePriceMinCents: 300000,
    basePriceMaxCents: 450000,
  },
  {
    id: "knowledge_sops",
    name: "KnowHow Citation-Backed SOPs",
    category: "Operational Knowledge",
    description: "Searchable standard operating procedures with direct OEM manual passage citations and revision audit trails.",
    basePriceMinCents: 200000,
    basePriceMaxCents: 300000,
  },
  {
    id: "analytics_planning",
    name: "Capacity & Operating Analytics",
    category: "Executive Intelligence",
    description: "Real-time WIP valuation, first-pass yield tracking, machine uptime statistics, and operator throughput signals.",
    basePriceMinCents: 250000,
    basePriceMaxCents: 350000,
  },
];

export class SystemConfiguratorService {
  static evaluateCompatibility(selections: ConfiguratorSelections): CompatibilityNotice[] {
    const notices: CompatibilityNotice[] = [];

    // Rule 1: Shipping without Inventory recommends adding Material Ledger
    if (
      selections.selectedModules.includes("shipping_palletization") &&
      !selections.selectedModules.includes("inventory_ledger")
    ) {
      notices.push({
        level: "recommendation",
        title: "Recommended Prerequisite: Immutable Material Ledger",
        message: "Building pallet loads without the Material Ledger means stock deductions must be reconciled manually at dispatch.",
      });
    }

    // Rule 2: Quality NCR without Shopfloor Travelers
    if (
      selections.selectedModules.includes("quality_ncr") &&
      !selections.selectedModules.includes("shopfloor_travelers")
    ) {
      notices.push({
        level: "info",
        title: "Independent Quality Inspection Bench",
        message: "Quality FAI checklists will operate as a standalone inspection station rather than integrated into station-by-station traveler step signoffs.",
      });
    }

    // Rule 3: Hardware PLC Telemetry Safety Isolation
    if (selections.integrations.includes("modbus_plc_telemetry")) {
      notices.push({
        level: "warning",
        title: "Industrial Safety Constraint: Read-Only Telemetry",
        message: "Modbus TCP machine telemetry is strictly unidirectional (read-only monitoring). Direct PLC actuator write commands are blocked by Yorkstead safety policy.",
      });
    }

    // Rule 4: Mobile tech role selected without field-capable modules
    if (
      selections.roles.includes("field_technician") &&
      !selections.selectedModules.includes("shopfloor_travelers") &&
      !selections.selectedModules.includes("maintenance_loto")
    ) {
      notices.push({
        level: "recommendation",
        title: "Field Technician Interface Scope",
        message: "Selecting Field Technician works best when paired with ShopFloor Mobile Travelers or Maintenance & LOTO Work Orders.",
      });
    }

    return notices;
  }

  static generateDiscussionBrief(selections: ConfiguratorSelections): SystemDiscussionBrief {
    const briefId = `brief_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString().split("T")[0];

    const compatibilityNotices = this.evaluateCompatibility(selections);

    // Build Phased Milestone Recommendations
    const phases: RecommendedMilestone[] = [];
    let phaseCount = 1;

    // Phase 1: Core Foundation + Highest Leverage Execution Module
    if (selections.selectedModules.includes("shopfloor_travelers")) {
      phases.push({
        phase: phaseCount++,
        title: "Core Foundation & Shopfloor Traveler Pilot",
        includedModules: ["shopfloor_travelers"],
        durationWeeks: "3 weeks",
        estimatedPriceRangeCents: { min: 450000, max: 650000 },
        rationale: "Immediate elimination of drawing revision mismatches and paper traveler friction on the shop floor.",
      });
    } else if (selections.selectedModules.includes("quoteflow_estimating")) {
      phases.push({
        phase: phaseCount++,
        title: "Core Foundation & QuoteFlow Estimating",
        includedModules: ["quoteflow_estimating"],
        durationWeeks: "2-3 weeks",
        estimatedPriceRangeCents: { min: 350000, max: 500000 },
        rationale: "Establish margin guardrails and cut RFQ estimating turnaround times.",
      });
    } else {
      const firstMod = selections.selectedModules[0] || "shopfloor_travelers";
      phases.push({
        phase: phaseCount++,
        title: "Core Foundation & Primary Workflow Slice",
        includedModules: [firstMod],
        durationWeeks: "3 weeks",
        estimatedPriceRangeCents: { min: 400000, max: 600000 },
        rationale: "Deploy baseline tenant database, master data, and target operational module.",
      });
    }

    // Phase 2: Commercial or Sourcing Operations
    const remainingModules = selections.selectedModules.filter(
      (m) => !phases[0].includedModules.includes(m)
    );

    if (remainingModules.length > 0) {
      const midSlice = remainingModules.slice(0, 2);
      let minCents = 0;
      let maxCents = 0;
      for (const mId of midSlice) {
        const found = availableModules.find((am) => am.id === mId);
        if (found) {
          minCents += found.basePriceMinCents;
          maxCents += found.basePriceMaxCents;
        }
      }

      phases.push({
        phase: phaseCount++,
        title: "Operational Expansion & Department Workflows",
        includedModules: midSlice,
        durationWeeks: "3-4 weeks",
        estimatedPriceRangeCents: { min: minCents || 300000, max: maxCents || 500000 },
        rationale: "Connect upstream quoting and downstream quality/inventory handoffs.",
      });
    }

    // Calculate Total Cost Bounds
    let totalMin = 0;
    let totalMax = 0;
    for (const p of phases) {
      totalMin += p.estimatedPriceRangeCents.min;
      totalMax += p.estimatedPriceRangeCents.max;
    }

    return {
      briefId,
      generatedAt: now,
      selections,
      recommendedFirstSlice: phases[0]?.title || "Core Foundation Vertical Slice",
      recommendedPhases: phases,
      compatibilityNotices,
      estimatedTotalScopeCents: { min: totalMin, max: totalMax },
      assumptions: [
        "Estimates represent bounded fixed-milestone pricing in integer cents; no speculative ROI numbers.",
        "Each milestone delivers a verified, production-ready vertical slice covered by automated tests.",
        "Zero customer data is shared between tenant organizations.",
      ],
      guardrails: [
        "This brief serves as an engineering discussion guide for scoping, not an automated binding contract.",
        "Final fixed-fee proposals require a 90-minute Workflow Audit to inspect shopfloor physical handoffs.",
      ],
      disclaimer: "Non-binding discussion brief generated by Yorkstead Systems configurator. All financial models operate in integer cents.",
    };
  }
}
