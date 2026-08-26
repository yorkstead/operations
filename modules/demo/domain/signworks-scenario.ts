export interface SignworksArtworkRevision {
  id: string;
  revisionCode: string;
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  status: "pending_approval" | "client_approved" | "superseded";
  approvalName?: string;
  approvalTimestamp?: string;
  dimensions: string;
  illuminationType: "halo_lit_led" | "front_lit" | "non_illuminated";
}

export interface SignworksPermitReference {
  id: string;
  permitNumber: string;
  jurisdiction: string;
  permitType: "electrical_sign" | "structural_foundation" | "right_of_way";
  status: "submitted" | "approved" | "inspection_passed";
  approvedDate: string;
  inspectorNotes: string;
}

export interface SignworksProject {
  id: string;
  projectNumber: string;
  clientName: string;
  locationAddress: string;
  signType: string;
  totalContractValueCents: number;
  status: "estimating" | "design_approved" | "shop_fabrication" | "field_install" | "completed";
  currentRevision: SignworksArtworkRevision;
  permit: SignworksPermitReference;
  fabricationRouting: Array<{
    stepNumber: number;
    operationName: string;
    workCenter: string;
    isCompleted: boolean;
  }>;
  fieldInstallation: {
    craneTruckAssigned: string;
    crewLead: string;
    scheduledInstallDate: string;
    isMounted: boolean;
    isElectricalConnected: boolean;
    proofPhotosCount: number;
    clientSignoffName?: string;
  };
}

export interface SignworksDemoData {
  organization: {
    id: string;
    name: string;
    slug: string;
    industry: string;
    location: string;
  };
  project: SignworksProject;
  metrics: {
    activeSignProjects: number;
    onTimeInstallRate: string;
    firstTimeInspectionPassRate: string;
    averageLeadTimeDays: number;
  };
}

export const SIGNWORKS_FIXTURE_DATA: SignworksDemoData = {
  organization: {
    id: "demo_mile_high_signworks",
    name: "Mile High Signworks",
    slug: "mile-high-signworks",
    industry: "Architectural Sign Fabrication & Crane Installation",
    location: "Denver, Colorado (RiNo Arts District)",
  },
  project: {
    id: "proj_sign_2026_09",
    projectNumber: "SGN-2026-09",
    clientName: "RiNo Arts Brewery & Taphouse",
    locationAddress: "2901 Blake St, Denver, CO 80205",
    signType: "Halo-Lit Reverse Channel Letters with Matte Black Finish",
    totalContractValueCents: 2450000, // $24,500.00
    status: "field_install",
    currentRevision: {
      id: "rev_c_art",
      revisionCode: "Rev C (Final Production)",
      fileName: "RiNo_Brewery_Facade_Signage_RevC.pdf",
      fileSizeKb: 8420,
      uploadedAt: "2026-08-20T14:30:00Z",
      status: "client_approved",
      approvalName: "Marcus Vance (Taphouse Owner)",
      approvalTimestamp: "2026-08-21T09:15:00Z",
      dimensions: "24 ft Length x 42 in Letter Height",
      illuminationType: "halo_lit_led",
    },
    permit: {
      id: "pmt_den_881",
      permitNumber: "PERMIT-DEN-2026-881",
      jurisdiction: "City & County of Denver Community Planning & Development",
      permitType: "electrical_sign",
      status: "inspection_passed",
      approvedDate: "2026-08-22",
      inspectorNotes: "UL 48 listing sticker verified; 120V dedicated 20A circuit passed rough-in.",
    },
    fabricationRouting: [
      { stepNumber: 1, operationName: "CNC Routing Aluminum Backs & Acrylic Faces", workCenter: "CNC Router Table 01", isCompleted: true },
      { stepNumber: 2, operationName: "Channel Letter Return Bending & Tig Tack", workCenter: "Letter Bender Station", isCompleted: true },
      { stepNumber: 3, operationName: "LED Module Layout & 12V Driver Wiring", workCenter: "Electrical Wiring Bench", isCompleted: true },
      { stepNumber: 4, operationName: "Matte Black Satin Polyurethane Paint & Cure", workCenter: "Spray Booth Line", isCompleted: true },
      { stepNumber: 5, operationName: "Padded Wooden Crate Assembly CRT-SIGN-09", workCenter: "Packaging & Crating", isCompleted: true },
    ],
    fieldInstallation: {
      craneTruckAssigned: "Boom Truck #4 (45ft Reach)",
      crewLead: "Tyler Cruz",
      scheduledInstallDate: "2026-08-25",
      isMounted: true,
      isElectricalConnected: true,
      proofPhotosCount: 8,
      clientSignoffName: "Marcus Vance",
    },
  },
  metrics: {
    activeSignProjects: 14,
    onTimeInstallRate: "98.2%",
    firstTimeInspectionPassRate: "100.0%",
    averageLeadTimeDays: 16,
  },
};
