import {
  AuditAnswerInput,
  AuditDiagnosticReport,
  AuditOpportunityFinding,
  CategoryScoreSummary,
  FrictionCategory,
} from "./types";
import { STANDARD_AUDIT_QUESTIONS } from "./questions";

export function calculateAuditReport(
  engagementId: string,
  clientName: string,
  industry: string,
  auditDate: string,
  answers: Record<string, AuditAnswerInput>
): AuditDiagnosticReport {
  const categoryMap: Record<
    FrictionCategory,
    {
      categoryTitle: string;
      weightedScoreSum: number;
      maxWeightedScoreSum: number;
      measuredHours: number;
      estimatedHours: number;
      findings: AuditOpportunityFinding[];
    }
  > = {
    intake_quoting: {
      categoryTitle: "Intake & Quoting",
      weightedScoreSum: 0,
      maxWeightedScoreSum: 0,
      measuredHours: 0,
      estimatedHours: 0,
      findings: [],
    },
    shopfloor_tracking: {
      categoryTitle: "Shopfloor & Work-in-Progress",
      weightedScoreSum: 0,
      maxWeightedScoreSum: 0,
      measuredHours: 0,
      estimatedHours: 0,
      findings: [],
    },
    inventory_control: {
      categoryTitle: "Inventory & Material Control",
      weightedScoreSum: 0,
      maxWeightedScoreSum: 0,
      measuredHours: 0,
      estimatedHours: 0,
      findings: [],
    },
    quality_maintenance: {
      categoryTitle: "Quality & Preventive Maintenance",
      weightedScoreSum: 0,
      maxWeightedScoreSum: 0,
      measuredHours: 0,
      estimatedHours: 0,
      findings: [],
    },
    shipping_billing: {
      categoryTitle: "Packaging, Shipping & Invoicing",
      weightedScoreSum: 0,
      maxWeightedScoreSum: 0,
      measuredHours: 0,
      estimatedHours: 0,
      findings: [],
    },
  };

  for (const question of STANDARD_AUDIT_QUESTIONS) {
    const answer = answers[question.id];
    const cat = categoryMap[question.category];
    const maxScore = question.weight * 5;
    cat.maxWeightedScoreSum += maxScore;

    if (answer) {
      const weightedScore = answer.score * question.weight;
      cat.weightedScoreSum += weightedScore;

      if (answer.factType === "measured_fact") {
        cat.measuredHours += answer.estimatedHoursLostWeekly;
      } else {
        cat.estimatedHours += answer.estimatedHoursLostWeekly;
      }

      // Generate opportunity finding if score is below 4 (has noticeable friction)
      if (answer.score < 4) {
        cat.findings.push({
          category: question.category,
          title: `Friction in ${question.categoryTitle}: ${question.questionText}`,
          frictionSummary: answer.evidenceNotes || "Manual touchpoints causing operational drag.",
          rootCause: answer.score <= 2 ? "Absence of digital system of record; relying on paper/verbal handoffs." : "Disconnected tools requiring double-entry.",
          estimatedWeeklyWasteHours: answer.estimatedHoursLostWeekly,
          isEstimate: answer.factType === "operator_estimate",
          confidenceLevel: answer.factType === "measured_fact" ? "high" : "medium",
          recommendation: getCategoryRecommendation(question.category),
          suggestedModule: getCategoryModule(question.category),
        });
      }
    } else {
      // Default to neutral middle if unanswered
      cat.weightedScoreSum += 3 * question.weight;
    }
  }

  let totalWeightedScore = 0;
  let totalMaxWeightedScore = 0;
  let totalMeasuredHours = 0;
  let totalEstimatedHours = 0;
  const allFindings: AuditOpportunityFinding[] = [];

  const categorySummaries: CategoryScoreSummary[] = (
    Object.keys(categoryMap) as FrictionCategory[]
  ).map((catKey) => {
    const catData = categoryMap[catKey];
    totalWeightedScore += catData.weightedScoreSum;
    totalMaxWeightedScore += catData.maxWeightedScoreSum;
    totalMeasuredHours += catData.measuredHours;
    totalEstimatedHours += catData.estimatedHours;
    allFindings.push(...catData.findings);

    const efficiencyPct = Math.round(
      (catData.weightedScoreSum / (catData.maxWeightedScoreSum || 1)) * 100
    );
    const frictionPct = 100 - efficiencyPct;

    return {
      category: catKey,
      categoryTitle: catData.categoryTitle,
      efficiencyScore: efficiencyPct,
      frictionScore: frictionPct,
      measuredHoursLostWeekly: catData.measuredHours,
      estimatedHoursLostWeekly: catData.estimatedHours,
      totalHoursLostWeekly: catData.measuredHours + catData.estimatedHours,
      findingsCount: catData.findings.length,
    };
  });

  const overallEfficiency = Math.round(
    (totalWeightedScore / (totalMaxWeightedScore || 1)) * 100
  );
  const overallFriction = 100 - overallEfficiency;
  const totalAnnualHours = (totalMeasuredHours + totalEstimatedHours) * 50; // 50 working weeks

  // Sort findings by severity and waste hours
  allFindings.sort((a, b) => b.estimatedWeeklyWasteHours - a.estimatedWeeklyWasteHours);

  return {
    engagementId,
    clientName: clientName || "Untitled Organization",
    industry: industry || "General Manufacturing & Fabrication",
    auditDate: auditDate || new Date().toISOString().split("T")[0],
    overallEfficiencyScore: overallEfficiency,
    overallFrictionScore: overallFriction,
    totalMeasuredWeeklyWasteHours: totalMeasuredHours,
    totalEstimatedWeeklyWasteHours: totalEstimatedHours,
    totalAnnualWasteHours: totalAnnualHours,
    categorySummaries,
    topOpportunities: allFindings,
    recommendedPhases: [
      {
        phase: 1,
        title: "Digital Traveler & Shopfloor Visibility",
        targetFriction: "Eliminate paper traveler loss and manual WIP status checks.",
        recommendedModule: "ShopFloor Module (Digital Traveler)",
        expectedBenefit: "Immediate real-time work center tracking and station accountability.",
      },
      {
        phase: 2,
        title: "Inventory & Allocation Accuracy",
        targetFriction: "Prevent material stockouts and unrecorded inventory shrinkage.",
        recommendedModule: "Inventory & Material Module",
        expectedBenefit: "Automated lot tracking and accurate job packet allocations.",
      },
      {
        phase: 3,
        title: "Intake, Quoting & Margin Intelligence",
        targetFriction: "Accelerate RFQ response time and eliminate margin calculation leakage.",
        recommendedModule: "QuoteFlow & Pricing Module",
        expectedBenefit: "Standardized estimate-to-job conversion with audit trail.",
      },
    ],
  };
}

function getCategoryRecommendation(category: FrictionCategory): string {
  switch (category) {
    case "intake_quoting":
      return "Implement standardized quote-to-job intake with automated bill-of-materials costing.";
    case "shopfloor_tracking":
      return "Deploy interactive tablet traveler stations with barcode scanning and instant status updates.";
    case "inventory_control":
      return "Establish perpetual lot-tracked inventory locations with threshold reorder triggers.";
    case "quality_maintenance":
      return "Codify mandatory first-piece inspection checklists and machine hour maintenance tracking.";
    case "shipping_billing":
      return "Integrate packing-slip generation and instant invoice readiness upon shipment completion.";
  }
}

function getCategoryModule(category: FrictionCategory): string {
  switch (category) {
    case "intake_quoting":
      return "modules/quoting";
    case "shopfloor_tracking":
      return "modules/production";
    case "inventory_control":
      return "modules/inventory";
    case "quality_maintenance":
      return "modules/quality";
    case "shipping_billing":
      return "modules/shipping";
  }
}
