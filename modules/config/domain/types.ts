export const ALL_MODULE_KEYS = [
  "audit",
  "shopfloor",
  "inventory",
  "quality",
  "maintenance",
  "packaging",
  "shipping",
  "quoteflow",
  "purchasing",
  "knowledge",
  "analytics",
] as const;

export type ModuleKey = typeof ALL_MODULE_KEYS[number];

export interface TerminologyMap {
  jobLabel: string; // e.g. "Work Order" vs "Job" vs "Project"
  travelerLabel: string; // e.g. "Digital Traveler" vs "Router" vs "Shop Packet"
  facilityLabel: string; // e.g. "Plant" vs "Facility" vs "Shop"
  operatorLabel: string; // e.g. "Operator" vs "Technician" vs "Fabricator"
}

export interface WorkflowConfig {
  allowRushOverrides: boolean;
  requireQualitySignoff: boolean;
  defaultLaborRatePerHour: number;
}

export interface ThemeConfig {
  displayDensity: "compact" | "comfortable";
  badgeLabel?: string;
}

export interface OrganizationConfiguration {
  id: string;
  organizationId: string;
  version: number;
  entitlements: Record<ModuleKey, boolean>;
  terminology: TerminologyMap;
  workflow: WorkflowConfig;
  theme: ThemeConfig;
  updatedByUserId: string;
  updatedAt: string;
}

export interface ConfigurationHistoryRecord {
  id: string;
  organizationId: string;
  version: number;
  configSnapshot: OrganizationConfiguration;
  changeReason: string;
  updatedByUserId: string;
  updatedAt: string;
}

export const DEFAULT_ORG_CONFIG: Omit<OrganizationConfiguration, "id" | "organizationId" | "updatedByUserId" | "updatedAt"> = {
  version: 1,
  entitlements: {
    audit: true,
    shopfloor: true,
    inventory: true,
    quality: true,
    maintenance: true,
    packaging: true,
    shipping: true,
    quoteflow: true,
    purchasing: true,
    knowledge: true,
    analytics: true,
  },
  terminology: {
    jobLabel: "Work Order",
    travelerLabel: "Digital Traveler",
    facilityLabel: "Plant",
    operatorLabel: "Operator",
  },
  workflow: {
    allowRushOverrides: true,
    requireQualitySignoff: true,
    defaultLaborRatePerHour: 85.0,
  },
  theme: {
    displayDensity: "compact",
  },
};
