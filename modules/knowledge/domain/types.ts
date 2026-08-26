export type KnowledgeArticleStatus =
  | "draft"
  | "under_review"
  | "published"
  | "retired";

export type KnowledgeCategory =
  | "standard_operating_procedure"
  | "equipment_troubleshooting"
  | "safety_protocol"
  | "quality_standard"
  | "onboarding_training";

export interface ProcedureStep {
  stepNumber: number;
  title: string;
  instruction: string;
  mediaUrl?: string;
  safetyWarning?: string;
}

export interface KnowledgeRevision {
  revisionNumber: number;
  title: string;
  content: string;
  structuredSteps: ProcedureStep[];
  changeLog: string;
  reviewedByUserId?: string;
  reviewedByName?: string;
  approvedAt?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  articleCode: string; // e.g. "KNOW-2026-015"
  organizationId: string;
  category: KnowledgeCategory;
  title: string;
  tags: string[];
  linkedEquipmentCodes?: string[];
  linkedModuleCodes?: string[];
  targetRoles?: string[];
  status: KnowledgeArticleStatus;
  currentRevisionNumber: number;
  revisions: KnowledgeRevision[];
  authorUserId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitedPassage {
  articleCode: string;
  articleTitle: string;
  revisionNumber: number;
  passageText: string;
  relevanceScore: number;
}

export interface KnowledgeQueryResult {
  query: string;
  answer: string;
  confidenceScore: number; // 0.0 - 1.0
  uncertaintyWarning?: string;
  citedPassages: CitedPassage[];
}

export interface KnowledgeMetricsSummary {
  totalPublishedArticles: number;
  pendingReviewsCount: number;
  verifiedSearchQueriesCount: number;
  citationAccuracyPercentage: number;
}
