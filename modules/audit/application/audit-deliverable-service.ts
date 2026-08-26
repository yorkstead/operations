import type {
  AuditClientBriefing,
  BriefingStatus
} from "../domain/client-deliverable";

// In-memory store for synthetic local development and verified testing
const briefingsStore: Map<string, AuditClientBriefing> = new Map();

export const syntheticFrontRangeBriefing: AuditClientBriefing = {
  engagementId: "audit_fr_2026_01",
  organizationId: "org_front_range_mfg",
  clientName: "Front Range Precision Manufacturing",
  industry: "Precision Sheet Metal & CNC Machining",
  version: "v1.0-DELIVERABLE",
  status: "client_delivered",
  deliveryDate: "2026-08-25",
  leadAuditor: "Brandon York (Principal Product Engineer)",
  approvedBy: "Operations Director Review Gate",
  executiveSummary: "This workflow briefing synthesizes the 90-minute operational diagnostic conducted at Front Range Precision Manufacturing. The primary bottleneck is the disconnect between office quoting and shopfloor laser cutting: estimators rely on unversioned Excel rate sheets while operators work from paper drawings on clipboards. Implementing a focused digital traveler with CAD revision locks and integer-cents quoting margin guardrails eliminates scrap risks without introducing bloated ERP complexity.",
  currentStateMap: [
    {
      stage: "intake",
      stageTitle: "1. RFQ Intake & Estimating",
      currentTool: "Shared Outlook Inbox + Excel Estimating v4.2",
      handOffMethod: "Emailing Excel quote attachment to customer",
      frictionLevel: "high",
      observedFriction: "Estimators spend 45 minutes per RFQ calculating laser cutting runtime and sheet yield by hand.",
      evidenceType: "measured_fact",
      evidenceNotes: "Measured time: Average 42 minutes per RFQ across 15 audited quotes.",
    },
    {
      stage: "engineering_review",
      stageTitle: "2. Drawing Revision & Job Release",
      currentTool: "Network Shared Drive (S:/Drawings/2026)",
      handOffMethod: "Printing 3 copies of PDF drawing for traveler folder",
      frictionLevel: "critical",
      observedFriction: "Customer CAD revisions are saved in folders without notifying shop leads; revision mismatches discovered only after bending.",
      evidenceType: "measured_fact",
      evidenceNotes: "Recorded 3 scrapped production runs in July 2026 totaling $3,850 in raw material loss.",
    },
    {
      stage: "shopfloor_wip",
      stageTitle: "3. Laser Cutting & Press Brake Cell",
      currentTool: "Paper Traveler Folder on magnetic clipboards",
      handOffMethod: "Walking traveler folder between work centers",
      frictionLevel: "high",
      observedFriction: "Machine downtime and assist-gas delays are written in pencil at end of shift with no live blocker visibility.",
      evidenceType: "operator_estimate",
      evidenceNotes: "Lead operator estimates 2.5 hours weekly lost chasing missing traveler folders.",
    },
    {
      stage: "quality_inspection",
      stageTitle: "4. First Article Inspection (FAI)",
      currentTool: "Paper Inspection Sheet + Caliper Bench",
      handOffMethod: "Paper sheet signed with pen and filed in binder",
      frictionLevel: "medium",
      observedFriction: "Inspection sheets are filed in binders without digital searchability for customer compliance audits.",
      evidenceType: "measured_fact",
      evidenceNotes: "Observed 100% manual filing in 3-ring physical binders.",
    },
    {
      stage: "shipping_dispatch",
      stageTitle: "5. Pallet Packing & Freight Dispatch",
      currentTool: "Handwritten Bill of Lading (BOL)",
      handOffMethod: "Physical clipboard signed by freight driver",
      frictionLevel: "medium",
      observedFriction: "Gross pallet weights are estimated instead of computed, resulting in occasional freight carrier re-weigh surcharges.",
      evidenceType: "unverified_unknown",
      evidenceNotes: "Exact carrier surcharge totals were unverified in audit logs.",
    },
  ],
  opportunityRankings: [
    {
      rank: 1,
      title: "Digital Traveler with CAD Revision Lock",
      impact: "high",
      effort: "medium",
      timeframe: "Milestone 1 (Weeks 1-3)",
      recommendedModule: "ShopFloor & Digital Traveler",
      evidenceType: "measured_fact",
      evidenceBasis: "Eliminates $3,850/mo scrap risk from superseded PDF printouts.",
      operationalOutcome: "Operators scan QR code on traveler to view verified engineering CAD drawing Rev C with zero revision ambiguity.",
    },
    {
      rank: 2,
      title: "QuoteFlow & Margin Guardrails",
      impact: "high",
      effort: "medium",
      timeframe: "Milestone 2 (Weeks 3-5)",
      recommendedModule: "QuoteFlow & Estimating",
      evidenceType: "measured_fact",
      evidenceBasis: "Cuts RFQ turnaround from 42 min to under 10 min with automated machine run rates.",
      operationalOutcome: "Integer-cents cost breakdown with 25% margin guardrails and 1-click idempotent conversion to live job travelers.",
    },
    {
      rank: 3,
      title: "Digital FAI Quality Checklists & NCR Containment",
      impact: "medium",
      effort: "low",
      timeframe: "Milestone 3 (Weeks 5-6)",
      recommendedModule: "Quality & NCR Containment",
      evidenceType: "operator_estimate",
      evidenceBasis: "Ensures searchable compliance records and segregated scrap disposition authority.",
      operationalOutcome: "Pass/fail dimensional checks recorded digitally with tamper-evident inspector stamps.",
    },
  ],
  recommendedFirstRelease: {
    title: "Vertical Slice 1: CAD Revision Lock & Shopfloor Traveler",
    scopeSummary: "A focused, touch-friendly digital traveler for the 6kW Laser and Press Brake cells that binds work orders to cryptographically verified CAD drawings.",
    keyCapabilities: [
      "Digital traveler interface optimized for shopfloor tablets and monitors",
      "Vector CAD drawing lock blocking laser setup until engineering signoff",
      "QR code work order scanning with one-tap machine blocker reporting",
      "Sequential operation signoffs with timestamped operator attribution",
    ],
    exclusions: [
      "Automated nesting CAM software integration (Phase 2)",
      "Direct PLC machine sensor modbus wiring (Phase 3)",
      "External carrier EDI freight booking (Phase 3)",
    ],
  },
  implementationMilestones: [
    {
      milestoneNumber: 1,
      title: "Core Foundation & Shopfloor Traveler Release",
      targetScope: "Deploy tenant database, CAD file vault, and laser cell digital traveler.",
      deliverables: [
        "Multi-tenant database schema with tenant boundary isolation",
        "Role-scoped interfaces for Shop Lead and Machine Operator",
        "Digital traveler with drawing revision lock and QR scanner",
        "Automated unit and integration test suite passing 100%",
      ],
      estimatedWeeks: "3 weeks",
      priceRangeCents: { min: 450000, max: 650000 },
      assumptions: [
        "Shop has Wi-Fi connectivity at 6kW Laser and Press Brake work centers.",
        "Engineering drawings are supplied in standard PDF/DXF vector format.",
      ],
      risks: [
        "Operator resistance to screen input (Remediated by high-contrast, large touch buttons).",
      ],
    },
    {
      milestoneNumber: 2,
      title: "QuoteFlow & Margin Estimating Engine",
      targetScope: "Integer-cents pricing engine with margin guardrails and 1-click job conversion.",
      deliverables: [
        "Dynamic machine-hour and material yield rate sheets",
        "Executive margin threshold approval alerts (<25%)",
        "1-click job packet and traveler generation",
      ],
      estimatedWeeks: "2 weeks",
      priceRangeCents: { min: 350000, max: 500000 },
      assumptions: [
        "Management provides standard hourly machine cost rates.",
      ],
      risks: [
        "Inaccurate baseline machine costs (Remediated by configurable rate sheet parameters).",
      ],
    },
  ],
  assumptionsAndRisks: {
    assumptions: [
      "Client provides access to 2 key operators during Friday test walkthroughs.",
      "All financial quoting calculations use integer cents with zero rounding drift.",
      "Deployment runs on isolated production infrastructure with daily backups.",
    ],
    risks: [
      "Shopfloor network dead zones (Remediated by local optimistic UI caching).",
      "Legacy drawing naming inconsistencies (Remediated by strict engineering release review gate).",
    ],
    remediations: [
      "Pre-deployment tablet Wi-Fi site survey conducted during kickoff.",
      "Automated migration check verifying drawing metadata before cutover.",
    ],
  },
  nextSteps: [
    "Review and approve Milestone 1 vertical slice scope and acceptance criteria.",
    "Schedule 60-minute technical kickoff and tablet hardware review.",
    "Begin Milestone 1 engineering sprint with verified milestone delivery.",
  ],
  internalNotes: "CONFIDENTIAL INTERNAL NOTE: Client has $15k allocated budget for Q3 operational software improvements. Strong executive sponsorship from VP of Operations.",
};

briefingsStore.set(syntheticFrontRangeBriefing.engagementId, syntheticFrontRangeBriefing);

export const AuditDeliverableService = {
  getBriefing(engagementId: string): AuditClientBriefing | null {
    return briefingsStore.get(engagementId) || null;
  },

  getSyntheticBriefing(): AuditClientBriefing {
    return syntheticFrontRangeBriefing;
  },

  sanitizeClientBriefing(briefing: AuditClientBriefing): AuditClientBriefing {
    // Exclude sensitive internal notes for public/client delivery
    const sanitized = { ...briefing };
    delete sanitized.internalNotes;
    return sanitized;
  },

  updateStatus(
    engagementId: string,
    newStatus: BriefingStatus,
    approvedBy?: string
  ): AuditClientBriefing {
    const briefing = briefingsStore.get(engagementId);
    if (!briefing) {
      throw new Error(`Audit deliverable for engagement ${engagementId} not found.`);
    }

    briefing.status = newStatus;
    if (approvedBy) {
      briefing.approvedBy = approvedBy;
    }
    briefingsStore.set(engagementId, briefing);
    return briefing;
  },
};
