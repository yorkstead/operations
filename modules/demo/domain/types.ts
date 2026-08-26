export type PortfolioCategory = "client_work" | "product" | "lab" | "demo";

export interface PortfolioItem {
  id: string;
  category: PortfolioCategory;
  title: string;
  slug: string;
  headline: string;
  problemStatement: string;
  workflowBottleneck: string;
  solutionSummary: string;
  measuredImpact: string[];
  demoOrganizationSlug?: string;
  tags: string[];
  isPublished: boolean;
}

export interface DemoGuardrailPolicy {
  interceptExternalEmails: boolean;
  interceptPaymentGateways: boolean;
  interceptExternalWebhooks: boolean;
  enforceSyntheticDataOnly: boolean;
  requireVisualWatermark: boolean;
  allowSelfServiceReset: boolean;
}

export interface GuidedStoryStep {
  stepNumber: number;
  title: string;
  module: string;
  targetPath: string;
  description: string;
  keyAction: string;
  expectedOutcome: string;
}

export interface DemoScenarioManifest {
  scenarioSlug: string;
  name: string;
  industry: string;
  description: string;
  version: string;
  storyNarrative: string;
  guidedSteps: GuidedStoryStep[];
  highlights: string[];
  initialMetrics: {
    activeJobs: number;
    wipValueFormatted: string;
    onTimeRate: string;
    firstPassYield: string;
  };
}

export interface DemoResetResult {
  organizationId: string;
  scenarioSlug: string;
  recordsResetCount: number;
  resetAt: string;
  status: "success" | "rate_limited" | "unauthorized";
  message: string;
}

export interface DemoOrganizationContext {
  id: string;
  name: string;
  slug: string;
  industry: string;
  isDemo: true;
  guardrails: DemoGuardrailPolicy;
  seededAt: string;
  version: string;
}
