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
import { SessionContext } from "../../core/domain/types";
import { authorizationService } from "../../core/application/authorization-service";
import { Quantity } from "../domain/quantity";
import {
  InsufficientStockError,
  ItemNotFoundError,
  DuplicateItemCodeError,
  InvalidMovementError,
} from "../domain/errors";

export class InventoryService {
  private items: Map<string, InventoryItem> = new Map();
  private locations: Map<string, InventoryLocation> = new Map();
  private balances: Map<string, InventoryItemBalance> = new Map();
  private movements: Map<string, InventoryMovement> = new Map();
  private cycleCounts: Map<string, InventoryCycleCount> = new Map();

  createItem(
    session: SessionContext,
    params: {
      itemCode: string;
      description: string;
      category: ItemCategory;
      unitOfMeasure: InventoryUnit;
      defaultLocationId?: string;
      defaultLocationCode?: string;
      reorderPoint?: string | number;
      reorderQuantity?: string | number;
      standardCost?: number;
      standardCostCents?: number;
      lotTrackingRequired?: boolean;
    }
  ): InventoryItem {
    authorizationService.requireCapability(session, "inventory:adjust_count");
    const orgId = session.activeOrganization.id;
    const code = params.itemCode.trim().toUpperCase();

    // Check duplicate
    for (const item of this.items.values()) {
      if (item.organizationId === orgId && item.itemCode === code) {
        throw new DuplicateItemCodeError(code);
      }
    }

    const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const costCents = params.standardCostCents ?? (params.standardCost ? Math.round(params.standardCost * 100) : 0);
    const now = new Date().toISOString();

    const item: InventoryItem = {
      id,
      organizationId: orgId,
      itemCode: code,
      description: params.description.trim(),
      category: params.category,
      unitOfMeasure: params.unitOfMeasure,
      defaultLocationId: params.defaultLocationId,
      reorderPoint: Quantity.fromString(String(params.reorderPoint ?? 0)).toString(),
      reorderQuantity: Quantity.fromString(String(params.reorderQuantity ?? 0)).toString(),
      standardCostCents: costCents,
      lotTrackingRequired: params.lotTrackingRequired ?? false,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    this.items.set(id, item);
    return item;
  }

  getItem(session: SessionContext, idOrCode: string): InventoryItem {
    authorizationService.requireCapability(session, "inventory:view_stock");
    const orgId = session.activeOrganization.id;

    for (const item of this.items.values()) {
      if (item.organizationId === orgId && (item.id === idOrCode || item.itemCode === idOrCode.toUpperCase())) {
        return item;
      }
    }

    throw new ItemNotFoundError(idOrCode);
  }

  listStock(
    session: SessionContext,
    options?: { category?: string; searchQuery?: string; limit?: number; offset?: number }
  ): { items: ItemStockSummary[]; total: number } {
    authorizationService.requireCapability(session, "inventory:view_stock");
    const orgId = session.activeOrganization.id;

    const list: ItemStockSummary[] = [];
    for (const item of this.items.values()) {
      if (item.organizationId !== orgId) continue;
      if (options?.category && item.category !== options.category) continue;
      if (options?.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        if (!item.itemCode.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
          continue;
        }
      }

      const balances = this.getItemBalances(session, item.id);
      let onHand = Quantity.zero();
      let allocated = Quantity.zero();
      for (const b of balances) {
        onHand = onHand.add(Quantity.fromString(b.onHandQuantity));
        allocated = allocated.add(Quantity.fromString(b.allocatedQuantity));
      }
      const avail = onHand.subtract(allocated);
      const reorder = Quantity.fromString(item.reorderPoint);

      list.push({
        itemId: item.id,
        itemCode: item.itemCode,
        description: item.description,
        category: item.category,
        unitOfMeasure: item.unitOfMeasure,
        totalOnHand: onHand.toString(),
        totalAllocated: allocated.toString(),
        totalAvailable: (avail.isNegative() ? Quantity.zero() : avail).toString(),
        reorderPoint: reorder.toString(),
        isLowStock: onHand.isLessThan(reorder) || onHand.isZero(),
        standardCostCents: item.standardCostCents,
        totalValuationCents: Math.round(onHand.toNumber() * item.standardCostCents),
      });
    }

    return { items: list, total: list.length };
  }

  createLocation(
    session: SessionContext,
    params: { locationCode: string; name: string; type?: string }
  ): InventoryLocation {
    authorizationService.requireCapability(session, "inventory:adjust_count");
    const orgId = session.activeOrganization.id;
    const id = `loc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const loc: InventoryLocation = {
      id,
      organizationId: orgId,
      locationCode: params.locationCode.trim().toUpperCase(),
      name: params.name.trim(),
      type: params.type || "bin",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    this.locations.set(id, loc);
    return loc;
  }

  listLocations(session: SessionContext): InventoryLocation[] {
    authorizationService.requireCapability(session, "inventory:view_stock");
    const orgId = session.activeOrganization.id;
    return Array.from(this.locations.values()).filter((l) => l.organizationId === orgId && l.status === "active");
  }

  postMovement(
    session: SessionContext,
    params: {
      movementType: MovementType;
      itemId: string;
      lotId?: string;
      fromLocationId?: string;
      toLocationId?: string;
      quantity: string | number;
      unitCostCents?: number;
      jobId?: string;
      travelerId?: string;
      reason?: string;
      idempotencyKey?: string;
    }
  ): InventoryMovement {
    if (params.movementType === "receive") {
      authorizationService.requireCapability(session, "inventory:receive_material");
    } else {
      authorizationService.requireCapability(session, "inventory:adjust_count");
    }

    const orgId = session.activeOrganization.id;
    const qtyStr = String(params.quantity);
    const moveQty = Quantity.fromString(qtyStr);

    if (!moveQty.isPositive()) {
      throw new InvalidMovementError(`Movement quantity must be greater than zero. Received: ${qtyStr}`);
    }

    // Idempotency check
    if (params.idempotencyKey) {
      for (const m of this.movements.values()) {
        if (m.organizationId === orgId && m.idempotencyKey === params.idempotencyKey) {
          return m;
        }
      }
    }

    const item = this.getItem(session, params.itemId);

    // If deducting from location
    if (params.fromLocationId) {
      const balKey = `${orgId}:${item.id}:${params.fromLocationId}:${params.lotId || "none"}`;
      const bal = this.balances.get(balKey);
      const currentOnHand = bal ? Quantity.fromString(bal.onHandQuantity) : Quantity.zero();

      if (currentOnHand.isLessThan(moveQty)) {
        throw new InsufficientStockError(item.itemCode, currentOnHand.toString(), moveQty.toString());
      }

      if (bal) {
        bal.onHandQuantity = currentOnHand.subtract(moveQty).toString();
        bal.availableQuantity = Quantity.fromString(bal.onHandQuantity)
          .subtract(Quantity.fromString(bal.allocatedQuantity))
          .toString();
        bal.updatedAt = new Date().toISOString();
      }
    }

    // If adding to location
    if (params.toLocationId) {
      const balKey = `${orgId}:${item.id}:${params.toLocationId}:${params.lotId || "none"}`;
      let bal = this.balances.get(balKey);
      if (!bal) {
        bal = {
          id: `bal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          organizationId: orgId,
          itemId: item.id,
          locationId: params.toLocationId,
          locationCode: params.toLocationId,
          locationName: params.toLocationId,
          lotId: params.lotId,
          onHandQuantity: moveQty.toString(),
          allocatedQuantity: "0",
          availableQuantity: moveQty.toString(),
          updatedAt: new Date().toISOString(),
        };
        this.balances.set(balKey, bal);
      } else {
        const updatedOnHand = Quantity.fromString(bal.onHandQuantity).add(moveQty);
        bal.onHandQuantity = updatedOnHand.toString();
        bal.availableQuantity = updatedOnHand.subtract(Quantity.fromString(bal.allocatedQuantity)).toString();
        bal.updatedAt = new Date().toISOString();
      }
    }

    const moveId = `move_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const movement: InventoryMovement = {
      id: moveId,
      organizationId: orgId,
      movementType: params.movementType,
      itemId: item.id,
      itemCode: item.itemCode,
      lotId: params.lotId,
      fromLocationId: params.fromLocationId,
      toLocationId: params.toLocationId,
      quantity: moveQty.toString(),
      unitCostCents: params.unitCostCents ?? item.standardCostCents,
      jobId: params.jobId,
      travelerId: params.travelerId,
      actorUserId: session.user.id,
      reason: params.reason,
      idempotencyKey: params.idempotencyKey,
      occurredAt: now,
      createdAt: now,
    };

    this.movements.set(moveId, movement);
    return movement;
  }

  receiveMaterial(
    session: SessionContext,
    params: {
      itemId: string;
      quantity: number | string;
      lotNumber?: string;
      toLocationId?: string;
      unitCost?: number;
      idempotencyKey?: string;
    }
  ): InventoryMovement {
    const locId = params.toLocationId || "LOC-DEFAULT";
    return this.postMovement(session, {
      movementType: "receive",
      itemId: params.itemId,
      toLocationId: locId,
      quantity: params.quantity,
      unitCostCents: params.unitCost ? Math.round(params.unitCost * 100) : undefined,
      idempotencyKey: params.idempotencyKey,
    });
  }

  issueToJob(
    session: SessionContext,
    params: {
      itemId: string;
      jobId?: string;
      jobNumber?: string;
      quantity: number | string;
      fromLocationId?: string;
      reason?: string;
    }
  ): InventoryMovement {
    const locId = params.fromLocationId || "LOC-DEFAULT";
    return this.postMovement(session, {
      movementType: "issue_to_job",
      itemId: params.itemId,
      jobId: params.jobId,
      fromLocationId: locId,
      quantity: params.quantity,
      reason: params.reason || (params.jobNumber ? `Issued to ${params.jobNumber}` : undefined),
    });
  }

  getItemStockSummary(session: SessionContext, itemId: string): { totalOnHand: number; totalValuation: number } {
    const item = this.getItem(session, itemId);
    const balances = this.getItemBalances(session, item.id);
    let onHand = 0;
    for (const b of balances) {
      onHand += parseFloat(b.onHandQuantity);
    }
    return {
      totalOnHand: onHand,
      totalValuation: (onHand * item.standardCostCents) / 100,
    };
  }

  adjustCycleCount(
    session: SessionContext,
    params: {
      itemId: string;
      countedQuantity: number | string;
      varianceReason: string;
      locationId?: string;
    }
  ): InventoryCycleCount {
    const result = this.recordCycleCount(session, {
      itemId: params.itemId,
      locationId: params.locationId || "LOC-DEFAULT",
      observedQuantity: String(params.countedQuantity),
      reason: params.varianceReason,
    });
    return result.cycleCount;
  }

  recordCycleCount(
    session: SessionContext,
    params: {
      itemId: string;
      locationId: string;
      lotId?: string;
      observedQuantity: string | number;
      reason: string;
    }
  ): { cycleCount: InventoryCycleCount; adjustmentMovement?: InventoryMovement } {
    authorizationService.requireCapability(session, "inventory:adjust_count");
    const orgId = session.activeOrganization.id;
    const item = this.getItem(session, params.itemId);
    const observedQty = Quantity.fromString(String(params.observedQuantity));

    if (observedQty.isNegative()) {
      throw new InvalidMovementError("Observed cycle count quantity cannot be negative.");
    }

    const balKey = `${orgId}:${item.id}:${params.locationId}:${params.lotId || "none"}`;
    const bal = this.balances.get(balKey);
    const expectedQty = bal ? Quantity.fromString(bal.onHandQuantity) : Quantity.zero();
    const varianceQty = observedQty.subtract(expectedQty);

    let resultingMoveId: string | undefined;
    let createdMove: InventoryMovement | undefined;

    if (!varianceQty.isZero()) {
      const isAddition = varianceQty.isPositive();
      const adjQty = isAddition ? varianceQty : expectedQty.subtract(observedQty);

      createdMove = this.postMovement(session, {
        movementType: "cycle_count_adjustment",
        itemId: item.id,
        lotId: params.lotId,
        fromLocationId: isAddition ? undefined : params.locationId,
        toLocationId: isAddition ? params.locationId : undefined,
        quantity: adjQty.toString(),
        reason: `Cycle Count Adjustment: ${params.reason}`,
      });
      resultingMoveId = createdMove.id;
    }

    const countId = `count_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const cc: InventoryCycleCount = {
      id: countId,
      organizationId: orgId,
      itemId: item.id,
      itemCode: item.itemCode,
      locationId: params.locationId,
      locationCode: params.locationId,
      expectedQuantity: expectedQty.toString(),
      observedQuantity: observedQty.toString(),
      varianceQuantity: varianceQty.toString(),
      reason: params.reason,
      countedByUserId: session.user.id,
      resultingMovementId: resultingMoveId,
      countedAt: now,
      createdAt: now,
    };

    this.cycleCounts.set(countId, cc);
    return { cycleCount: cc, adjustmentMovement: createdMove };
  }

  listMovements(
    session: SessionContext,
    itemId?: string,
    options?: { limit?: number; offset?: number }
  ): InventoryMovement[] {
    authorizationService.requireCapability(session, "inventory:view_stock");
    const orgId = session.activeOrganization.id;
    const list: InventoryMovement[] = [];

    for (const m of this.movements.values()) {
      if (m.organizationId !== orgId) continue;
      if (itemId && m.itemId !== itemId) continue;
      list.push(m);
    }

    list.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    return list.slice(offset, offset + limit);
  }

  getItemBalances(session: SessionContext, itemId: string): InventoryItemBalance[] {
    authorizationService.requireCapability(session, "inventory:view_stock");
    const orgId = session.activeOrganization.id;
    const list: InventoryItemBalance[] = [];

    for (const b of this.balances.values()) {
      if (b.organizationId === orgId && b.itemId === itemId) {
        list.push(b);
      }
    }
    return list;
  }
}

export const inventoryService = new InventoryService();
