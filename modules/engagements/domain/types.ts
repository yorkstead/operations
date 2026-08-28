export type EngagementStage =
  | "lead_intake"
  | "architecture_scoping"
  | "active_development"
  | "staging_qa"
  | "production_monitored"
  | "completed";

export interface EngagementDeliverable {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "review" | "completed";
  dueDate?: string;
  completedAt?: string;
}

export interface EngagementMilestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

export interface EngagementFileVaultItem {
  id: string;
  filename: string;
  fileType: "architecture_diagram" | "sow_contract" | "spec_doc" | "deployment_config" | "asset";
  r2Key: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface EngagementSecretConfig {
  id: string;
  key: string;
  description: string;
  storageRef: string;
  updatedAt: string;
}

export interface EngagementActivity {
  id: string;
  actorName: string;
  action: string;
  summary: string;
  timestamp: string;
}

export interface ClientEngagement {
  id: string;
  organizationId: string;
  clientName: string;
  clientContactName: string;
  clientContactEmail: string;
  title: string;
  stage: EngagementStage;
  repositoryUrl?: string;
  stagingUrl?: string;
  productionUrl?: string;
  techStack: string[];
  contractValueCents: number;
  milestones: EngagementMilestone[];
  deliverables: EngagementDeliverable[];
  fileVault: EngagementFileVaultItem[];
  secrets: EngagementSecretConfig[];
  activity: EngagementActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface EngagementMetricsSummary {
  totalEngagementsCount: number;
  activeDeliveryCount: number;
  totalContractValueCents: number;
  averageDeliverableCompletionPercent: number;
  stageCounts: Record<EngagementStage, number>;
}
