export type FrictionCategory =
  | "intake_quoting"
  | "shopfloor_tracking"
  | "inventory_control"
  | "quality_maintenance"
  | "shipping_billing";

export type FactType = "measured_fact" | "operator_estimate";
export type BottleneckSeverity = "low" | "medium" | "high" | "critical";
export type ConfidenceLevel = "high" | "medium" | "low";
export type AuditStatus = "draft" | "in_progress" | "completed";

export interface AuditQuestion {
  id: string;
  category: FrictionCategory;
  categoryTitle: string;
  questionText: string;
  description: string;
  weight: number; // 1 to 3
}

export interface AuditAnswerInput {
  questionId: string;
  score: number; // 1 (Severe Friction) to 5 (Fully Automated / Seamless)
  factType: FactType;
  evidenceNotes: string;
  estimatedHoursLostWeekly: number;
  severity: BottleneckSeverity;
}

export interface AuditOpportunityFinding {
  category: FrictionCategory;
  title: string;
  frictionSummary: string;
  rootCause: string;
  estimatedWeeklyWasteHours: number;
  isEstimate: boolean;
  confidenceLevel: ConfidenceLevel;
  recommendation: string;
  suggestedModule: string;
}

export interface CategoryScoreSummary {
  category: FrictionCategory;
  categoryTitle: string;
  efficiencyScore: number; // 0 to 100
  frictionScore: number;   // 0 to 100
  measuredHoursLostWeekly: number;
  estimatedHoursLostWeekly: number;
  totalHoursLostWeekly: number;
  findingsCount: number;
}

export interface AuditDiagnosticReport {
  engagementId: string;
  clientName: string;
  industry: string;
  auditDate: string;
  overallEfficiencyScore: number; // 0 to 100
  overallFrictionScore: number;   // 0 to 100
  totalMeasuredWeeklyWasteHours: number;
  totalEstimatedWeeklyWasteHours: number;
  totalAnnualWasteHours: number;
  categorySummaries: CategoryScoreSummary[];
  topOpportunities: AuditOpportunityFinding[];
  recommendedPhases: {
    phase: number;
    title: string;
    targetFriction: string;
    recommendedModule: string;
    expectedBenefit: string;
  }[];
}

export interface AuditEngagement {
  id: string;
  organizationId: string;
  clientName: string;
  industry: string;
  leadAuditor: string;
  status: AuditStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, AuditAnswerInput>;
}
