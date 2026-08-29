import { ItemCategory, InventoryUnit } from "@/modules/inventory/domain/types";

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
  customer: {
    id: string;
    name: string;
    contactName: string;
    contactEmail: string;
    phone: string;
    address: string;
  };
  vendor: {
    id: string;
    name: string;
    contactEmail: string;
    phone: string;
  };
  seededRecords: {
    quoteNumber: string;
    jobNumber: string;
    travelerNumber: string;
    purchaseOrderNumber: string;
    receiptNumber: string;
    inspectionNumber: string;
    packageNumber: string;
    manifestNumber: string;
    lotNumber: string;
  };
  workCenters: Array<{
    code: string;
    name: string;
    type: string;
    hourlyCostRate: number;
  }>;
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
  project: SignworksProject;
  counts: {
    totalConnectedRecords: number;
    quotes: number;
    jobs: number;
    packetDocs: number;
    purchasingPo: number;
    purchasingShortages: number;
    purchasingReceipts: number;
    inventoryItems: number;
    inventoryMovements: number;
    workCenters: number;
    travelers: number;
    travelerOperations: number;
    qualityInspections: number;
    packagingUnits: number;
    shippingManifests: number;
    fileVaultRecords: number;
    planningSuggestions: number;
    auditEvents: number;
  };
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
  customer: {
    id: "cust_rino_brewery",
    name: "RiNo Arts Brewery & Taphouse",
    contactName: "Marcus Vance",
    contactEmail: "marcus@rinobrewery.com",
    phone: "+1 (303) 555-0812",
    address: "2901 Blake St, Denver, CO 80205",
  },
  vendor: {
    id: "vnd_denver_sign_supply",
    name: "Denver Wholesale Sign Supply Co",
    contactEmail: "orders@denversignsupply.com",
    phone: "+1 (303) 555-0988",
  },
  seededRecords: {
    quoteNumber: "Q-2026-SGN-09",
    jobNumber: "JOB-2026-SGN-09",
    travelerNumber: "TRV-2026-SGN-09",
    purchaseOrderNumber: "PO-2026-SGN-04",
    receiptNumber: "REC-2026-SGN-02",
    inspectionNumber: "INS-SGN-2026-09",
    packageNumber: "PKG-SGN-2026-09",
    manifestNumber: "BOL-2026-SGN-09",
    lotNumber: "LOT-2026-LED-30K",
  },
  workCenters: [
    { code: "WC-ROUTER-01", name: "AXYZ 5010 CNC Router Table", type: "machining", hourlyCostRate: 110.0 },
    { code: "WC-BENDER-01", name: "SDS ChannelBender Automatic Station", type: "forming", hourlyCostRate: 90.0 },
    { code: "WC-ELEC-01", name: "UL 48 Certified Wiring & LED Bench", type: "assembly", hourlyCostRate: 85.0 },
    { code: "WC-BOOTH-01", name: "Matte Polyurethane Paint & Cure Booth", type: "finishing", hourlyCostRate: 95.0 },
  ],
  inventoryItems: [
    {
      itemCode: "LED-HALO-3000K",
      description: "Warm White 3000K IP67 Halo LED Modules (50-Pack)",
      category: "hardware",
      uom: "BOX",
      unitCostCents: 4200,
      initialQuantity: 20,
      allocatedQuantity: 6,
      reorderThreshold: 4,
      lotNumber: "LOT-2026-LED-30K",
    },
    {
      itemCode: "PSU-MEANWELL-60W",
      description: "Mean Well 12V 60W IP67 Class 2 LED Power Supply",
      category: "hardware",
      uom: "EA",
      unitCostCents: 3800,
      initialQuantity: 15,
      allocatedQuantity: 4,
      reorderThreshold: 3,
      lotNumber: "LOT-2026-MW-60W",
    },
    {
      itemCode: "ALUM-SHT-080",
      description: "0.080in 5052-H32 Aluminum Sheet 4ft x 10ft",
      category: "raw_material",
      uom: "SHEET",
      unitCostCents: 14500,
      initialQuantity: 25,
      allocatedQuantity: 4,
      reorderThreshold: 5,
      lotNumber: "LOT-2026-AL-080",
    },
  ],
  project: {
    id: "proj_sign_2026_09",
    projectNumber: "SGN-2026-09",
    clientName: "RiNo Arts Brewery & Taphouse",
    locationAddress: "2901 Blake St, Denver, CO 80205",
    signType: "Halo-Lit Reverse Channel Letters with Matte Black Finish",
    totalContractValueCents: 2450000,
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
  counts: {
    totalConnectedRecords: 34,
    quotes: 1,
    jobs: 1,
    packetDocs: 1,
    purchasingPo: 1,
    purchasingShortages: 1,
    purchasingReceipts: 1,
    inventoryItems: 3,
    inventoryMovements: 3,
    workCenters: 4,
    travelers: 1,
    travelerOperations: 4,
    qualityInspections: 1,
    packagingUnits: 1,
    shippingManifests: 1,
    fileVaultRecords: 2,
    planningSuggestions: 1,
    auditEvents: 7,
  },
  metrics: {
    activeSignProjects: 14,
    onTimeInstallRate: "98.2%",
    firstTimeInspectionPassRate: "100.0%",
    averageLeadTimeDays: 16,
  },
};
