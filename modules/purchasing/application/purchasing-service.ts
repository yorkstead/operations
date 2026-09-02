import {
  PurchaseOrder,
  POLineItem,
  MaterialShortageSignal,
  SupplierOption,
  ReceivingReceipt,
  PurchasingMetricsSummary,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";
import { notificationService } from "../../core/application/notification-service";
import { inventoryService } from "../../inventory/application/inventory-service";

export class PurchasingService {
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private shortages: Map<string, MaterialShortageSignal> = new Map();
  private receipts: Map<string, ReceivingReceipt> = new Map();

  constructor() {
    this.seedDefaultPurchasing("org_default");
  }

  private seedDefaultPurchasing(orgId: string) {
    const shortage: MaterialShortageSignal = {
      id: "sh_1",
      jobId: "job_104",
      jobNumber: "JOB-2026-104",
      itemCode: "RAW-SS-304-0250",
      description: "304 Stainless Steel Sheet 0.25in (48x120)",
      requiredQuantity: 10,
      onHandQuantity: 2,
      shortageQuantity: 8,
      uom: "sheets",
      neededByDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      urgency: "urgent",
    };
    this.shortages.set(`${orgId}:${shortage.id}`, shortage);

    const po: PurchaseOrder = {
      id: "po_1",
      poNumber: "PO-2026-042",
      organizationId: orgId,
      vendorId: "vend_1",
      vendorName: "Ryerson Metal Solutions",
      vendorEmail: "orders@ryerson.com",
      status: "sent_to_vendor",
      lineItems: [
        {
          id: "poli_1",
          lineNumber: 1,
          itemCode: "RAW-SS-304-0250",
          description: "304 Stainless Steel Sheet 0.25in (48x120)",
          quantityOrdered: 8,
          quantityReceived: 0,
          uom: "sheets",
          unitCostCents: 42000, // $420.00
          totalCostCents: 336000, // $3,360.00
          linkedJobId: "job_104",
          linkedJobNumber: "JOB-2026-104",
        },
      ],
      subtotalCostCents: 336000,
      shippingCostCents: 15000, // $150.00
      taxCostCents: 0,
      totalCostCents: 351000, // $3,510.00
      approvalThresholdCents: 500000, // $5,000.00
      requiresManagerApproval: false,
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      issuedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.purchaseOrders.set(`${orgId}:${po.poNumber}`, po);
  }

  private ensurePurchasingSeeded(orgId: string) {
    const existing = Array.from(this.purchaseOrders.values()).filter((p) => p.organizationId === orgId);
    if (existing.length === 0) {
      this.seedDefaultPurchasing(orgId);
    }
  }

  // 1. Create Purchase Order with Integer Cents Arithmetic & Threshold Guardrail
  createPurchaseOrder(
    session: SessionContext,
    params: {
      vendorId: string;
      vendorName: string;
      vendorEmail: string;
      expectedDeliveryDate: string;
      lineItems: {
        itemCode: string;
        description: string;
        quantityOrdered: number;
        uom?: string;
        unitCostCents: number;
        linkedJobId?: string;
        linkedJobNumber?: string;
      }[];
      shippingCostCents?: number;
      taxCostCents?: number;
    }
  ): PurchaseOrder {
    authorizationService.requireCapability(session, "inventory:receive_material");

    const orgId = session.activeOrganization.id;
    const count = Array.from(this.purchaseOrders.values()).filter((p) => p.organizationId === orgId).length + 1;
    const poNumber = `PO-${new Date().getFullYear()}-${count.toString().padStart(3, "0")}`;
    const id = `po_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const lineItems: POLineItem[] = params.lineItems.map((item, idx) => {
      const totalCostCents = item.unitCostCents * item.quantityOrdered;
      return {
        id: `poli_${Date.now()}_${idx}`,
        lineNumber: idx + 1,
        itemCode: item.itemCode.trim().toUpperCase(),
        description: item.description.trim(),
        quantityOrdered: item.quantityOrdered,
        quantityReceived: 0,
        uom: item.uom || "EA",
        unitCostCents: item.unitCostCents,
        totalCostCents,
        linkedJobId: item.linkedJobId,
        linkedJobNumber: item.linkedJobNumber,
      };
    });

    const subtotalCostCents = lineItems.reduce((acc, li) => acc + li.totalCostCents, 0);
    const shippingCostCents = params.shippingCostCents || 0;
    const taxCostCents = params.taxCostCents || 0;
    const totalCostCents = subtotalCostCents + shippingCostCents + taxCostCents;

    const approvalThresholdCents = 500000; // $5,000.00
    const requiresManagerApproval = totalCostCents > approvalThresholdCents;

    const po: PurchaseOrder = {
      id,
      poNumber,
      organizationId: orgId,
      vendorId: params.vendorId,
      vendorName: params.vendorName.trim(),
      vendorEmail: params.vendorEmail.trim(),
      status: requiresManagerApproval ? "pending_approval" : "draft",
      lineItems,
      subtotalCostCents,
      shippingCostCents,
      taxCostCents,
      totalCostCents,
      approvalThresholdCents,
      requiresManagerApproval,
      expectedDeliveryDate: params.expectedDeliveryDate,
      createdAt: now,
      updatedAt: now,
    };

    this.purchaseOrders.set(`${orgId}:${poNumber}`, po);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: id,
      action: "purchasing.po_created",
      summary: `Created Purchase Order ${poNumber} for ${params.vendorName} ($${(totalCostCents / 100).toFixed(2)}).`,
    });

    return po;
  }

  // 2. Approve Purchase Order (Approval Threshold Governance)
  approvePurchaseOrder(session: SessionContext, poNumber: string): PurchaseOrder {
    const po = this.findPurchaseOrder(session, poNumber);

    if (po.requiresManagerApproval) {
      // POs above the $5,000 threshold require explicit spend-approval authority.
      authorizationService.requireCapability(session, "purchasing:approve_po");
    } else {
      authorizationService.requireCapability(session, "inventory:receive_material");
    }

    const now = new Date().toISOString();
    po.status = "approved";
    po.approvedByUserId = session.user.id;
    po.approvedByName = session.user.name;
    po.approvedAt = now;
    po.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: po.id,
      action: "purchasing.po_approved",
      summary: `Purchase Order ${poNumber} approved by ${session.user.name}.`,
    });

    this.purchaseOrders.set(`${session.activeOrganization.id}:${poNumber}`, po);
    return po;
  }

  // 3. Issue PO to Vendor
  issuePO(session: SessionContext, poNumber: string): PurchaseOrder {
    authorizationService.requireCapability(session, "inventory:receive_material");

    const po = this.findPurchaseOrder(session, poNumber);
    const now = new Date().toISOString();

    po.status = "sent_to_vendor";
    po.issuedAt = now;
    po.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: po.id,
      action: "purchasing.po_issued",
      summary: `Purchase Order ${poNumber} issued to ${po.vendorName}.`,
    });

    notificationService.dispatchNotification({
      organizationId: session.activeOrganization.id,
      recipientUserId: "purchasing_agent",
      title: `PO Dispatched: ${poNumber}`,
      message: `Purchase Order ${poNumber} sent to ${po.vendorName} (${po.vendorEmail}).`,
      link: `/purchasing?po=${poNumber}`,
    });

    this.purchaseOrders.set(`${session.activeOrganization.id}:${poNumber}`, po);
    return po;
  }

  // 4. Record Receiving Receipt (Partial & Full Receiving with Inventory Handoff)
  recordReceipt(
    session: SessionContext,
    poNumber: string,
    params: {
      packingSlipNumber: string;
      itemsReceived: { itemCode: string; quantityReceived: number; lotNumber?: string }[];
      notes?: string;
    }
  ): { purchaseOrder: PurchaseOrder; receipt: ReceivingReceipt } {
    authorizationService.requireCapability(session, "inventory:receive_material");

    const po = this.findPurchaseOrder(session, poNumber);
    const now = new Date().toISOString();
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Update quantities on PO lines & invoke inventory receiving port
    for (const item of params.itemsReceived) {
      const line = po.lineItems.find((li) => li.itemCode === item.itemCode);
      if (!line) {
        throw new Error(`Item ${item.itemCode} is not listed on Purchase Order ${poNumber}.`);
      }
      line.quantityReceived += item.quantityReceived;

      // Ensure item is registered in inventory before receiving
      try {
        inventoryService.getItem(session, item.itemCode);
      } catch {
        inventoryService.createItem(session, {
          itemCode: item.itemCode,
          description: line.description,
          category: "raw_material",
          unitOfMeasure: "SHEET",
          defaultLocationCode: "DOCK-RECV-01",
          reorderPoint: "5",
          reorderQuantity: "10",
          standardCostCents: line.unitCostCents,
        });
      }

      inventoryService.receiveMaterial(session, {
        itemId: item.itemCode,
        quantity: item.quantityReceived,
        lotNumber: item.lotNumber,
        unitCost: line.unitCostCents / 100,
        idempotencyKey: `${poNumber}:${params.packingSlipNumber}:${item.itemCode}`,
      });
    }

    const receipt: ReceivingReceipt = {
      id: receiptId,
      poNumber: po.poNumber,
      organizationId: session.activeOrganization.id,
      packingSlipNumber: params.packingSlipNumber.trim(),
      receivedDate: now,
      receivedByUserId: session.user.id,
      receivedByName: session.user.name,
      itemsReceived: params.itemsReceived,
      notes: params.notes?.trim(),
    };

    this.receipts.set(`${session.activeOrganization.id}:${receiptId}`, receipt);

    // Determine complete vs partial status
    const allComplete = po.lineItems.every((li) => li.quantityReceived >= li.quantityOrdered);
    po.status = allComplete ? "received_complete" : "partially_received";
    if (allComplete) po.completedAt = now;
    po.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: po.id,
      action: "purchasing.goods_received",
      summary: `Dock receipt processed for ${poNumber} (Packing Slip: ${params.packingSlipNumber}). Status: ${po.status.toUpperCase()}.`,
    });

    this.purchaseOrders.set(`${session.activeOrganization.id}:${poNumber}`, po);
    return { purchaseOrder: po, receipt };
  }

  // 5. Shortages & Supplier Options
  getSupplierOptions(): SupplierOption[] {
    return [
      {
        vendorId: "vend_1",
        vendorName: "Ryerson Metal Solutions",
        unitPriceCents: 42000,
        leadTimeDays: 3,
        minimumOrderQuantity: 5,
        historicalQualityRating: 99.4,
        isPreferred: true,
      },
      {
        vendorId: "vend_2",
        vendorName: "Alro Steel Distribution",
        unitPriceCents: 43500,
        leadTimeDays: 2,
        minimumOrderQuantity: 1,
        historicalQualityRating: 98.8,
        isPreferred: false,
      },
      {
        vendorId: "vend_3",
        vendorName: "McMaster-Carr Industrial Supply",
        unitPriceCents: 51000,
        leadTimeDays: 1,
        minimumOrderQuantity: 1,
        historicalQualityRating: 99.9,
        isPreferred: false,
      },
    ];
  }

  listShortages(session: SessionContext): MaterialShortageSignal[] {
    const organizationPrefix = `${session.activeOrganization.id}:`;
    return Array.from(this.shortages.entries())
      .filter(([key]) => key.startsWith(organizationPrefix))
      .map(([, shortage]) => shortage);
  }

  // 6. Metrics & Lookups
  getPurchasingMetrics(session: SessionContext): PurchasingMetricsSummary {
    const orgPOs = Array.from(this.purchaseOrders.values()).filter(
      (p) => p.organizationId === session.activeOrganization.id
    );

    const activePOs = orgPOs.filter(
      (p) => p.status === "sent_to_vendor" || p.status === "partially_received" || p.status === "approved"
    );

    const totalOpenCommittedSpendCents = activePOs.reduce((acc, p) => acc + p.totalCostCents, 0);

    return {
      activePurchaseOrdersCount: activePOs.length,
      openShortagesCount: this.listShortages(session).length,
      totalOpenCommittedSpendCents,
      onTimeSupplierDeliveryPercentage: 98.7,
    };
  }

  listPurchaseOrders(session: SessionContext): PurchaseOrder[] {
    return Array.from(this.purchaseOrders.values()).filter(
      (p) => p.organizationId === session.activeOrganization.id
    );
  }

  getPurchaseOrder(session: SessionContext, poNumberOrId: string): PurchaseOrder {
    return this.findPurchaseOrder(session, poNumberOrId);
  }

  private findPurchaseOrder(session: SessionContext, poNumberOrId: string): PurchaseOrder {
    const po = Array.from(this.purchaseOrders.values()).find(
      (p) =>
        (p.id === poNumberOrId || p.poNumber === poNumberOrId) &&
        p.organizationId === session.activeOrganization.id
    );
    if (!po) {
      throw new Error(`Purchase Order '${poNumberOrId}' not found.`);
    }
    return po;
  }
}

export const purchasingService = new PurchasingService();
