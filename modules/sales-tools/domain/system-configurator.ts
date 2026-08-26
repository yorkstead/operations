export type IndustryProfile =
  | "cnc_sheet_metal"
  | "facility_maintenance"
  | "architectural_signage"
  | "mobile_detailing"
  | "custom_manufacturing";

export type SystemRole =
  | "owner_executive"
  | "estimator_sales"
  | "shopfloor_operator"
  | "quality_inspector"
  | "shipping_clerk"
  | "field_technician";

export type SystemModuleId =
  | "quoteflow_estimating"
  | "shopfloor_travelers"
  | "quality_ncr"
  | "inventory_ledger"
  | "shipping_palletization"
  | "maintenance_loto"
  | "knowledge_sops"
  | "analytics_planning";

export type IntegrationOption =
  | "vector_cad_dxf"
  | "barcode_scanners"
  | "caliper_measurement_gauges"
  | "modbus_plc_telemetry"
  | "carrier_freight_bol"
  | "accounting_gl_export";

export interface ConfiguratorSelections {
  industry: IndustryProfile;
  shopSize: "1_to_10" | "10_to_50" | "50_plus";
  roles: SystemRole[];
  selectedModules: SystemModuleId[];
  integrations: IntegrationOption[];
  primaryBottleneck: string;
  targetTimeline: "immediate_pilot" | "quarterly_rollout" | "exploratory";
}

export interface CompatibilityNotice {
  level: "info" | "warning" | "recommendation";
  title: string;
  message: string;
}

export interface RecommendedMilestone {
  phase: number;
  title: string;
  includedModules: SystemModuleId[];
  durationWeeks: string;
  estimatedPriceRangeCents: { min: number; max: number };
  rationale: string;
}

export interface SystemDiscussionBrief {
  briefId: string;
  generatedAt: string;
  selections: ConfiguratorSelections;
  recommendedFirstSlice: string;
  recommendedPhases: RecommendedMilestone[];
  compatibilityNotices: CompatibilityNotice[];
  estimatedTotalScopeCents: { min: number; max: number };
  assumptions: string[];
  guardrails: string[];
  disclaimer: string;
}
