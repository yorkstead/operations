import { ItemCategory, InventoryUnit } from "@/modules/inventory/domain/types";

export interface DetailChecklistItem {
  id: string;
  category: "wash_decon" | "paint_correction" | "interior_leather" | "ceramic_cure";
  description: string;
  isCompleted: boolean;
  notes?: string;
}

export interface DetailAddOn {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface DetailAppointment {
  id: string;
  appointmentNumber: string;
  clientName: string;
  clientPhone: string;
  locationAddress: string;
  vehicle: {
    year: number;
    make: string;
    model: string;
    color: string;
    paintCondition: "swirls_minor" | "heavy_oxidation" | "pristine";
    paintDepthMicrons: number;
  };
  packageName: string;
  basePriceCents: number;
  addOns: DetailAddOn[];
  status: "scheduled" | "in_progress" | "correction_phase" | "coating_cure" | "completed";
  vanAssigned: string;
  technicianName: string;
  checklist: DetailChecklistItem[];
  evidence: {
    beforePhotosCount: number;
    afterPhotosCount: number;
    paintGlossScoreGu: number;
  };
  payment: {
    status: "simulated_captured" | "pending";
    amountCents: number;
    cardLast4: string;
    simulatedReceiptId: string;
    timestamp?: string;
  };
}

export interface MobileDetailDemoData {
  organization: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    serviceArea: string;
  };
  customer: {
    id: string;
    name: string;
    contactEmail: string;
    phone: string;
    address: string;
  };
  seededRecords: {
    quoteNumber: string;
    jobNumber: string;
    travelerNumber: string;
    inspectionNumber: string;
    packageNumber: string;
    receiptId: string;
    lotNumber: string;
  };
  inventoryItems: Array<{
    itemCode: string;
    description: string;
    category: ItemCategory;
    uom: InventoryUnit;
    unitCostCents: number;
    initialQuantity: number;
    allocatedQuantity: number;
    reorderThreshold: number;
    lotNumber: string;
  }>;
  appointment: DetailAppointment;
  counts: {
    totalConnectedRecords: number;
    quotes: number;
    jobs: number;
    inventoryItems: number;
    inventoryMovements: number;
    travelers: number;
    travelerOperations: number;
    qualityInspections: number;
    packagingUnits: number;
    fileVaultRecords: number;
    planningSuggestions: number;
    auditEvents: number;
  };
  metrics: {
    dailyVanUtilization: string;
    averageTicketValue: string;
    fiveStarReviewRate: string;
    ceramicWarrantyRegistered: number;
  };
}

