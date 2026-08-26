export type EvidenceType = "measured_fact" | "operator_estimate" | "unverified_unknown";

export type BriefingStatus = "draft" | "under_review" | "client_delivered" | "accepted";

export interface CurrentStateNode {
  stage: "intake" | "engineering_review" | "shopfloor_wip" | "quality_inspection" | "shipping_dispatch";
  stageTitle: string;
  currentTool: string;
  handOffMethod: string;
  frictionLevel: "low" | "medium" | "high" | "critical";
  observedFriction: string;
  evidenceType: EvidenceType;
  evidenceNotes: string;
}

export interface OpportunityRanking {
  rank: number;
  title: string;
  impact: "high" | "medium";
  effort: "low" | "medium" | "high";
  timeframe: string;
  recommendedModule: string;
  evidenceType: EvidenceType;
  evidenceBasis: string;
  operationalOutcome: string;
}

export interface ImplementationMilestone {
  milestoneNumber: number;
  title: string;
  targetScope: string;
  deliverables: string[];
  estimatedWeeks: string;
  priceRangeCents: { min: number; max: number };
  assumptions: string[];
  risks: string[];
}

export interface AuditClientBriefing {
  engagementId: string;
  organizationId: string;
  clientName: string;
  industry: string;
  version: string;
  status: BriefingStatus;
  deliveryDate: string;
  leadAuditor: string;
  approvedBy?: string;
  executiveSummary: string;
  currentStateMap: CurrentStateNode[];
  opportunityRankings: OpportunityRanking[];
  recommendedFirstRelease: {
    title: string;
    scopeSummary: string;
    keyCapabilities: string[];
    exclusions: string[];
  };
  implementationMilestones: ImplementationMilestone[];
  assumptionsAndRisks: {
    assumptions: string[];
    risks: string[];
    remediations: string[];
  };
  nextSteps: string[];
  internalNotes?: string;
}
