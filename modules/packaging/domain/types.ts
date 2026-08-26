export type ContainerType =
  | "box"
  | "crate"
  | "pallet"
  | "bundle"
  | "tote";

export type PackagingStatus =
  | "in_pack"
  | "ready_for_inspection"
  | "sealed_ready_for_shipping"
  | "quarantined";

export interface PackagedItem {
  id: string;
  jobId: string;
  jobNumber: string;
  partDescription: string;
  quantityPacked: number;
  unitWeightLbs: number;
  lotNumber?: string;
}

export interface PackagingSpecification {
  id: string;
  organizationId: string;
  name: string;
  containerType: ContainerType;
  maxWeightCapacityLbs: number;
  dimensionsInches: { length: number; width: number; height: number };
  tareWeightLbs: number;
  requiresCushioning: boolean;
  requiresBanding: boolean;
}

export interface PackagingUnit {
  id: string;
  organizationId: string;
  packageNumber: string; // e.g. "PKG-2026-081" or "PALLET-2026-012"
  containerType: ContainerType;
  specificationId?: string;
  items: PackagedItem[];
  totalQuantity: number;
  grossWeightLbs: number;
  tareWeightLbs: number;
  netWeightLbs: number;
  maxCapacityLbs: number;
  dimensionsInches: { length: number; width: number; height: number };
  labelBarcode: string;
  status: PackagingStatus;
  sealedAt?: string;
  sealedByUserId?: string;
  sealedByName?: string;
  createdAt: string;
}

export interface PackagingMetricsSummary {
  activePackagesCount: number;
  readyForShipmentCount: number;
  totalWeightPackedLbs: number;
}
