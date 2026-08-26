export interface FrontRangePersona {
  id: string;
  name: string;
  roleTitle: string;
  membershipRole: "owner" | "manager" | "operator" | "viewer";
  avatarInitials: string;
  assignedWorkCenter?: string;
  keyResponsibilities: string[];
}

export interface FrontRangeDisruptionState {
  id: string;
  title: string;
  assetTag: string;
  workCenterCode: string;
  rootCause: string;
  symptomDescription: string;
  correctiveAction: string;
  isDisrupted: boolean;
  resolvedAt?: string;
  mitigationImpact: string;
}

export interface FrontRangeDemoData {
  organization: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    location: string;
  };
  personas: FrontRangePersona[];
  disruption: FrontRangeDisruptionState;
  seededRecords: {
    quoteNumber: string;
    jobNumber: string;
    travelerNumber: string;
    partNumber: string;
    materialCode: string;
    ncrNumber: string;
    palletNumber: string;
    manifestNumber: string;
  };
}

export const FRONT_RANGE_FIXTURE_DATA: FrontRangeDemoData = {
  organization: {
    id: "demo_front_range_mfg",
    name: "Front Range Architectural Products",
    slug: "front-range-manufacturing",
    industry: "Precision Sheet Metal & Architectural Facades",
    location: "Denver, Colorado (Rocky Mountain Industrial Corridor)",
  },
  personas: [
    {
      id: "usr_sarah_lin",
      name: "Sarah Lin",
      roleTitle: "Director of Plant Operations",
      membershipRole: "owner",
      avatarInitials: "SL",
      keyResponsibilities: ["Overall plant throughput", "Capacity rebalancing", "Executive approvals"],
    },
    {
      id: "usr_marcus_vance",
      name: "Marcus Vance",
      roleTitle: "Senior Estimating & Purchasing Lead",
      membershipRole: "manager",
      avatarInitials: "MV",
      keyResponsibilities: ["Customer RFQs & quoting", "Material procurement", "Supplier rankings"],
    },
    {
      id: "usr_dave_miller",
      name: "Dave Miller",
      roleTitle: "Laser & Press Brake Cell Lead",
      membershipRole: "operator",
      avatarInitials: "DM",
      assignedWorkCenter: "WC-LASER-01",
      keyResponsibilities: ["Digital traveler execution", "Machine CNC setup", "Piece count logging"],
    },
    {
      id: "usr_elena_rostova",
      name: "Elena Rostova",
      roleTitle: "Quality Assurance Lead",
      membershipRole: "manager",
      avatarInitials: "ER",
      keyResponsibilities: ["First article inspections (FAI)", "NCR containment", "Calibration signoffs"],
    },
  ],
  disruption: {
    id: "disrupt_laser_gas",
    title: "Laser Cutting Cell Assist-Gas Pressure Loss",
    assetTag: "EQ-LASER-01",
    workCenterCode: "WC-LASER-01",
    symptomDescription: "Mitsubishi 4kW Fiber Laser reported low nitrogen pressure warning on line 2 regulator.",
    rootCause: "Secondary cylinder manifold manifold valve O-ring seal micro-leak.",
    correctiveAction: "Replaced nitrogen manifold O-ring seal, purged gas lines, verified 22 bar pressure.",
    isDisrupted: false,
    mitigationImpact: "Prevented 6 hours of scrap cut-edges on 5052-H32 aluminum sheets; restored 100% laser uptime.",
  },
  seededRecords: {
    quoteNumber: "Q-2026-088",
    jobNumber: "JOB-2026-104",
    travelerNumber: "TRV-2026-104",
    partNumber: "PART-FAC-P01",
    materialCode: "MAT-AL-0125",
    ncrNumber: "NCR-2026-012",
    palletNumber: "PAL-2026-042",
    manifestNumber: "SHP-2026-088",
  },
};
