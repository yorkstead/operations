export interface PublicScenarioHealth {
  slug: string;
  name: string;
  industry: string;
  status: "available" | "maintenance" | "deprecated";
  canonicalUrl: string;
  storyStageCount: number;
  featuredMetrics: {
    label: string;
    value: string;
  }[];
}

export interface PublicDemoHealthManifest {
  status: "operational" | "degraded" | "maintenance";
  version: string;
  timestamp: string;
  appBaseUrl: string;
  publicSiteUrl: string;
  scenarios: PublicScenarioHealth[];
}

export interface StaticFallbackData {
  scenarioSlug: string;
  name: string;
  headline: string;
  problemSummary: string;
  solutionSummary: string;
  measuredImpact: string[];
  screenshotUrls: string[];
  workflowStages: string[];
}
