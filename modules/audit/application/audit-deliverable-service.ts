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

export const syntheticDenverExpressBriefing: AuditClientBriefing = {
  engagementId: "audit_denver_express_2026_01",
  organizationId: "org_denver_express",
  clientName: "Denver Express Warehousing & No Limit Trucking",
  industry: "Emergency Cross-Docking & Freight Rework",
  version: "v1.0-DELIVERABLE",
  status: "client_delivered",
  deliveryDate: "2026-09-04",
  leadAuditor: "Brandon York (Principal Product Engineer)",
  approvedBy: "Operations Director Review Gate",
  executiveSummary: "This workflow briefing synthesizes the 60-minute operational diagnostic conducted at Denver Express Warehousing & Cross-Docking (6030 Washington St, Ste 130). Denver Express operates an essential 60,000 sq ft emergency cross-dock for freight descending Floyd Hill and the Eisenhower Tunnel. They currently lose 60% of inbound shifted-pallet rework loads due to paper clipboard intake, lack of online bay holds, and phone-based Comchek collection. Deploying ReworkFlow™ with driver self-service bay reservation (/reserve), forklift glove-friendly photo terminals (/dock), and automated Evidence Certificate billing (/office) resolves clipboard friction without SaaS rental lock-in.",
  currentStateMap: [
    {
      stage: "intake",
      stageTitle: "1. Inbound Driver Bay Reservation & Rate Estimate",
      currentTool: "Personal Cell Phone & Incoming Landline",
      handOffMethod: "Verbal rate quote given to stranded driver or dispatcher",
      frictionLevel: "critical",
      observedFriction: "Stranded truckers calling from I-70 look for online bay guarantees; dispatch misses 60% of calls while out on the dock.",
      evidenceType: "measured_fact",
      evidenceNotes: "Audited phone log shows 14 missed inbound load calls over a 3-day weekend period.",
    },
    {
      stage: "engineering_review",
      stageTitle: "2. Dock Arrival & Pallet Inspection",
      currentTool: "Physical Clipboard & Paper Intake Form",
      handOffMethod: "Driver walks clipboard into Arvada/Washington St office",
      frictionLevel: "high",
      observedFriction: "Forklift operators inspect shifted pallets with dirty gloves; paper forms get stained, lost, or handwriting is illegible for broker claims.",
      evidenceType: "measured_fact",
      evidenceNotes: "Observed paper intake sheets taking 18 minutes to manually decipher and type into billing records.",
    },
    {
      stage: "shopfloor_wip",
      stageTitle: "3. Forklift Rework & Banding Breakdown",
      currentTool: "Manual Whiteboard on Bay 1 & Bay 2 Roll Cages",
      handOffMethod: "Shouting across 60,000 sq ft dock floor to notify office",
      frictionLevel: "high",
      observedFriction: "Forklift operators re-stack and re-shrinkwrap shifted freight with zero real-time timestamps or photographic proof for cargo claims.",
      evidenceType: "operator_estimate",
      evidenceNotes: "Dock superintendent estimates 8.5 hours weekly spent looking for paperwork or confirming completed re-stacks.",
    },
    {
      stage: "quality_inspection",
      stageTitle: "4. Cargo Claim Proof & Driver Sign-off",
      currentTool: "Ballpoint Pen on Carbon-Copy Bill of Lading",
      handOffMethod: "Driver takes yellow copy, white copy filed in metal drawer",
      frictionLevel: "high",
      observedFriction: "Brokers dispute rework charges without high-resolution photographic evidence certificates showing before/after pallet condition.",
      evidenceType: "measured_fact",
      evidenceNotes: "Average of $1,200/mo in broker short-pays due to lack of immediate photographic proof-of-work.",
    },
    {
      stage: "shipping_dispatch",
      stageTitle: "5. Comchek / EFS Processing & QuickBooks Export",
      currentTool: "Phone Call to Broker + Manual QuickBooks Entry",
      handOffMethod: "Calling Comchek verification number, re-typing into desktop accounting",
      frictionLevel: "medium",
      observedFriction: "Billing staff manually calls brokers to authorize Comcheks; re-keying into QuickBooks takes 25 minutes per completed job.",
      evidenceType: "measured_fact",
      evidenceNotes: "Timed 22 minutes average time from truck departure to QuickBooks invoice creation.",
    },
  ],
  opportunityRankings: [
    {
      rank: 1,
      title: "Self-Service Driver Bay Reservation Portal (/reserve)",
      impact: "high",
      effort: "medium",
      timeframe: "Milestone 1 (Immediate)",
      recommendedModule: "ReworkFlow Intake Engine",
      evidenceType: "measured_fact",
      evidenceBasis: "Recovers estimated $4,500/mo in lost I-70/I-25 inbound rework loads captured by competitors.",
      operationalOutcome: "Stranded truckers calculate instant rework rates ($450-$550) and lock 45-minute guaranteed bay holds directly on mobile.",
    },
    {
      rank: 2,
      title: "Glove-Friendly Forklift Roll-Cage Terminal (/dock)",
      impact: "high",
      effort: "medium",
      timeframe: "Milestone 2 (Staging Dock Trial)",
      recommendedModule: "ReworkFlow Terminal PWA",
      evidenceType: "measured_fact",
      evidenceBasis: "Eliminates paper clipboard loss, provides 90-second photo intake and instant on-screen driver signoff.",
      operationalOutcome: "Turnkey rugged HOTWAV R9 Pro tablet mounted via RAM Tough-Claw on forklift roll cage survives industrial dock environment.",
    },
    {
      rank: 3,
      title: "Automated Evidence Certificate PDF & QuickBooks CSV Export (/office)",
      impact: "high",
      effort: "low",
      timeframe: "Milestone 3 (Live Go-Live)",
      recommendedModule: "ReworkFlow Dispatch Board",
      evidenceType: "measured_fact",
      evidenceBasis: "Eliminates $1,200/mo broker invoice disputes with tamper-evident PDF before/after certificates.",
      operationalOutcome: "Office dispatch gets audible arrival chimes, 1-click Comchek verification, and zero-entry QuickBooks export.",
    },
  ],
  recommendedFirstRelease: {
    title: "Vertical Slice 1: ReworkFlow™ Complete Buyout & Dock Terminal Staging",
    scopeSummary: "Turnkey deployment of the 4 core ReworkFlow routes (/maps, /reserve, /dock, /office) backed by 2x rugged forklift tablet terminals.",
    keyCapabilities: [
      "Stranded driver mobile portal with 45-min bay hold countdown timer",
      "Glove-friendly touchscreen terminal with camera capture & digital signature pad",
      "Office dispatcher operations board with Web Audio chime alerts & QuickBooks export",
      "15-mile protected non-compete covenant along I-70 and I-25",
    ],
    exclusions: [
      "Automated automated EDI freight billing broker network (Phase 2)",
      "Automated overhead gate RFID driver sensor integration (Phase 3)",
    ],
  },
  implementationMilestones: [
    {
      milestoneNumber: 1,
      title: "50% Buyout Deposit & Cloud Architecture Provisioning",
      targetScope: "Deploy multi-tenant ReworkFlow cloud infrastructure to rework.yorkstead.com.",
      deliverables: [
        "Interactive driver bay hold engine with rate estimator",
        "Forklift PWA terminal with offline photo cache",
        "Dispatcher sound-alert board with QuickBooks CSV schema",
      ],
      estimatedWeeks: "1 week",
      priceRangeCents: { min: 475000, max: 475000 },
      assumptions: [
        "Denver Express provides facility dock Wi-Fi or tablet 4G LTE SIM cards.",
      ],
      risks: [
        "Dock Wi-Fi dead spots (Remediated by 4G LTE fallback on HOTWAV tablets).",
      ],
    },
    {
      milestoneNumber: 2,
      title: "30% Staging Deployment & 6030 Washington St Dock Walkthrough",
      targetScope: "Physical forklift roll-cage mounting trial and live dual-device test.",
      deliverables: [
        "2x HOTWAV R9 Pro 11-inch rugged tablets staged with RAM Tough-Claw mounts",
        "Physical clipboard count and floor walkthrough at 6030 Washington St",
        "End-to-end 3-minute driver intake simulation test",
      ],
      estimatedWeeks: "1 week",
      priceRangeCents: { min: 285000, max: 285000 },
      assumptions: [
        "Principals Steve Chapman & Dale Burget present for 30-minute dock trial.",
      ],
      risks: [
        "Forklift vibration loosening mounts (Remediated by heavy-duty RAM Mount Tough-Claw RAP-B-400U).",
      ],
    },
    {
      milestoneNumber: 3,
      title: "20% Live Forklift Terminal Go-Live & SpinFlow Agency Handover",
      targetScope: "Live dock acceptance, driver sign-off, and DNS cutover to rework.denverexpressco.com.",
      deliverables: [
        "Complete GitHub repository handover to SpinFlow.ai",
        "Zero vendor lock-in, zero monthly license rent buyout confirmation",
        "DNS migration and staff training completion",
      ],
      estimatedWeeks: "1 week",
      priceRangeCents: { min: 190000, max: 190000 },
      assumptions: [
        "SpinFlow.ai web agency receives repository transfer and DNS control.",
      ],
      risks: [
        "DNS TTL propagation delay (Remediated by parallel Cloudflare edge routing).",
      ],
    },
  ],
  assumptionsAndRisks: {
    assumptions: [
      "Software buyout is single lump sum ($9,500 total) with 0 recurring platform fees.",
      "15-mile non-compete covenant strictly protects Denver Express corridor freight.",
      "Hardware package A ($980) covers 2 primary rework bays (Bay 1 & Bay 2).",
    ],
    risks: [
      "Floor operators reluctant to trade paper for screen (Remediated by oversized glove-friendly buttons and 90-sec workflow).",
      "Cold temperature battery drain in winter (Remediated by HOTWAV 20,080mAh extreme-temp industrial battery).",
    ],
    remediations: [
      "Pre-configured rugged tablets locked to ReworkFlow PWA kiosk mode.",
      "Direct 1-button driver signature capture without dropdown navigation.",
    ],
  },
  nextSteps: [
    "Conduct 45-second phone hook with Steve Chapman on mountain freight loss.",
    "Execute 3-minute dual-device live demo (/dock on phone, /office on laptop).",
    "Conduct 30-minute floor walkthrough at 6030 Washington St and count clipboards.",
  ],
  internalNotes: "CONFIDENTIAL INTERNAL NOTE: Principals have zero patience for SaaS subscription models. $9,500 complete asset buyout is pre-approved in strategy brief.",
};

briefingsStore.set(syntheticFrontRangeBriefing.engagementId, syntheticFrontRangeBriefing);
briefingsStore.set(syntheticDenverExpressBriefing.engagementId, syntheticDenverExpressBriefing);

export const AuditDeliverableService = {
  getBriefing(engagementId: string): AuditClientBriefing | null {
    return briefingsStore.get(engagementId) || null;
  },

  getSyntheticBriefing(): AuditClientBriefing {
    return syntheticFrontRangeBriefing;
  },

  listBriefings(): AuditClientBriefing[] {
    return Array.from(briefingsStore.values());
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
