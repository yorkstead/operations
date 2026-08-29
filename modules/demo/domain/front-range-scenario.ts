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

export interface FrontRangeCustomer {
  id: string;
  name: string;
  contactEmail: string;
  shippingAddress: string;
}

export interface FrontRangeVendor {
  id: string;
  vendorCode: string;
  name: string;
  email: string;
  paymentTerms: string;
}

export interface FrontRangeWorkCenterFixture {
  code: string;
  name: string;
  type: string;
  hourlyCostRate: number;
}

export interface FrontRangeEquipmentFixture {
  assetTag: string;
  name: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  workCenterCode: string;
  locationCode: string;
  criticality: "low" | "medium" | "high" | "critical_single_point_of_failure";
  totalRunHours: number;
}

export interface FrontRangeInventoryLocationFixture {
  locationCode: string;
  name: string;
  type: "bin" | "shelf" | "rack" | "floor" | "staging" | "quarantine" | "dock";
}

export interface FrontRangeInventoryItemFixture {
  itemCode: string;
  description: string;
  category: "raw_material" | "hardware" | "consumable" | "subassembly" | "finished_goods";
  unitOfMeasure: "EA" | "SHEET" | "FT" | "LBS" | "BOX";
  reorderPoint: number;
  reorderQuantity: number;
  standardCostCents: number;
  lotTrackingRequired: boolean;
}

export interface FrontRangeSeededRecordIdentifiers {
  quoteNumber: string;
  jobNumber: string;
  travelerNumber: string;
  partNumber: string;
  materialCode: string;
  ncrNumber: string;
  palletNumber: string;
  manifestNumber: string;
  purchaseOrderNumber: string;
  receivingReceiptNumber: string;
  lotNumber: string;
  packageNumber: string;
  inspectionId: string;
  downtimeIntervalId: string;
  workOrderNumber: string;
  planningSuggestionId: string;
  packetDocumentId: string;
  shortageItemCode: string;
}

