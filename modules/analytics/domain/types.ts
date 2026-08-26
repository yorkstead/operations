export type MetricStatus = "healthy" | "warning" | "critical";

export interface OperationalMetric {
  metricKey: string;
  title: string;
  businessQuestion: string;
  owner: string;
  formula: string;
  grain: string;
  sourceOfTruth: string;
  valueFormatted: string;
  numericValue: number;
  unit: string;
  targetFormatted: string;
  targetNumeric: number;
  status: MetricStatus;
  freshnessTimestamp: string;
  knownLimitations: string;
}

export type AttentionSeverity = "critical" | "warning" | "info";

export interface NeedsAttentionItem {
  id: string;
  module: "jobs" | "shopfloor" | "quality" | "maintenance" | "purchasing" | "shipping" | "quoting";
  severity: AttentionSeverity;
  title: string;
  description: string;
  recommendedAction: string;
  constraints: string[];
  tradeOffs: string[];
  link: string;
  actionLabel: string;
}

export interface CapacitySignal {
  workCenterCode: string;
  workCenterName: string;
  availableHoursWeekly: number;
  committedHoursWeekly: number;
  utilizationPercentage: number;
  status: "under_capacity" | "balanced" | "near_capacity" | "overloaded";
}

export interface PlanningSuggestion {
  id: string;
  title: string;
  category: "workcenter_rebalance" | "expedite_procurement" | "preventive_maintenance";
  rationale: string;
  constraints: string[];
  tradeOffs: string[];
  confidenceScore: number; // 0.0 - 1.0
  requiresHumanApproval: true;
  status: "pending" | "approved" | "dismissed";
  approvedByUserId?: string;
  approvedByName?: string;
  approvedAt?: string;
}

export interface ExecutiveDashboardSummary {
  metrics: OperationalMetric[];
  needsAttentionQueue: NeedsAttentionItem[];
  capacitySignals: CapacitySignal[];
  planningSuggestions: PlanningSuggestion[];
  lastRefreshedAt: string;
}
