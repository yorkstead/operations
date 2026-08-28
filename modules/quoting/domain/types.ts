export type QuoteStatus =
  | "draft"
  | "internal_review"
  | "approved"
  | "sent_to_customer"
  | "accepted"
  | "declined"
  | "expired"
  | "converted_to_job";

export interface CostBreakdown {
  materialCostCents: number;
  laborCostCents: number;
  machineCostCents: number;
  outsourcingCostCents: number;
  freightCostCents: number;
  overheadCostCents: number;
  totalCostCents: number;
}

export interface QuoteLineItem {
  id: string;
  lineItemNumber: number;
  partDescription: string;
  drawingNumber?: string;
  revision?: string;
  quantity: number;
  costBreakdown: CostBreakdown;
  targetMarginPercent: number; // e.g. 35
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface QuoteRevision {
  revisionNumber: number;
  changeReason: string;
  lineItems: QuoteLineItem[];
  subtotalCents: number;
  discountPercent: number;
  discountAmountCents: number;
  taxPercent: number;
  taxAmountCents: number;
  totalAmountCents: number;
  overallMarginPercent: number;
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
}

export type CostModelType =
  | "discovery_audit"
  | "custom_software_milestone"
  | "monthly_sla_retainer"
  | "manufacturing_custom";

export interface PaymentMilestoneSchedule {
  id: string;
  milestoneName: string;
  percentage: number;
  amountCents: number;
  triggerCondition: string;
}

export interface ConsultingScopeDetails {
  costModelType: CostModelType;
  estimatedEngineeringHours: number;
  hourlyRateCents: number;
  cloudComputePassThroughCents: number;
  includedIntegrations: string[];
  deliverableSummary: string[];
  paymentMilestones: PaymentMilestoneSchedule[];
  proposalPdfR2Key?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. "QTE-2026-104"
  organizationId: string;
  customerId: string;
  customerName: string;
  customerContactEmail: string;
  title: string;
  status: QuoteStatus;
  currentRevisionNumber: number;
  revisions: QuoteRevision[];
  minMarginThresholdPercent: number; // default 25%
  requiresExecutiveApproval: boolean;
  approvedByUserId?: string;
  approvedByName?: string;
  approvedAt?: string;
  expiresAt: string;
  convertedJobId?: string;
  convertedAt?: string;
  consultingScope?: ConsultingScopeDetails;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteMetricsSummary {
  activeQuotesCount: number;
  totalPipelineValueCents: number;
  winRatePercentage: number;
  averageMarginPercentage: number;
}