export interface FrontRangeDemoData {
  organization: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    location: string;
  };
  customer: FrontRangeCustomer;
  vendor: FrontRangeVendor;
  personas: FrontRangePersona[];
  disruption: FrontRangeDisruptionState;
  workCenters: FrontRangeWorkCenterFixture[];
  equipment: FrontRangeEquipmentFixture[];
  locations: FrontRangeInventoryLocationFixture[];
  inventoryItems: FrontRangeInventoryItemFixture[];
  seededRecords: FrontRangeSeededRecordIdentifiers;
  counts: {
    quotes: number;
    jobs: number;
    packetDocs: number;
    purchasingPo: number;
    purchasingShortages: number;
    purchasingReceipts: number;
    inventoryLocations: number;
    inventoryItems: number;
    inventoryLots: number;
    inventoryBalances: number;
    inventoryMovements: number;
    workCenters: number;
    travelers: number;
    travelerOperations: number;
    travelerBlockers: number;
    qualityInspections: number;
    qualityNcrs: number;
    equipmentAssets: number;
    maintenanceDowntimes: number;
    maintenanceWorkOrders: number;
    packagingSpecs: number;
    packagingUnits: number;
    packagedItems: number;
    shippingManifests: number;
    shippingStops: number;
    shippingPackages: number;
    fileVaultRecords: number;
    planningSuggestions: number;
    auditEvents: number;
    totalConnectedRecords: number;
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
  customer: {
    id: "cust_apex_aerospace",
    name: "Apex Aerospace Enclosures",
    contactEmail: "procurement@apex-aerospace.synthetic",
    shippingAddress: "10440 Aerospace Way, Centennial, CO 80112",
  },
  vendor: {
    id: "vend_co_metals",
    vendorCode: "VEND-CO-METALS",
    name: "Colorado Aluminum & Metal Supply",
    email: "orders@colorado-metals.synthetic",
    paymentTerms: "net_30",
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
  workCenters: [
    { code: "WC-LASER-01", name: "Mitsubishi 4kW Fiber Laser Cell", type: "laser_cutting", hourlyCostRate: 120.0 },
    { code: "WC-BRAKE-01", name: "Amada 100-Ton CNC Press Brake", type: "forming", hourlyCostRate: 95.0 },
    { code: "WC-WELD-01", name: "TIG Robotic Welding & PEM Insertion", type: "welding", hourlyCostRate: 85.0 },
    { code: "WC-FINISH-01", name: "Chemical Conversion & Powder Coat Line", type: "finishing", hourlyCostRate: 75.0 },
  ],
  equipment: [
    {
      assetTag: "EQ-LASER-01",
      name: "Mitsubishi 4kW Fiber Laser ML3015eX",
      manufacturer: "Mitsubishi Electric",
      modelNumber: "ML3015eX-Plus",
      serialNumber: "MB-2024-8841",
      workCenterCode: "WC-LASER-01",
      locationCode: "LOC-WIP-LASER",
      criticality: "critical_single_point_of_failure",
      totalRunHours: 3420,
    },
    {
      assetTag: "EQ-BRAKE-01",
      name: "Amada HFE 100-3 100-Ton CNC Press Brake",
      manufacturer: "Amada America",
      modelNumber: "HFE-1003-8X",
      serialNumber: "AM-2023-4109",
      workCenterCode: "WC-BRAKE-01",
      locationCode: "LOC-WIP-LASER",
      criticality: "high",
      totalRunHours: 2890,
    },
    {
      assetTag: "EQ-COMP-01",
      name: "Kaeser SK22 Rotary Screw Air Compressor",
      manufacturer: "Kaeser Compressors",
      modelNumber: "SK-22-SIGMA",
      serialNumber: "KS-2022-9011",
      workCenterCode: "WC-FINISH-01",
      locationCode: "LOC-WIP-LASER",
      criticality: "critical_single_point_of_failure",
      totalRunHours: 4280,
    },
    {
      assetTag: "EQ-BRAKE-01",
      name: "Amada 150-Ton CNC Press Brake",
      manufacturer: "Amada",
      modelNumber: "HFE-M2-1503",
      serialNumber: "AM-2023-8812",
      workCenterCode: "WC-BRAKE-01",
      locationCode: "LOC-WIP-LASER",
      criticality: "high",
      totalRunHours: 3640,
    },
    {
      assetTag: "EQ-WELD-01",
      name: "Miller Dynasty 350 TIG Welder",
      manufacturer: "Miller Electric",
      modelNumber: "Dynasty-350-TIG",
      serialNumber: "MIL-2022-9014",
      workCenterCode: "WC-WELD-01",
      locationCode: "LOC-RAW-RACK-01",
      criticality: "medium",
      totalRunHours: 2890,
    },
    {
      assetTag: "EQ-FORK-01",
      name: "Toyota Electric 5,000lb Forklift",
      manufacturer: "Toyota Material Handling",
      modelNumber: "8FBCU25",
      serialNumber: "TOY-2021-4412",
      workCenterCode: "WC-PACK-01",
      locationCode: "LOC-RAW-RACK-01",
      criticality: "medium",
      totalRunHours: 5120,
    },
  ],
  locations: [
    { locationCode: "LOC-RAW-RACK-01", name: "Raw Materials Rack A1", type: "rack" },
    { locationCode: "LOC-WIP-LASER", name: "Laser Cell WIP Staging", type: "staging" },
    { locationCode: "LOC-QUARANTINE", name: "Quality Quarantine Area", type: "quarantine" },
    { locationCode: "LOC-STAGING-SHIP", name: "Outbound Dock Staging Bay 2", type: "dock" },
  ],
  inventoryItems: [
    {
      itemCode: "MAT-AL-5052-090",
      description: "5052-H32 Aluminum Sheet 0.090in x 48in x 96in",
      category: "raw_material",
      unitOfMeasure: "SHEET",
      reorderPoint: 5,
      reorderQuantity: 20,
      standardCostCents: 48000,
      lotTrackingRequired: true,
    },
    {
      itemCode: "HRD-PEM-M4",
      description: "M4-0.7 Self-Clinching Studs 12mm Stainless",
      category: "hardware",
      unitOfMeasure: "EA",
      reorderPoint: 200,
      reorderQuantity: 1000,
      standardCostCents: 45,
      lotTrackingRequired: false,
    },
    {
      itemCode: "PART-FAC-P01",
      description: "Aerospace Avionics Enclosure Chassis Base",
      category: "subassembly",
      unitOfMeasure: "EA",
      reorderPoint: 0,
      reorderQuantity: 50,
      standardCostCents: 8500,
      lotTrackingRequired: true,
    },
    {
      itemCode: "PKG-CRT-WOOD-01",
      description: "Heavy-Duty Wooden Crate 48in x 40in x 36in",
      category: "consumable",
      unitOfMeasure: "BOX",
      reorderPoint: 2,
      reorderQuantity: 10,
      standardCostCents: 4500,
      lotTrackingRequired: false,
    },
  ],
  seededRecords: {
    quoteNumber: "Q-2026-088",
    jobNumber: "JOB-2026-104",
    travelerNumber: "TRV-2026-104",
    partNumber: "PART-FAC-P01",
    materialCode: "MAT-AL-5052-090",
    ncrNumber: "NCR-2026-012",
    palletNumber: "PAL-2026-042",
    manifestNumber: "SHP-2026-088",
    purchaseOrderNumber: "PO-2026-042",
    receivingReceiptNumber: "REC-2026-019",
    lotNumber: "LOT-2026-AL-088",
    packageNumber: "PKG-2026-042",
    inspectionId: "INS-2026-044",
    downtimeIntervalId: "DT-2026-001",
    workOrderNumber: "WO-2026-009",
    planningSuggestionId: "SUG-2026-001",
    packetDocumentId: "DOC-PKT-2026-104",
    shortageItemCode: "MAT-AL-5052-090",
  },
  counts: {
    quotes: 3,
    jobs: 4,
    packetDocs: 1,
    purchasingPo: 2,
    purchasingShortages: 1,
    purchasingReceipts: 1,
    inventoryLocations: 4,
    inventoryItems: 4,
    inventoryLots: 1,
    inventoryBalances: 3,
    inventoryMovements: 2,
    workCenters: 4,
    travelers: 1,
    travelerOperations: 4,
    travelerBlockers: 1,
    qualityInspections: 1,
    qualityNcrs: 1,
    equipmentAssets: 3,
    maintenanceDowntimes: 1,
    maintenanceWorkOrders: 1,
    packagingSpecs: 1,
    packagingUnits: 1,
    packagedItems: 1,
    shippingManifests: 1,
    shippingStops: 1,
    shippingPackages: 1,
    fileVaultRecords: 3,
    planningSuggestions: 1,
    auditEvents: 12,
    totalConnectedRecords: 60,
  },
};
