import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  inventoryItems,
  inventoryLocations,
  inventoryItemBalances,
  inventoryMovements,
  inventoryCycleCounts,
  auditEvents,
  jobs,
  shopfloorTravelers,
} from "@/db/schema";
import {
  InventoryItem,
  InventoryLocation,
  InventoryMovement,
  InventoryCycleCount,
  ItemStockSummary,
  InventoryItemBalance,
  MovementType,
  ItemCategory,
  InventoryUnit,
} from "../domain/types";
import { Quantity } from "../domain/quantity";
import {
  InsufficientStockError,
  ItemNotFoundError,
  DuplicateItemCodeError,
  InvalidMovementError,
} from "../domain/errors";
import { SessionContext } from "@/modules/core/domain/types";

export class InventoryRepository {
  // 1. Items Management
  async createItem(
    session: SessionContext,
    params: {
      itemCode: string;
      description: string;
      category: ItemCategory;
      unitOfMeasure: InventoryUnit;
      defaultLocationId?: string;
      reorderPoint?: string;
      reorderQuantity?: string;
      standardCostCents?: number;
      lotTrackingRequired?: boolean;
    }
  ): Promise<InventoryItem> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const normalizedCode = params.itemCode.trim().toUpperCase();

    // Check duplicate
    const existing = await db
      .select({ id: inventoryItems.id })
      .from(inventoryItems)
      .where(and(eq(inventoryItems.organizationId, orgId), eq(inventoryItems.itemCode, normalizedCode)))
      .limit(1);

    if (existing.length > 0) {
      throw new DuplicateItemCodeError(normalizedCode);
    }

    const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reorderPointQty = Quantity.fromString(params.reorderPoint || "0").toDbString();
    const reorderQuantityQty = Quantity.fromString(params.reorderQuantity || "0").toDbString();

    const [created] = await db
      .insert(inventoryItems)
      .values({
        id: itemId,
        organizationId: orgId,
        itemCode: normalizedCode,
        description: params.description.trim(),
        category: params.category,
        unitOfMeasure: params.unitOfMeasure,
        defaultLocationId: params.defaultLocationId || null,
        reorderPoint: reorderPointQty,
        reorderQuantity: reorderQuantityQty,
        standardCostCents: params.standardCostCents || 0,
        lotTrackingRequired: params.lotTrackingRequired || false,
        status: "active",
      })
      .returning();

