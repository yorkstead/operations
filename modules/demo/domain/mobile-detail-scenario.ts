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
    paintGlossScoreGu: number; // Gloss Units (e.g. 98 GU)
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
  appointment: DetailAppointment;
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
    basePriceCents: 70000, // $700.00
    addOns: [
      {
        id: "addon_engine_steam",
        name: "Engine Bay Dry-Ice Cryo-Steam Cleaning",
        description: "Zero-moisture decontamination of intake manifolds, engine bay plastics, and carbon louvers.",
        priceCents: 15000, // $150.00
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
    vanAssigned: "Mobile Rig Unit #2 (Mercedes Sprinter 2500)",
    technicianName: "Brooke Callahan",
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
      paintGlossScoreGu: 98.4, // Industry benchmark for high-gloss mirror finish
    },
    payment: {
      status: "simulated_captured",
      amountCents: 85000, // $850.00 ($700 base + $150 add-on)
      cardLast4: "4242",
      simulatedReceiptId: "rec_sim_stripe_911gt3",
      timestamp: "2026-08-25T16:30:00Z",
    },
  },
  metrics: {
    dailyVanUtilization: "94.5%",
    averageTicketValue: "$740.00",
    fiveStarReviewRate: "99.8%",
    ceramicWarrantyRegistered: 48,
  },
};
