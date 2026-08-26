export type CarrierType =
  | "dedicated_flatbed"
  | "ltl_freight"
  | "parcel_express"
  | "customer_will_call"
  | "hotshot_courier";

export type ShipmentStatus =
  | "draft_manifest"
  | "staged_for_loading"
  | "dispatched_in_transit"
  | "delivered"
  | "cancelled";

export interface ShipmentStop {
  stopSequence: number;
  destinationCustomerName: string;
  destinationAddress: string;
  packageNumbers: string[];
  contactPerson?: string;
  contactPhone?: string;
  deliveryNotes?: string;
  status: "pending" | "delivered";
  signedBy?: string;
  deliveredAt?: string;
}

export interface ShippingManifest {
  id: string;
  organizationId: string;
  manifestNumber: string; // e.g. "BOL-2026-092"
  carrierType: CarrierType;
  carrierName: string;
  trackingOrProNumber: string;
  driverName?: string;
  trailerOrPlateNumber?: string;
  stops: ShipmentStop[];
  packageNumbers: string[];
  totalPackages: number;
  totalGrossWeightLbs: number;
  status: ShipmentStatus;
  billOfLadingBarcode: string;
  dispatchedAt?: string;
  dispatchedByUserId?: string;
  dispatchedByName?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface ShippingMetricsSummary {
  activeShipmentsCount: number;
  shipmentsDeliveredCount: number;
  totalWeightInTransitLbs: number;
  onTimeDeliveryPercentage: number;
}
