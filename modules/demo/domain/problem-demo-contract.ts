// modules/demo/domain/problem-demo-contract.ts

export interface DemoStep {
  stepNumber: number;
  title: string;
  station: string;
  actionDescription: string;
  systemBehavior: string;
  failurePrevented: string;
  stateDelta: Record<string, unknown>;
}

export interface IndustryProblemDemo {
  id: string;
  industry: string;
  problemTitle: string;
  executiveSummary: string;
  annualScrapRiskEstimate: string;
  rootCause: string;
  solutionArchitecture: string[];
  walkthrough: DemoStep[];
  interactiveControls: {
    canTriggerFailureScenario: boolean;
    canTriggerResolution: boolean;
    resetStateKey: string;
  };
}
