export type TemplateCategory =
  | "discovery_questionnaire"
  | "workflow_map"
  | "acceptance_criteria"
  | "configuration_package"
  | "import_mapping"
  | "training_checklist"
  | "operational_runbook"
  | "post_launch_review";

export type TargetIndustry =
  | "all_industries"
  | "cnc_sheet_metal"
  | "facility_maintenance"
  | "architectural_signage"
  | "mobile_detailing";

export interface LibraryTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  version: string;
  industry: TargetIndustry;
  summary: string;
  provenance: string; // e.g. "Sanitized from Front Range pilot; verified org-neutral"
  sanitizedReviewDate: string;
  reviewedBy: string;
  tags: string[];
  contentMarkdown: string;
  configurationSchema?: Record<string, unknown>;
}

export interface ClonedOrganizationTemplate {
  clonedId: string;
  templateId: string;
  organizationId: string;
  title: string;
  version: string;
  customizedContent: string;
  createdAt: string;
  updatedAt: string;
}