export const MOBILE_DETAIL_FIXTURE_DATA: MobileDetailDemoData = {
  organization: {
    id: "demo_peak_mobile_detail",
    name: "Peak Mobile Detail",
    slug: "peak-mobile-detail",
    industry: "Mobile Automotive Detailing & Ceramic Quartz Coatings",
    serviceArea: "Boulder, Flatirons & Denver Metro, Colorado",
  },
  customer: {
    id: "cust_harrison_palmer",
    name: "Harrison Palmer",
    contactEmail: "harrison.palmer@bouldertech.io",
    phone: "+1 (303) 555-0194",
    address: "1120 Pearl St, Boulder, CO 80302 (Client Office Parking Structure)",
  },
  seededRecords: {
    quoteNumber: "Q-2026-DTL-104",
    jobNumber: "JOB-2026-DTL-104",
    travelerNumber: "TRV-2026-DTL-104",
    inspectionNumber: "INS-DTL-2026-104",
    packageNumber: "PKG-DTL-2026-104",
    receiptId: "REC-STRIPE-8912",
    lotNumber: "LOT-2026-CSU-50",
  },
  inventoryItems: [
    {
      itemCode: "CHEM-CERAMIC-50ML",
      description: "Gtechniq Crystal Serum Ultra 9H Ceramic Coating (50ml)",
      category: "consumable",
      uom: "BOX",
      unitCostCents: 11000,
      initialQuantity: 10,
      allocatedQuantity: 1,
      reorderThreshold: 2,
      lotNumber: "LOT-2026-CSU-50",
    },
    {
      itemCode: "PAD-MICROFIBER-5IN",
      description: "5-inch High-Density Microfiber Cutting Pad",
      category: "consumable",
      uom: "EA",
      unitCostCents: 1200,
      initialQuantity: 24,
      allocatedQuantity: 2,
      reorderThreshold: 6,
      lotNumber: "LOT-2026-PAD-5",
    },
    {
      itemCode: "CHEM-FOAM-SNOW",
      description: "pH-Neutral Hyper-Concentrated Snow Foam Wash (1 Gal)",
      category: "consumable",
      uom: "BOX",
      unitCostCents: 3400,
      initialQuantity: 8,
      allocatedQuantity: 1,
      reorderThreshold: 2,
      lotNumber: "LOT-2026-FOAM-01",
    },
  ],
  appointment: {
    id: "apt_dtl_2026_104",
    appointmentNumber: "DTL-2026-104",
    clientName: "Harrison Palmer",
    clientPhone: "+1 (303) 555-0194",
    locationAddress: "1120 Pearl St, Boulder, CO 80302 (Client Office Parking Structure)",
    vehicle: {
      year: 2024,
      make: "Porsche",
      model: "911 GT3 RS",
      color: "Chalk Grey / Carbon Weave",
      paintCondition: "swirls_minor",
      paintDepthMicrons: 135,
    },
    packageName: "Track-Pack Ceramic Quartz Shield & Full Alcantara Restoration",
    basePriceCents: 70000,
    addOns: [
      {
        id: "addon_engine_steam",
        name: "Engine Bay Dry-Ice Cryo-Steam Cleaning",
        description: "Zero-moisture decontamination of intake manifolds, engine bay plastics, and carbon louvers.",
        priceCents: 15000,
        isApproved: true,
        approvedBy: "Harrison Palmer (via SMS link)",
        approvedAt: "2026-08-25T14:15:00Z",
      },
      {
        id: "addon_wheel_off",
        name: "Wheels-Off Barrel Ceramic Coating",
        description: "Removal of centerlock magnesium wheels for 100% barrel and brake caliper ceramic barrier.",
        priceCents: 20000,
        isApproved: false,
      },
    ],
    status: "coating_cure",
    vanAssigned: "Mobile Rig Unit #1 (Mercedes Sprinter 2500)",
    technicianName: "Austin Ramirez",
    checklist: [
      { id: "chk_d1", category: "wash_decon", description: "pH-neutral snow foam cannon wash & two-bucket grit guard contact wash", isCompleted: true },
      { id: "chk_d2", category: "wash_decon", description: "Chemical iron fallout remover & synthetic clay towel paint decontamination", isCompleted: true },
      { id: "chk_d3", category: "paint_correction", description: "Paint depth gauge ultrasonic mapping (verified 135 microns clearcoat safe)", isCompleted: true },
      { id: "chk_d4", category: "paint_correction", description: "Single-stage dual-action micro-abrasive polish (removed 95% of wash swirls)", isCompleted: true },
      { id: "chk_d5", category: "interior_leather", description: "Alcantara low-temp steam extraction & Colourlock matte leather balm", isCompleted: true },
      { id: "chk_d6", category: "ceramic_cure", description: "9H Silicon Dioxide (SiO2) ceramic quartz coating applied & IR heat cured", isCompleted: true },
    ],
    evidence: {
      beforePhotosCount: 8,
      afterPhotosCount: 10,
      paintGlossScoreGu: 98.4,
    },
    payment: {
      status: "simulated_captured",
      amountCents: 85000,
      cardLast4: "4242",
      simulatedReceiptId: "rec_sim_stripe_911gt3",
      timestamp: "2026-08-25T16:30:00Z",
    },
  },
  counts: {
    totalConnectedRecords: 28,
    quotes: 1,
    jobs: 1,
    inventoryItems: 3,
    inventoryMovements: 3,
    travelers: 1,
    travelerOperations: 4,
    qualityInspections: 1,
    packagingUnits: 1,
    fileVaultRecords: 2,
    planningSuggestions: 1,
    auditEvents: 8,
  },
  metrics: {
    dailyVanUtilization: "94.5%",
    averageTicketValue: "$850.00",
    fiveStarReviewRate: "99.8%",
    ceramicWarrantyRegistered: 48,
  },
};
