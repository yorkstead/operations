// modules/demo/domain/scenarios/drawing-revision-mismatch.ts
import { IndustryProblemDemo } from "../problem-demo-contract";

export const drawingRevisionMismatchDemo: IndustryProblemDemo = {
  id: "drawing-rev-desync",
  industry: "Architectural Cladding & Precision Fabrication",
  problemTitle: "Silent Drawing Revision Desynchronization",
  executiveSummary:
    "Cut bill revisions made by engineering after shop packets are printed cause machines to run outdated geometry, creating high-cost remakes.",
  annualScrapRiskEstimate: "$45,000 - $120,000 in material scrap & remake labor",
  rootCause:
    "Physical paper travelers decoupled from live ERP revision states.",
  solutionArchitecture: [
    "Station scan-to-verify checkpoint against master packet registry",
    "Instant digital traveler interlock if revision hash differs",
    "Automated CNC job hold with routing to remake/salvage queue",
  ],
  walkthrough: [
    {
      stepNumber: 1,
      title: "Station Check-in",
      station: "CNC Router Table 3",
      actionDescription: "Operator scans Traveler Barcode #TRV-24029-A (Rev B)",
      systemBehavior: "Validates traveler metadata against centralized job schema.",
      failurePrevented: "Prevents immediate blind cutting on outdated profiles.",
      stateDelta: { travelerId: "TRV-24029-A", scannedRev: "B" },
    },
    {
      stepNumber: 2,
      title: "Interlock Triggered",
      station: "CNC Router Table 3",
      actionDescription: "System compares scanned revision against latest engineering release (Rev C).",
      systemBehavior:
        "Halts machine job start. Displays high-contrast alert: 'HOLD: Drawing Rev C Released'.",
      failurePrevented: "Saved 6 composite panels from improper router profiling.",
      stateDelta: { status: "LOCKED_REVISION_HOLD", latestRev: "C" },
    },
    {
      stepNumber: 3,
      title: "Resolution & Traveler Re-Issue",
      station: "Supervisor Dashboard",
      actionDescription: "Digital packet updated; operator terminal renders updated nest file.",
      systemBehavior: "Updates line item routing, reprints barcode, releases interlock.",
      failurePrevented: "Eliminated downstream assembly mismatch.",
      stateDelta: { status: "RELEASED", activeRev: "C" },
    },
  ],
  interactiveControls: {
    canTriggerFailureScenario: true,
    canTriggerResolution: true,
    resetStateKey: "demo_rev_mismatch",
  },
};
