export interface FacilitySite {
  id: string;
  code: string;
  name: string;
  address: string;
  clientName: string;
  squareFootage: number;
  accessCode: string;
  activeServiceLevel: "nightly_standard" | "sterile_cleanroom" | "deep_periodic";
}

export interface ServiceChecklistItem {
  id: string;
  description: string;
  category: "restroom" | "floor_care" | "waste_recycle" | "security_lockout" | "sterile_wipe";
  isCompleted: boolean;
  notes?: string;
}

export interface ServiceJobRelease {
  id: string;
  jobNumber: string;
  siteId: string;
  siteName: string;
  clientName: string;
  shiftDate: string;
  scheduledTime: string;
  crewLead: string;
  status: "scheduled" | "in_progress" | "quality_review" | "completed" | "exception_held";
  checklist: ServiceChecklistItem[];
  suppliesUsed: Array<{ itemCode: string; name: string; quantityUsed: number; unit: string }>;
  proofOfWork: {
    photoCount: number;
    atpSwabScoreRlu?: number;
    clientSignoffName?: string;
    signoffTimestamp?: string;
  };
}

export interface ServiceException {
  id: string;
  jobId: string;
  siteName: string;
  exceptionType: "access_lockout" | "chemical_spill" | "property_damage" | "biohazard_found";
  severity: "low" | "medium" | "critical";
  description: string;
  status: "open" | "contained" | "resolved";
  reportedAt: string;
  resolvedAt?: string;
  resolutionAction?: string;
}

export interface SummitFacilityDemoData {
  organization: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    headquarters: string;
  };
  sites: FacilitySite[];
  jobs: ServiceJobRelease[];
  exceptions: ServiceException[];
  metrics: {
    activeSites: number;
    scheduledShiftsToday: number;
    auditPassingRate: string;
    supplyEfficiency: string;
  };
}

export const SUMMIT_FACILITY_FIXTURE_DATA: SummitFacilityDemoData = {
  organization: {
    id: "demo_summit_facility",
    name: "Summit Facility Services",
    slug: "summit-facility-services",
    industry: "Commercial Facility Maintenance & Bio-Sanitation",
    headquarters: "Denver & Boulder, Colorado",
  },
  sites: [
    {
      id: "site_meridian",
      code: "SITE-MER-01",
      name: "Meridian Corporate Tower",
      address: "1800 17th St, Denver, CO 80202",
      clientName: "Meridian Commercial Properties",
      squareFootage: 185000,
      accessCode: "KEY-VAULT-402",
      activeServiceLevel: "nightly_standard",
    },
    {
      id: "site_centennial",
      code: "SITE-CEN-02",
      name: "Centennial Medical Center",
      address: "14001 E Iliff Ave, Aurora, CO 80014",
      clientName: "Rocky Mountain Health Group",
      squareFootage: 92000,
      accessCode: "BADGE-MED-88",
      activeServiceLevel: "sterile_cleanroom",
    },
    {
      id: "site_boulder_tech",
      code: "SITE-BOU-03",
      name: "Boulder Innovation Park",
      address: "3200 Walnut St, Boulder, CO 80301",
      clientName: "Front Range Tech Ventures",
      squareFootage: 120000,
      accessCode: "KEYPAD-9912",
      activeServiceLevel: "deep_periodic",
    },
  ],
  jobs: [
    {
      id: "job_srv_401",
      jobNumber: "SRV-2026-401",
      siteId: "site_meridian",
      siteName: "Meridian Corporate Tower",
      clientName: "Meridian Commercial Properties",
      shiftDate: "2026-08-25",
      scheduledTime: "18:00 - 02:00",
      crewLead: "Carlos Ortiz",
      status: "in_progress",
      checklist: [
        { id: "chk_1", description: "Empty all waste & recycling receptacles on floors 1-7", category: "waste_recycle", isCompleted: true },
        { id: "chk_2", description: "Restroom 7-point deep sanitization & dispenser restock", category: "restroom", isCompleted: true },
        { id: "chk_3", description: "Lobby granite high-speed burnish & perimeter vacuum", category: "floor_care", isCompleted: false },
        { id: "chk_4", description: "Executive conference room glass polish & keypad wipedown", category: "sterile_wipe", isCompleted: false },
        { id: "chk_5", description: "Final perimeter security lockup & alarm arming", category: "security_lockout", isCompleted: false },
      ],
      suppliesUsed: [
        { itemCode: "SUP-DISINF-01", name: "Quaternary Multi-Surface Disinfectant", quantityUsed: 2, unit: "Gallons" },
        { itemCode: "SUP-LINER-55", name: "Heavy Duty 55-Gal Can Liners", quantityUsed: 45, unit: "Liners" },
        { itemCode: "SUP-MOP-MF", name: "Microfiber Antimicrobial Mop Heads", quantityUsed: 8, unit: "Pcs" },
      ],
      proofOfWork: {
        photoCount: 6,
        atpSwabScoreRlu: 14, // < 30 RLU indicates hospital-grade surface cleanliness
      },
    },
    {
      id: "job_srv_402",
      jobNumber: "SRV-2026-402",
      siteId: "site_centennial",
      siteName: "Centennial Medical Center",
      clientName: "Rocky Mountain Health Group",
      shiftDate: "2026-08-25",
      scheduledTime: "20:00 - 04:00",
      crewLead: "Tanya Brooks",
      status: "completed",
      checklist: [
        { id: "chk_m1", description: "Cleanroom Class 10,000 HEPA wipe down with sporicidal solution", category: "sterile_wipe", isCompleted: true },
        { id: "chk_m2", description: "Bio-hazardous waste transfer to compliant autoclave holding", category: "waste_recycle", isCompleted: true },
        { id: "chk_m3", description: "Clinical touchpoint UV-C sterilization audit", category: "sterile_wipe", isCompleted: true },
        { id: "chk_m4", description: "Cleanroom airlock floor tacky mat replacement", category: "floor_care", isCompleted: true },
      ],
      suppliesUsed: [
        { itemCode: "SUP-SPORI-CL", name: "Sporicidal Bleach Solution Concentrate", quantityUsed: 4, unit: "Liters" },
        { itemCode: "SUP-BIO-BAG", name: "Biohazard Yellow Waste Bags", quantityUsed: 12, unit: "Bags" },
      ],
      proofOfWork: {
        photoCount: 12,
        atpSwabScoreRlu: 6, // Clinical grade
        clientSignoffName: "Dr. Karen Jensen (Facility Director)",
        signoffTimestamp: "2026-08-25T23:45:00Z",
      },
    },
  ],
  exceptions: [
    {
      id: "exc_mer_401",
      jobId: "job_srv_401",
      siteName: "Meridian Corporate Tower",
      exceptionType: "access_lockout",
      severity: "medium",
      description: "Suite 420 East Wing electronic lock rejected standard master badge.",
      status: "resolved",
      reportedAt: "2026-08-25T19:15:00Z",
      resolvedAt: "2026-08-25T19:35:00Z",
      resolutionAction: "Building security re-synchronized badge reader; crew completed sanitation protocol.",
    },
  ],
  metrics: {
    activeSites: 3,
    scheduledShiftsToday: 6,
    auditPassingRate: "99.4%",
    supplyEfficiency: "98.1%",
  },
};
