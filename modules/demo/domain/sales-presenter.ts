export type PresenterRole = 
  | "executive_owner"
  | "commercial_estimator"
  | "shopfloor_lead"
  | "quality_manager"
  | "field_technician";

export type PresenterStep = {
  id: string;
  stepNumber: number;
  title: string;
  targetRoute: string;
  customerFriction: string;
  yorksteadSolution: string;
  talkTrack: string;
  suggestedAction: string;
  uiHighlightKey: string;
};

export type PresenterScenario = {
  scenarioSlug: string;
  scenarioName: string;
  industry: string;
  checkpointName: string;
  targetAudience: string;
  executiveSummary: string;
  supportedRoles: PresenterRole[];
  steps: PresenterStep[];
};
