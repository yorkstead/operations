export type InspectionType =
  | "first_article"
  | "in_process"
  | "final_acceptance"
  | "receiving_dock";

export type InspectionStatus =
  | "pending"
  | "passed"
  | "failed"
  | "passed_with_concession";

export interface InspectionChecklistItem {
  id: string;
  characteristic: string;
  targetSpec: string;
  measuredValue?: string;
  result: "pass" | "fail" | "untested";
  notes?: string;
}

export interface InspectionRecord {
  id: string;
  organizationId: string;
  inspectionType: InspectionType;
  jobId: string;
  jobNumber: string;
  partDescription: string;
  travelerOperationId?: string;
  inspectorUserId: string;
  inspectorName: string;
  status: InspectionStatus;
  sampleSize: number;
  passedQuantity: number;
  failedQuantity: number;
  checklist: InspectionChecklistItem[];
  ncrId?: string;
  completedAt: string;
}

export type NCRSeverity = "minor" | "major" | "critical";

export type NCRDisposition =
  | "use_as_is"
  | "rework"
  | "scrap_and_remake"
  | "return_to_vendor"
  | "pending_review";

export type NCRStatus = "open" | "under_containment" | "dispositioned" | "closed";

export interface NonConformanceReport {
  id: string;
  ncrNumber: string; // e.g. "NCR-2026-042"
  organizationId: string;
  jobId: string;
  jobNumber: string;
  partDescription: string;
  operationName: string;
  defectDescription: string;
  defectCategory: string;
  severity: NCRSeverity;
  status: NCRStatus;
  defectQuantity: number;
  containmentActions: string[];
  rootCauseAnalysis?: string;
  disposition: NCRDisposition;
  dispositionNotes?: string;
  scrapCostCents: number;
  reworkLaborMinutes: number;
  remakeCostCents: number;
  createdByUserId: string;
  createdByName: string;
  approvedByUserId?: string;
  approvedByName?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityMetricsSummary {
  totalInspections: number;
  firstPassYieldPercentage: number;
  activeOpenNCRCount: number;
  scrapValuationLossCents: number;
}
