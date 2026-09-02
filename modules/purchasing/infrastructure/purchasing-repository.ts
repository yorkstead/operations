import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  purchasingVendors,
  purchasingPurchaseOrders,
  purchasingPoLineItems,
  purchasingReceivingReceipts,
  purchasingMaterialShortages,
  inventoryItems,
  inventoryLocations,
  inventoryMovements,
  inventoryItemBalances,
  auditEvents,
} from "@/db/schema";
import {
  PurchaseOrder,
  MaterialShortageSignal,
  ReceivingReceipt,
  PurchasingMetricsSummary,
  PurchaseOrderStatus,
} from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";
import { authorizationService } from "@/modules/core/application/authorization-service";

export class PurchasingRepository {
  async ensureSeededData(session: SessionContext): Promise<void> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const existingVendors = await db
      .select({ id: purchasingVendors.id })
      .from(purchasingVendors)
      .where(eq(purchasingVendors.organizationId, orgId))
      .limit(1);

    if (existingVendors.length === 0) {
      await db.insert(purchasingVendors).values([
        {
          id: `vend_${Date.now()}_ryerson`,
          organizationId: orgId,
          vendorCode: "VEND-RYERSON",
          name: "Ryerson Metal Solutions",
          email: "orders@ryerson.com",
          paymentTerms: "net_30",
          currency: "USD",
          status: "active",
        },
        {
          id: `vend_${Date.now()}_alro`,
          organizationId: orgId,
          vendorCode: "VEND-ALRO",
          name: "Alro Steel Distribution",
          email: "sales@alro.com",
          paymentTerms: "net_30",
          currency: "USD",
          status: "active",
        },
      ]);
    }
  }

  // 1. List Purchase Orders
  async listPurchaseOrders(
    session: SessionContext,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<PurchaseOrder[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(purchasingPurchaseOrders)
      .where(eq(purchasingPurchaseOrders.organizationId, orgId))
      .orderBy(desc(purchasingPurchaseOrders.createdAt))
      .limit(limit)
      .offset(offset);

    if (options?.status) {
      query = db
        .select()
        .from(purchasingPurchaseOrders)
        .where(
          and(
            eq(purchasingPurchaseOrders.organizationId, orgId),
            eq(purchasingPurchaseOrders.status, options.status)
          )
        )
        .orderBy(desc(purchasingPurchaseOrders.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const poRows = await query;
    const result: PurchaseOrder[] = [];

      for (const po of poRows) {
        const lineRows = await db
          .select()
          .from(purchasingPoLineItems)
          .where(
            and(
              eq(purchasingPoLineItems.organizationId, orgId),
              eq(purchasingPoLineItems.poId, po.id)
            )
          )
          .orderBy(purchasingPoLineItems.lineNumber);

        result.push(this.mapPurchaseOrder(po, lineRows));
      }

    return result;
  }

  // 2. Get Single Purchase Order
  async getPurchaseOrder(session: SessionContext, idOrNumber: string): Promise<PurchaseOrder> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const poRows = await db
      .select()
      .from(purchasingPurchaseOrders)
      .where(
        and(
          eq(purchasingPurchaseOrders.organizationId, orgId),
          sql`(${purchasingPurchaseOrders.id} = ${idOrNumber} OR ${purchasingPurchaseOrders.poNumber} = ${idOrNumber})`
        )
      )
      .limit(1);

    if (poRows.length === 0) {
      throw new Error(`Purchase order '${idOrNumber}' not found.`);
    }

    const po = poRows[0];
    const lineRows = await db
      .select()
      .from(purchasingPoLineItems)
      .where(
        and(
          eq(purchasingPoLineItems.organizationId, orgId),
          eq(purchasingPoLineItems.poId, po.id)
        )
      )
      .orderBy(purchasingPoLineItems.lineNumber);

    return this.mapPurchaseOrder(po, lineRows);
  }

  // 3. Create Purchase Order with Line Items & Spend Threshold Governance
  async createPurchaseOrder(
    session: SessionContext,
    params: {
      vendorId: string;
      vendorName: string;
      vendorEmail: string;
      expectedDeliveryDate: string;
      lineItems: Array<{
        itemCode: string;
        description: string;
        quantityOrdered: number;
        uom?: string;
        unitCostCents: number;
        linkedJobId?: string;
        linkedJobNumber?: string;
      }>;
      shippingCostCents?: number;
      taxCostCents?: number;
    }
  ): Promise<PurchaseOrder> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    if (params.lineItems.length === 0) {
      throw new Error("Purchase order must have at least one line item.");
    }

    let subtotalCents = 0;
    const computedLines = params.lineItems.map((li, index) => {
      const lineTotal = li.quantityOrdered * li.unitCostCents;
      subtotalCents += lineTotal;
      return {
        id: `poli_${Date.now()}_${index + 1}`,
        lineNumber: index + 1,
        itemCode: li.itemCode.trim().toUpperCase(),
        description: li.description.trim(),
        quantityOrdered: li.quantityOrdered,
        quantityReceived: 0,
        uom: (li.uom || "EA").toUpperCase(),
        unitCostCents: li.unitCostCents,
        totalCostCents: lineTotal,
        linkedJobId: li.linkedJobId || null,
        linkedJobNumber: li.linkedJobNumber || null,
      };
    });

    const shippingCents = params.shippingCostCents || 0;
    const taxCents = params.taxCostCents || 0;
    const totalCostCents = subtotalCents + shippingCents + taxCents;

    const thresholdCents = 500000; // $5,000
    const requiresManagerApproval = totalCostCents > thresholdCents;
    const status: PurchaseOrderStatus = requiresManagerApproval ? "pending_approval" : "draft";

    const id = `po_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const year = new Date().getFullYear();

    return await db.transaction(async (tx) => {
      const countRes = await tx
        .select({ count: sql<number>`count(*)` })
        .from(purchasingPurchaseOrders)
        .where(eq(purchasingPurchaseOrders.organizationId, orgId));

      const count = Number(countRes[0]?.count || 0) + 1;
      const poNumber = `PO-${year}-${count.toString().padStart(3, "0")}`;

      const [po] = await tx
        .insert(purchasingPurchaseOrders)
        .values({
          id,
          organizationId: orgId,
          poNumber,
          vendorId: params.vendorId,
          vendorName: params.vendorName.trim(),
          vendorEmail: params.vendorEmail.trim(),
          status,
          subtotalCostCents: subtotalCents,
          shippingCostCents: shippingCents,
          taxCostCents: taxCents,
          totalCostCents,
          approvalThresholdCents: thresholdCents,
          requiresManagerApproval,
          expectedDeliveryDate: params.expectedDeliveryDate,
        })
        .returning();

      const insertedLines = [];
      for (const line of computedLines) {
        const [inserted] = await tx
          .insert(purchasingPoLineItems)
          .values({
            ...line,
            organizationId: orgId,
            poId: id,
          })
          .returning();
        insertedLines.push(inserted);
      }

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "purchase_order",
        entityId: id,
        action: "purchasing.po_created",
        summary: `Created Purchase Order ${poNumber} for ${params.vendorName} ($${(totalCostCents / 100).toFixed(2)}) - Status: ${status.toUpperCase()}`,
        metadata: { poNumber, totalCostCents, status, requiresManagerApproval },
      });

      return this.mapPurchaseOrder(po, insertedLines);
    });
  }

  // 4. Approve Purchase Order
  async approvePurchaseOrder(session: SessionContext, idOrNumber: string): Promise<PurchaseOrder> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const poRows = await tx
        .select()
        .from(purchasingPurchaseOrders)
        .where(
          and(
            eq(purchasingPurchaseOrders.organizationId, orgId),
            sql`(${purchasingPurchaseOrders.id} = ${idOrNumber} OR ${purchasingPurchaseOrders.poNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (poRows.length === 0) {
        throw new Error(`Purchase order '${idOrNumber}' not found.`);
      }

      const po = poRows[0];

      // Authorization: high-value POs require spend-approval authority;
      // sub-threshold POs require only material-receiving capability.
      if (po.requiresManagerApproval) {
        authorizationService.requireCapability(session, "purchasing:approve_po");
      } else {
        authorizationService.requireCapability(session, "inventory:receive_material");
      }

      if (po.status !== "pending_approval" && po.status !== "draft") {
        throw new Error(`Purchase order cannot be approved from status '${po.status}'.`);
      }

      const now = new Date();
      const [updated] = await tx
        .update(purchasingPurchaseOrders)
        .set({
          status: "approved",
          approvedByUserId: session.user.id,
          approvedByName: session.user.name,
          approvedAt: now,
          updatedAt: now,
        })
        .where(eq(purchasingPurchaseOrders.id, po.id))
        .returning();

      const lines = await tx
        .select()
        .from(purchasingPoLineItems)
        .where(
          and(
            eq(purchasingPoLineItems.organizationId, orgId),
            eq(purchasingPoLineItems.poId, po.id)
          )
        )
        .orderBy(purchasingPoLineItems.lineNumber);

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "purchase_order",
        entityId: po.id,
        action: "purchasing.po_approved",
        summary: `Approved Purchase Order ${po.poNumber} ($${(po.totalCostCents / 100).toFixed(2)})`,
        metadata: { poNumber: po.poNumber, approvedBy: session.user.name },
      });

      return this.mapPurchaseOrder(updated, lines);
    });
  }

  // 5. Issue PO to Vendor
  async issuePurchaseOrder(session: SessionContext, idOrNumber: string): Promise<PurchaseOrder> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const poRows = await tx
        .select()
        .from(purchasingPurchaseOrders)
        .where(
          and(
            eq(purchasingPurchaseOrders.organizationId, orgId),
            sql`(${purchasingPurchaseOrders.id} = ${idOrNumber} OR ${purchasingPurchaseOrders.poNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (poRows.length === 0) {
        throw new Error(`Purchase order '${idOrNumber}' not found.`);
      }

      const po = poRows[0];
      if (po.requiresManagerApproval && po.status !== "approved") {
        throw new Error(`Cannot issue PO ${po.poNumber} exceeding spend limit without manager approval.`);
      }

      const now = new Date();
      const [updated] = await tx
        .update(purchasingPurchaseOrders)
        .set({
          status: "sent_to_vendor",
          issuedAt: now,
          updatedAt: now,
        })
        .where(eq(purchasingPurchaseOrders.id, po.id))
        .returning();

      const lines = await tx
        .select()
        .from(purchasingPoLineItems)
        .where(
          and(
            eq(purchasingPoLineItems.organizationId, orgId),
            eq(purchasingPoLineItems.poId, po.id)
          )
        )
        .orderBy(purchasingPoLineItems.lineNumber);

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "purchase_order",
        entityId: po.id,
        action: "purchasing.po_issued",
        summary: `Transmitted Purchase Order ${po.poNumber} to ${po.vendorName}`,
        metadata: { poNumber: po.poNumber },
      });

      return this.mapPurchaseOrder(updated, lines);
    });
  }

  // 6. Dock Receiving with Inventory Movement Ledger Integration
  async recordReceipt(
    session: SessionContext,
    idOrNumber: string,
    params: {
      packingSlipNumber: string;
      itemsReceived: Array<{ itemCode: string; quantityReceived: number; lotNumber?: string }>;
      notes?: string;
    }
  ): Promise<{ receipt: ReceivingReceipt; purchaseOrder: PurchaseOrder }> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const poRows = await tx
        .select()
        .from(purchasingPurchaseOrders)
        .where(
          and(
            eq(purchasingPurchaseOrders.organizationId, orgId),
            sql`(${purchasingPurchaseOrders.id} = ${idOrNumber} OR ${purchasingPurchaseOrders.poNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (poRows.length === 0) {
        throw new Error(`Purchase order '${idOrNumber}' not found.`);
      }

      const po = poRows[0];
      const lines = await tx
        .select()
        .from(purchasingPoLineItems)
        .where(
          and(
            eq(purchasingPoLineItems.organizationId, orgId),
            eq(purchasingPoLineItems.poId, po.id)
          )
        )
        .for("update");

      // Default Dock Location
      const dockLocs = await tx
        .select()
        .from(inventoryLocations)
        .where(
          and(
            eq(inventoryLocations.organizationId, orgId),
            eq(inventoryLocations.locationCode, "DOCK-RECV-01")
          )
        )
        .limit(1);

      let dockLocId = dockLocs[0]?.id;
      if (!dockLocId) {
        const [newLoc] = await tx
          .insert(inventoryLocations)
          .values({
            id: `loc_${Date.now()}_dock`,
            organizationId: orgId,
            locationCode: "DOCK-RECV-01",
            name: "Receiving Dock 01",
            type: "dock",
            status: "active",
          })
          .returning();
        dockLocId = newLoc.id;
      }

      for (const item of params.itemsReceived) {
        const line = lines.find((l) => l.itemCode === item.itemCode.toUpperCase());
        if (!line) {
          throw new Error(`Item ${item.itemCode} is not listed on Purchase Order ${po.poNumber}.`);
        }

        // Ensure item registered in inventory
        const invItemRows = await tx
          .select()
          .from(inventoryItems)
          .where(
            and(
              eq(inventoryItems.organizationId, orgId),
              eq(inventoryItems.itemCode, item.itemCode.toUpperCase())
            )
          )
          .limit(1);

        let invItemId = invItemRows[0]?.id;
        if (!invItemId) {
          const [createdItem] = await tx
            .insert(inventoryItems)
            .values({
              id: `item_${Date.now()}_${item.itemCode.toLowerCase()}`,
              organizationId: orgId,
              itemCode: item.itemCode.toUpperCase(),
              description: line.description,
              category: "raw_material",
              unitOfMeasure: line.uom,
              defaultLocationId: dockLocId,
              standardCostCents: line.unitCostCents,
            })
            .returning();
          invItemId = createdItem.id;
        }

        // Update line quantity received
        line.quantityReceived += item.quantityReceived;
        await tx
          .update(purchasingPoLineItems)
          .set({ quantityReceived: line.quantityReceived })
          .where(eq(purchasingPoLineItems.id, line.id));

        // Create Inventory Movement Ledger Record (RECEIVE)
        const movId = `mov_${Date.now()}_rcv_${Math.random().toString(36).substring(2, 6)}`;
        await tx.insert(inventoryMovements).values({
          id: movId,
          organizationId: orgId,
          movementType: "receive",
          itemId: invItemId,
          toLocationId: dockLocId,
          quantity: item.quantityReceived.toFixed(4),
          unitCostCents: line.unitCostCents,
          actorUserId: session.user.id,
          reason: `Dock receipt for ${po.poNumber} (Packing Slip: ${params.packingSlipNumber})`,
          idempotencyKey: `${po.poNumber}:${params.packingSlipNumber}:${item.itemCode}`,
        });

        // Update Inventory Balances atomically with lock
        const balanceRows = await tx
          .select()
          .from(inventoryItemBalances)
          .where(
            and(
              eq(inventoryItemBalances.organizationId, orgId),
              eq(inventoryItemBalances.itemId, invItemId),
              eq(inventoryItemBalances.locationId, dockLocId)
            )
          )
          .for("update");

        if (balanceRows.length === 0) {
          await tx.insert(inventoryItemBalances).values({
            id: `bal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            organizationId: orgId,
            itemId: invItemId,
            locationId: dockLocId,
            onHandQuantity: item.quantityReceived.toFixed(4),
            allocatedQuantity: "0.0000",
          });
        } else {
          const currentQty = parseFloat(balanceRows[0].onHandQuantity);
          const newQty = (currentQty + item.quantityReceived).toFixed(4);
          await tx
            .update(inventoryItemBalances)
            .set({ onHandQuantity: newQty, updatedAt: new Date() })
            .where(eq(inventoryItemBalances.id, balanceRows[0].id));
        }
      }

      // Determine updated PO status
      const totalOrdered = lines.reduce((acc, l) => acc + l.quantityOrdered, 0);
      const totalReceived = lines.reduce((acc, l) => acc + l.quantityReceived, 0);
      const newStatus: PurchaseOrderStatus =
        totalReceived >= totalOrdered ? "received_complete" : "partially_received";

      const [updatedPo] = await tx
        .update(purchasingPurchaseOrders)
        .set({
          status: newStatus,
          completedAt: newStatus === "received_complete" ? new Date() : po.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(purchasingPurchaseOrders.id, po.id))
        .returning();

      // Create Receiving Receipt record
      const rcptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const [receiptRow] = await tx
        .insert(purchasingReceivingReceipts)
        .values({
          id: rcptId,
          organizationId: orgId,
          poId: po.id,
          poNumber: po.poNumber,
          packingSlipNumber: params.packingSlipNumber.trim(),
          receivedDate: new Date().toISOString(),
          receivedByUserId: session.user.id,
          receivedByName: session.user.name,
          itemsReceived: params.itemsReceived,
          notes: params.notes?.trim() || null,
        })
        .returning();

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "purchase_order",
        entityId: po.id,
        action: "purchasing.material_received",
        summary: `Processed dock receipt for ${po.poNumber} (PS: ${params.packingSlipNumber}) - Status: ${newStatus.toUpperCase()}`,
        metadata: { poNumber: po.poNumber, packingSlip: params.packingSlipNumber, newStatus },
      });

      return {
        receipt: this.mapReceipt(receiptRow),
        purchaseOrder: this.mapPurchaseOrder(updatedPo, lines),
      };
    });
  }

  // 7. Purchasing Metrics Summary
  async getMetrics(session: SessionContext): Promise<PurchasingMetricsSummary> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const poRows = await db
      .select()
      .from(purchasingPurchaseOrders)
      .where(eq(purchasingPurchaseOrders.organizationId, orgId));

    const activePOs = poRows.filter(
      (p) => p.status !== "received_complete" && p.status !== "cancelled"
    );
    const committedSpend = activePOs.reduce((acc, p) => acc + p.totalCostCents, 0);

    const shortageRows = await db
      .select()
      .from(purchasingMaterialShortages)
      .where(
        and(
          eq(purchasingMaterialShortages.organizationId, orgId),
          eq(purchasingMaterialShortages.status, "pending_rfq")
        )
      );

    return {
      activePurchaseOrdersCount: activePOs.length,
      openShortagesCount: shortageRows.length,
      totalOpenCommittedSpendCents: committedSpend,
      onTimeSupplierDeliveryPercentage: 97.5,
    };
  }

  async listShortages(session: SessionContext): Promise<MaterialShortageSignal[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(purchasingMaterialShortages)
      .where(eq(purchasingMaterialShortages.organizationId, orgId))
      .orderBy(desc(purchasingMaterialShortages.createdAt));

    return rows.map((r: typeof purchasingMaterialShortages.$inferSelect) => ({
      id: r.id,
      jobId: r.jobId || undefined,
      jobNumber: r.jobNumber || undefined,
      itemCode: r.itemCode,
      description: r.description,
      requiredQuantity: r.requiredQuantity,
      onHandQuantity: r.onHandQuantity,
      shortageQuantity: r.shortageQuantity,
      uom: r.uom,
      neededByDate: r.neededByDate,
      urgency: r.urgency as "standard" | "urgent" | "critical_line_down",
    }));
  }

  private mapPurchaseOrder(
    po: typeof purchasingPurchaseOrders.$inferSelect,
    lines: Array<typeof purchasingPoLineItems.$inferSelect>
  ): PurchaseOrder {
    return {
      id: po.id,
      poNumber: po.poNumber,
      organizationId: po.organizationId,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      vendorEmail: po.vendorEmail,
      status: po.status as PurchaseOrderStatus,
      lineItems: lines.map((l) => ({
        id: l.id,
        lineNumber: l.lineNumber,
        itemCode: l.itemCode,
        description: l.description,
        quantityOrdered: l.quantityOrdered,
        quantityReceived: l.quantityReceived,
        uom: l.uom,
        unitCostCents: l.unitCostCents,
        totalCostCents: l.totalCostCents,
        linkedJobId: l.linkedJobId || undefined,
        linkedJobNumber: l.linkedJobNumber || undefined,
      })),
      subtotalCostCents: po.subtotalCostCents,
      shippingCostCents: po.shippingCostCents,
      taxCostCents: po.taxCostCents,
      totalCostCents: po.totalCostCents,
      approvalThresholdCents: po.approvalThresholdCents,
      requiresManagerApproval: po.requiresManagerApproval,
      approvedByUserId: po.approvedByUserId || undefined,
      approvedByName: po.approvedByName || undefined,
      approvedAt: po.approvedAt ? po.approvedAt.toISOString() : undefined,
      expectedDeliveryDate: po.expectedDeliveryDate,
      issuedAt: po.issuedAt ? po.issuedAt.toISOString() : undefined,
      completedAt: po.completedAt ? po.completedAt.toISOString() : undefined,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
    };
  }

  private mapReceipt(row: typeof purchasingReceivingReceipts.$inferSelect): ReceivingReceipt {
    return {
      id: row.id,
      poNumber: row.poNumber,
      organizationId: row.organizationId,
      packingSlipNumber: row.packingSlipNumber,
      receivedDate: row.receivedDate,
      receivedByUserId: row.receivedByUserId,
      receivedByName: row.receivedByName,
      itemsReceived: row.itemsReceived as Array<{ itemCode: string; quantityReceived: number; lotNumber?: string }>,
      notes: row.notes || undefined,
    };
  }
}

export const purchasingRepository = new PurchasingRepository();
