export type ItemCategory =
  | "raw_material"
  | "hardware"
  | "consumable"
  | "subassembly"
  | "finished_goods";

export type InventoryUnit = "EA" | "SHEET" | "FT" | "LBS" | "BOX";

export type MovementType =
  | "receive"
  | "issue_to_job"
  | "return_from_job"
  | "transfer"
  | "scrap"
  | "cycle_count_adjustment";

export interface InventoryItem {
  id: string;
  organizationId: string;
  itemCode: string;
  description: string;
  category: ItemCategory;
  unitOfMeasure: InventoryUnit;
  defaultLocationId?: string;
  defaultLocationCode?: string;
  reorderPoint: string;
  reorderQuantity: string;
  standardCostCents: number;
  lotTrackingRequired: boolean;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLocation {
  id: string;
  organizationId: string;
  locationCode: string;
  name: string;
  type: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLot {
  id: string;
  organizationId: string;
  itemId: string;
  lotNumber: string;
  manufactureDate?: string;
  expirationDate?: string;
  supplierReference?: string;
  createdAt: string;
}

export interface InventoryItemBalance {
  id: string;
  organizationId: string;
  itemId: string;
  locationId: string;
  locationCode: string;
  locationName: string;
  lotId?: string;
  lotNumber?: string;
  onHandQuantity: string;
  allocatedQuantity: string;
  availableQuantity: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  organizationId: string;
  movementType: MovementType;
  itemId: string;
  itemCode: string;
  lotId?: string;
  lotNumber?: string;
  fromLocationId?: string;
  fromLocationCode?: string;
  toLocationId?: string;
  toLocationCode?: string;
  quantity: string;
  unitCostCents: number;
  jobId?: string;
  jobNumber?: string;
  travelerId?: string;
  travelerNumber?: string;
  originalMovementId?: string;
  actorUserId: string;
  actorName?: string;
  reason?: string;
  idempotencyKey?: string;
  occurredAt: string;
  createdAt: string;
}

export interface InventoryCycleCount {
  id: string;
  organizationId: string;
  itemId: string;
  itemCode: string;
  locationId: string;
  locationCode: string;
  lotId?: string;
  lotNumber?: string;
  expectedQuantity: string;
  observedQuantity: string;
  varianceQuantity: string;
  reason: string;
  countedByUserId: string;
  approvedByUserId?: string;
  resultingMovementId?: string;
  countedAt: string;
  createdAt: string;
}

export interface ItemStockSummary {
  itemId: string;
  itemCode: string;
  description: string;
  category: ItemCategory;
  unitOfMeasure: InventoryUnit;
  totalOnHand: string;
  totalAllocated: string;
  totalAvailable: string;
  reorderPoint: string;
  isLowStock: boolean;
  standardCostCents: number;
  totalValuationCents: number;
}
