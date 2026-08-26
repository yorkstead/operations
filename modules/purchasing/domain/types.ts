export type PurchaseOrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "sent_to_vendor"
  | "partially_received"
  | "received_complete"
  | "cancelled";

export type RequisitionStatus =
  | "pending_rfq"
  | "po_created"
  | "fulfilled"
  | "rejected";

export interface MaterialShortageSignal {
  id: string;
  jobId?: string;
  jobNumber?: string;
  itemCode: string;
  description: string;
  requiredQuantity: number;
  onHandQuantity: number;
  shortageQuantity: number;
  uom: string;
  neededByDate: string;
  urgency: "standard" | "urgent" | "critical_line_down";
}

export interface SupplierOption {
  vendorId: string;
  vendorName: string;
  unitPriceCents: number;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  historicalQualityRating: number; // e.g. 99.2%
  isPreferred: boolean;
}

export interface POLineItem {
  id: string;
  lineNumber: number;
  itemCode: string;
  description: string;
  quantityOrdered: number;
  quantityReceived: number;
  uom: string;
  unitCostCents: number;
  totalCostCents: number;
  linkedJobId?: string;
  linkedJobNumber?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. "PO-2026-042"
  organizationId: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  status: PurchaseOrderStatus;
  lineItems: POLineItem[];
  subtotalCostCents: number;
  shippingCostCents: number;
  taxCostCents: number;
  totalCostCents: number;
  approvalThresholdCents: number; // e.g. 500000 cents ($5,000)
  requiresManagerApproval: boolean;
  approvedByUserId?: string;
  approvedByName?: string;
  approvedAt?: string;
  expectedDeliveryDate: string;
  issuedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceivingReceipt {
  id: string;
  poNumber: string;
  organizationId: string;
  packingSlipNumber: string;
  receivedDate: string;
  receivedByUserId: string;
  receivedByName: string;
  itemsReceived: { itemCode: string; quantityReceived: number; lotNumber?: string }[];
  notes?: string;
}

export interface PurchasingMetricsSummary {
  activePurchaseOrdersCount: number;
  openShortagesCount: number;
  totalOpenCommittedSpendCents: number;
  onTimeSupplierDeliveryPercentage: number;
}
