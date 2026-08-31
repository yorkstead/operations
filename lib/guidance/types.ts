export type CanonicalDemoScenarioSlug =
  | "front-range-manufacturing"
  | "summit-facility-services"
  | "mile-high-signworks"
  | "peak-mobile-detail";

export interface WorkflowWalkthroughStep {
  stepNumber: number;
  title: string;
  description: string;
  keyAction?: string;
  expectedOutcome?: string;
}

export interface SuggestedActionItem {
  title: string;
  action: string;
  expectedResult: string;
}

export interface BusinessOutcome {
  title: string;
  impact: string;
  metricBadge?: string;
}

export interface RelatedModuleLink {
  code: string;
  name: string;
  path: string;
  description: string;
}

export interface RelevantDemoScenario {
  scenarioSlug: CanonicalDemoScenarioSlug;
  name: string;
  industry: string;
  narrative: string;
  targetStep?: number;
}

export interface PublicResourceLink {
  label: string;
  href: string;
  description: string;
  badgeText?: string;
  isExternal?: boolean;
}

export interface VisualReference {
  title: string;
  caption: string;
  type: "diagram" | "screenshot";
  src?: string;
}

export interface ModuleGuidance {
  moduleCode: string;
  name: string;
  badge: string;
  kicker: string;
  whatItDoes: string;
  problemReplaced: string;
  whatYouAreLookingAt: string;
  workflowWalkthrough: WorkflowWalkthroughStep[];
  suggestedActions: SuggestedActionItem[];
  businessOutcomes: BusinessOutcome[];
  relatedModules: RelatedModuleLink[];
  relevantDemoScenarios: RelevantDemoScenario[];
  publicLinks: PublicResourceLink[];
  visualReferences?: VisualReference[];
}

export const CANONICAL_DEMO_SCENARIO_SLUGS: readonly CanonicalDemoScenarioSlug[] = [
  "front-range-manufacturing",
  "summit-facility-services",
  "mile-high-signworks",
  "peak-mobile-detail",
] as const;

export const ALLOWLISTED_PUBLIC_PREFIXES = [
  "https://yorkstead.com/",
  "https://yorkstead.com",
] as const;

export const ALLOWLISTED_OPERATIONS_PREFIXES = [
  "/",
  "/maintenance",
  "/packaging",
  "/shopfloor",
  "/quotes",
  "/quality",
  "/shipping",
  "/inventory",
  "/jobs",
  "/knowledge",
  "/analytics",
  "/engagements",
  "/projects",
  "/infrastructure",
  "/files",
  "/packet-intelligence",
  "/purchasing",
  "/master-data",
  "/demo",
  "/account",
] as const;

export function isValidCanonicalScenario(slug: string): slug is CanonicalDemoScenarioSlug {
  return (CANONICAL_DEMO_SCENARIO_SLUGS as readonly string[]).includes(slug);
}

export function isValidPublicSiteLink(url: string): boolean {
  if (!url.startsWith("https://yorkstead.com")) {
    return false;
  }
  try {
    const parsed = new URL(url);
    if (parsed.origin !== "https://yorkstead.com") return false;
    return true;
  } catch {
    return false;
  }
}

export function isValidOperationsPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  const basePath = path.split("?")[0].split("#")[0];
  return (ALLOWLISTED_OPERATIONS_PREFIXES as readonly string[]).includes(basePath);
}