    // Audit log
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "inventory_item",
      entityId: created.id,
      action: "item.created",
      summary: `Created item SKU ${created.itemCode} (${created.description})`,
      metadata: { itemCode: created.itemCode, category: created.category },
    });

    return this.mapItem(created);
  }

  async getItem(session: SessionContext, itemIdOrCode: string): Promise<InventoryItem> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const items = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.organizationId, orgId),
          sql`(${inventoryItems.id} = ${itemIdOrCode} OR ${inventoryItems.itemCode} = ${itemIdOrCode.toUpperCase()})`
        )
      )
      .limit(1);

    if (items.length === 0) {
      throw new ItemNotFoundError(itemIdOrCode);
    }
    return this.mapItem(items[0]);
  }

  async listItems(
    session: SessionContext,
    options?: { category?: string; searchQuery?: string; limit?: number; offset?: number }
  ): Promise<{ items: ItemStockSummary[]; total: number }> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.organizationId, orgId))
      .orderBy(desc(inventoryItems.createdAt))
      .limit(limit)
      .offset(offset);

    if (options?.category) {
      query = db
        .select()
        .from(inventoryItems)
        .where(and(eq(inventoryItems.organizationId, orgId), eq(inventoryItems.category, options.category)))
        .orderBy(desc(inventoryItems.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    const summaries: ItemStockSummary[] = [];

    for (const r of rows) {
      // Calculate derived stock summary from balances
      const balances = await db
        .select({
          onHand: inventoryItemBalances.onHandQuantity,
          allocated: inventoryItemBalances.allocatedQuantity,
        })
        .from(inventoryItemBalances)
        .where(and(eq(inventoryItemBalances.organizationId, orgId), eq(inventoryItemBalances.itemId, r.id)));

      let onHandQty = Quantity.zero();
      let allocatedQty = Quantity.zero();

      for (const b of balances) {
        onHandQty = onHandQty.add(Quantity.fromString(b.onHand));
        allocatedQty = allocatedQty.add(Quantity.fromString(b.allocated));
      }

      const availableQty = onHandQty.subtract(allocatedQty);
      const reorderQty = Quantity.fromString(r.reorderPoint);
      const isLow = onHandQty.isLessThan(reorderQty) || onHandQty.isZero();
      const valuationCents = Math.round(onHandQty.toNumber() * (r.standardCostCents || 0));

      summaries.push({
        itemId: r.id,
        itemCode: r.itemCode,
        description: r.description,
        category: r.category as ItemCategory,
        unitOfMeasure: r.unitOfMeasure as InventoryUnit,
        totalOnHand: onHandQty.toString(),
        totalAllocated: allocatedQty.toString(),
        totalAvailable: (availableQty.isNegative() ? Quantity.zero() : availableQty).toString(),
        reorderPoint: reorderQty.toString(),
        isLowStock: isLow,
        standardCostCents: r.standardCostCents,
        totalValuationCents: valuationCents,
      });
    }

    return { items: summaries, total: summaries.length };
  }

  // 2. Locations Management
  async createLocation(
    session: SessionContext,
    params: { locationCode: string; name: string; type?: string }
  ): Promise<InventoryLocation> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const codeUpper = params.locationCode.trim().toUpperCase();

    const [created] = await db
      .insert(inventoryLocations)
      .values({
        id: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        locationCode: codeUpper,
        name: params.name.trim(),
        type: params.type || "bin",
        status: "active",
      })
      .returning();

    return {
      id: created.id,
      organizationId: created.organizationId,
      locationCode: created.locationCode,
      name: created.name,
      type: created.type,
      status: created.status as "active" | "archived",
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async listLocations(session: SessionContext): Promise<InventoryLocation[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const rows = await db
      .select()
      .from(inventoryLocations)
      .where(and(eq(inventoryLocations.organizationId, orgId), eq(inventoryLocations.status, "active")))
      .orderBy(inventoryLocations.locationCode);

    return rows.map((r: typeof inventoryLocations.$inferSelect) => ({
      id: r.id,
      organizationId: r.organizationId,
      locationCode: r.locationCode,
      name: r.name,
      type: r.type,
      status: r.status as "active" | "archived",
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  // 3. Movement Posting with Atomic Transaction, Row Locking & Audit Event
  async postMovement(
    session: SessionContext,
    params: {
      movementType: MovementType;
      itemId: string;
      lotId?: string;
      fromLocationId?: string;
      toLocationId?: string;
      quantity: string;
      unitCostCents?: number;
      jobId?: string;
      travelerId?: string;
      reason?: string;
      idempotencyKey?: string;
    }
  ): Promise<InventoryMovement> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const moveQty = Quantity.fromString(params.quantity);

    if (!moveQty.isPositive()) {
      throw new InvalidMovementError(`Movement quantity must be greater than zero. Received: ${params.quantity}`);
    }

    // Idempotency check
    if (params.idempotencyKey) {
      const existing = await db
        .select()
        .from(inventoryMovements)
        .where(
          and(
            eq(inventoryMovements.organizationId, orgId),
            eq(inventoryMovements.idempotencyKey, params.idempotencyKey)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return this.mapMovement(existing[0]);
      }
    }

    // Validate Item
    const item = await this.getItem(session, params.itemId);

    // Validate Cross-Module Job / Traveler Tenant Safety
    if (params.jobId) {
      const jobRows = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(and(eq(jobs.id, params.jobId), eq(jobs.organizationId, orgId)))
        .limit(1);
      if (jobRows.length === 0) {
        throw new Error(`Referenced Job '${params.jobId}' does not exist in active organization.`);
      }
    }

    if (params.travelerId) {
      const travRows = await db
        .select({ id: shopfloorTravelers.id, jobId: shopfloorTravelers.jobId })
        .from(shopfloorTravelers)
        .where(and(eq(shopfloorTravelers.id, params.travelerId), eq(shopfloorTravelers.organizationId, orgId)))
        .limit(1);
      if (travRows.length === 0) {
        throw new Error(`Referenced Traveler '${params.travelerId}' does not exist in active organization.`);
      }
    }

    // Execute atomic transaction
    return await db.transaction(async (tx) => {
      // 1. If deducting from a location (issue_to_job, transfer, scrap), lock balance row and verify stock
      if (params.fromLocationId) {
        const balanceRows = await tx
          .select()
          .from(inventoryItemBalances)
          .where(
            and(
              eq(inventoryItemBalances.organizationId, orgId),
              eq(inventoryItemBalances.itemId, item.id),
              eq(inventoryItemBalances.locationId, params.fromLocationId),
              params.lotId ? eq(inventoryItemBalances.lotId, params.lotId) : sql`TRUE`
            )
          )
          .for("update");

        let currentOnHand = Quantity.zero();
        for (const b of balanceRows) {
          currentOnHand = currentOnHand.add(Quantity.fromString(b.onHandQuantity));
        }

        if (currentOnHand.isLessThan(moveQty)) {
          throw new InsufficientStockError(item.itemCode, currentOnHand.toString(), moveQty.toString());
        }

        if (balanceRows.length > 0) {
          const targetRow = balanceRows[0];
          const newOnHand = Quantity.fromString(targetRow.onHandQuantity).subtract(moveQty);
          await tx
            .update(inventoryItemBalances)
            .set({
              onHandQuantity: newOnHand.toDbString(),
              updatedAt: new Date(),
            })
            .where(eq(inventoryItemBalances.id, targetRow.id));
        }
      }

      // 2. If adding to a destination location (receive, return_from_job, transfer, cycle_count_adjustment)
      if (params.toLocationId) {
        const destRows = await tx
          .select()
          .from(inventoryItemBalances)
          .where(
            and(
              eq(inventoryItemBalances.organizationId, orgId),
              eq(inventoryItemBalances.itemId, item.id),
              eq(inventoryItemBalances.locationId, params.toLocationId),
              params.lotId ? eq(inventoryItemBalances.lotId, params.lotId) : sql`TRUE`
            )
          )
          .for("update");

        if (destRows.length > 0) {
          const destRow = destRows[0];
          const newOnHand = Quantity.fromString(destRow.onHandQuantity).add(moveQty);
          await tx
            .update(inventoryItemBalances)
            .set({
              onHandQuantity: newOnHand.toDbString(),
              updatedAt: new Date(),
            })
            .where(eq(inventoryItemBalances.id, destRow.id));
        } else {
          await tx.insert(inventoryItemBalances).values({
            id: `bal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            organizationId: orgId,
            itemId: item.id,
            locationId: params.toLocationId,
            lotId: params.lotId || null,
            onHandQuantity: moveQty.toDbString(),
            allocatedQuantity: "0.0000",
          });
        }
      }

      // 3. Insert immutable movement record
      const moveId = `move_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const [movement] = await tx
        .insert(inventoryMovements)
        .values({
          id: moveId,
          organizationId: orgId,
          movementType: params.movementType,
          itemId: item.id,
          lotId: params.lotId || null,
          fromLocationId: params.fromLocationId || null,
          toLocationId: params.toLocationId || null,
          quantity: moveQty.toDbString(),
          unitCostCents: params.unitCostCents ?? item.standardCostCents,
          jobId: params.jobId || null,
          travelerId: params.travelerId || null,
          actorUserId: session.user.id,
          reason: params.reason || null,
          idempotencyKey: params.idempotencyKey || null,
        })
        .returning();

      // 4. Record audit event atomically
      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "inventory_movement",
        entityId: movement.id,
        action: `inventory.${params.movementType}`,
        summary: `Posted movement ${params.movementType.toUpperCase()} of ${moveQty.toString()} ${item.unitOfMeasure} for SKU ${item.itemCode}`,
        metadata: {
          movementType: params.movementType,
          itemCode: item.itemCode,
          quantity: moveQty.toString(),
          jobId: params.jobId,
          travelerId: params.travelerId,
        },
      });

      return this.mapMovement(movement, item.itemCode);
    });
  }

  // 4. Cycle Count & Atomic Adjustment
  async recordCycleCount(
    session: SessionContext,
    params: {
      itemId: string;
      locationId: string;
      lotId?: string;
      observedQuantity: string;
      reason: string;
    }
  ): Promise<{ cycleCount: InventoryCycleCount; adjustmentMovement?: InventoryMovement }> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const item = await this.getItem(session, params.itemId);
    const observedQty = Quantity.fromString(params.observedQuantity);

    if (observedQty.isNegative()) {
      throw new InvalidMovementError("Observed cycle count quantity cannot be negative.");
    }

    return await db.transaction(async (tx) => {
      const balances = await tx
        .select()
        .from(inventoryItemBalances)
        .where(
          and(
            eq(inventoryItemBalances.organizationId, orgId),
            eq(inventoryItemBalances.itemId, item.id),
            eq(inventoryItemBalances.locationId, params.locationId),
            params.lotId ? eq(inventoryItemBalances.lotId, params.lotId) : sql`TRUE`
          )
        )
        .for("update");

      let expectedQty = Quantity.zero();
      let balanceRowId: string | null = null;
      if (balances.length > 0) {
        expectedQty = Quantity.fromString(balances[0].onHandQuantity);
        balanceRowId = balances[0].id;
      }

      const varianceQty = observedQty.subtract(expectedQty);
      let resultingMoveId: string | null = null;
      let createdMove: InventoryMovement | undefined = undefined;

      if (!varianceQty.isZero()) {
        const moveId = `move_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const isAddition = varianceQty.isPositive();
        const adjQty = isAddition ? varianceQty : expectedQty.subtract(observedQty);

        const [move] = await tx
          .insert(inventoryMovements)
          .values({
            id: moveId,
            organizationId: orgId,
            movementType: "cycle_count_adjustment",
            itemId: item.id,
            lotId: params.lotId || null,
            fromLocationId: isAddition ? null : params.locationId,
            toLocationId: isAddition ? params.locationId : null,
            quantity: adjQty.toDbString(),
            unitCostCents: item.standardCostCents,
            actorUserId: session.user.id,
            reason: `Cycle Count Adjustment: ${params.reason}`,
          })
          .returning();

        resultingMoveId = move.id;
        createdMove = this.mapMovement(move, item.itemCode);

        if (balanceRowId) {
          await tx
            .update(inventoryItemBalances)
            .set({
              onHandQuantity: observedQty.toDbString(),
              updatedAt: new Date(),
            })
            .where(eq(inventoryItemBalances.id, balanceRowId));
        } else {
          await tx.insert(inventoryItemBalances).values({
            id: `bal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            organizationId: orgId,
            itemId: item.id,
            locationId: params.locationId,
            lotId: params.lotId || null,
            onHandQuantity: observedQty.toDbString(),
            allocatedQuantity: "0.0000",
          });
        }
      }

      const countId = `count_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const [cc] = await tx
        .insert(inventoryCycleCounts)
        .values({
          id: countId,
          organizationId: orgId,
          itemId: item.id,
          locationId: params.locationId,
          lotId: params.lotId || null,
          expectedQuantity: expectedQty.toDbString(),
          observedQuantity: observedQty.toDbString(),
          varianceQuantity: varianceQty.toDbString(),
          reason: params.reason,
          countedByUserId: session.user.id,
          resultingMovementId: resultingMoveId,
        })
        .returning();

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "inventory_cycle_count",
        entityId: cc.id,
        action: "inventory.cycle_counted",
        summary: `Cycle count for ${item.itemCode}: observed ${observedQty.toString()}, expected ${expectedQty.toString()} (variance: ${varianceQty.toString()})`,
        metadata: { variance: varianceQty.toString(), reason: params.reason },
      });

      return {
        cycleCount: {
          id: cc.id,
          organizationId: cc.organizationId,
          itemId: cc.itemId,
          itemCode: item.itemCode,
          locationId: cc.locationId,
          locationCode: params.locationId,
          expectedQuantity: Quantity.fromString(cc.expectedQuantity).toString(),
          observedQuantity: Quantity.fromString(cc.observedQuantity).toString(),
          varianceQuantity: Quantity.fromString(cc.varianceQuantity).toString(),
          reason: cc.reason,
          countedByUserId: cc.countedByUserId,
          resultingMovementId: cc.resultingMovementId || undefined,
          countedAt: cc.countedAt.toISOString(),
          createdAt: cc.createdAt.toISOString(),
        },
        adjustmentMovement: createdMove,
      };
    });
  }

  // 5. Movements History & Balance Lookups
  async listMovements(
    session: SessionContext,
    itemId?: string,
    options?: { limit?: number; offset?: number }
  ): Promise<InventoryMovement[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(inventoryMovements)
      .where(eq(inventoryMovements.organizationId, orgId))
      .orderBy(desc(inventoryMovements.occurredAt))
      .limit(limit)
      .offset(offset);

    if (itemId) {
      query = db
        .select()
        .from(inventoryMovements)
        .where(and(eq(inventoryMovements.organizationId, orgId), eq(inventoryMovements.itemId, itemId)))
        .orderBy(desc(inventoryMovements.occurredAt))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    return rows.map((r: typeof inventoryMovements.$inferSelect) => this.mapMovement(r));
  }

  async getItemBalances(session: SessionContext, itemId: string): Promise<InventoryItemBalance[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const rows = await db
      .select({
        id: inventoryItemBalances.id,
        organizationId: inventoryItemBalances.organizationId,
        itemId: inventoryItemBalances.itemId,
        locationId: inventoryItemBalances.locationId,
        locationCode: inventoryLocations.locationCode,
        locationName: inventoryLocations.name,
        lotId: inventoryItemBalances.lotId,
        onHandQuantity: inventoryItemBalances.onHandQuantity,
        allocatedQuantity: inventoryItemBalances.allocatedQuantity,
        updatedAt: inventoryItemBalances.updatedAt,
      })
      .from(inventoryItemBalances)
      .innerJoin(inventoryLocations, eq(inventoryItemBalances.locationId, inventoryLocations.id))
      .where(and(eq(inventoryItemBalances.organizationId, orgId), eq(inventoryItemBalances.itemId, itemId)));

    return rows.map((r: { id: string; organizationId: string; itemId: string; locationId: string; locationCode: string; locationName: string; lotId: string | null; onHandQuantity: string; allocatedQuantity: string; updatedAt: Date }) => {
      const onHand = Quantity.fromString(r.onHandQuantity);
      const allocated = Quantity.fromString(r.allocatedQuantity);
      const avail = onHand.subtract(allocated);

      return {
        id: r.id,
        organizationId: r.organizationId,
        itemId: r.itemId,
        locationId: r.locationId,
        locationCode: r.locationCode,
        locationName: r.locationName,
        lotId: r.lotId || undefined,
        onHandQuantity: onHand.toString(),
        allocatedQuantity: allocated.toString(),
        availableQuantity: (avail.isNegative() ? Quantity.zero() : avail).toString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });
  }

  private mapItem(row: typeof inventoryItems.$inferSelect): InventoryItem {
    return {
      id: row.id,
      organizationId: row.organizationId,
      itemCode: row.itemCode,
      description: row.description,
      category: row.category as ItemCategory,
      unitOfMeasure: row.unitOfMeasure as InventoryUnit,
      defaultLocationId: row.defaultLocationId || undefined,
      reorderPoint: Quantity.fromString(row.reorderPoint).toString(),
      reorderQuantity: Quantity.fromString(row.reorderQuantity).toString(),
      standardCostCents: row.standardCostCents,
      lotTrackingRequired: row.lotTrackingRequired,
      status: row.status as "active" | "archived",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapMovement(row: typeof inventoryMovements.$inferSelect, itemCode?: string): InventoryMovement {
    return {
      id: row.id,
      organizationId: row.organizationId,
      movementType: row.movementType as MovementType,
      itemId: row.itemId,
      itemCode: itemCode || row.itemId,
      lotId: row.lotId || undefined,
      fromLocationId: row.fromLocationId || undefined,
      toLocationId: row.toLocationId || undefined,
      quantity: Quantity.fromString(row.quantity).toString(),
      unitCostCents: row.unitCostCents,
      jobId: row.jobId || undefined,
      travelerId: row.travelerId || undefined,
      originalMovementId: row.originalMovementId || undefined,
      actorUserId: row.actorUserId,
      reason: row.reason || undefined,
      idempotencyKey: row.idempotencyKey || undefined,
      occurredAt: row.occurredAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    };
  }
}

export const inventoryRepository = new InventoryRepository();
