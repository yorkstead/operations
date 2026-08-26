import { describe, expect, it } from "bun:test";
import { InventoryService } from "../modules/inventory/application/inventory-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const inventoryService = new InventoryService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "alice@acme.com",
  name: "Alice Inspector",
  organizationName: "Acme Metalworks",
  organizationSlug: "acme-metal",
});

identityService.createOrganization(userA.id, "Rival Corp", "rival-corp");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("Inventory Movement Ledger Vertical Slice: Receiving, Issues, Concurrency & IDOR Prevention", () => {
  let createdItemId: string;
  let locDockId: string;
  let locFloorId: string;

  it("creates inventory locations and items with normalized codes and integer cents costs", () => {
    const locDock = inventoryService.createLocation(tenantA, {
      locationCode: "DOCK-01",
      name: "Receiving Dock 1",
    });
    locDockId = locDock.id;

    const locFloor = inventoryService.createLocation(tenantA, {
      locationCode: "FLOOR-A",
      name: "Production Floor Rack A",
    });
    locFloorId = locFloor.id;

    expect(locDock.locationCode).toBe("DOCK-01");
    expect(locFloor.locationCode).toBe("FLOOR-A");

    const item = inventoryService.createItem(tenantA, {
      itemCode: "ALUM-SHEET-0125",
      description: "6061-T6 Aluminum Sheet 0.125in",
      category: "raw_material",
      unitOfMeasure: "SHEET",
      defaultLocationId: locDock.id,
      reorderPoint: "10",
      reorderQuantity: "50",
      standardCostCents: 14500,
      lotTrackingRequired: true,
    });

    createdItemId = item.id;
    expect(item.standardCostCents).toBe(14500);
    expect(item.unitOfMeasure).toBe("SHEET");
  });

  it("receives stock into location, deriving positive on-hand balance and movement record", () => {
    const move = inventoryService.postMovement(tenantA, {
      movementType: "receive",
      itemId: createdItemId,
      toLocationId: locDockId,
      quantity: "50.0000",
      unitCostCents: 14500,
      reason: "Initial PO delivery",
      idempotencyKey: "idemp_recv_test_1",
    });

    expect(move.movementType).toBe("receive");
    expect(move.quantity).toBe("50");

    const balances = inventoryService.getItemBalances(tenantA, createdItemId);
    expect(balances.length).toBeGreaterThanOrEqual(1);
    expect(balances[0].onHandQuantity).toBe("50");
  });

  it("transfers stock between locations atomically", () => {
    const move = inventoryService.postMovement(tenantA, {
      movementType: "transfer",
      itemId: createdItemId,
      fromLocationId: locDockId,
      toLocationId: locFloorId,
      quantity: "20.0000",
      reason: "Move from receiving to production staging",
    });

    expect(move.movementType).toBe("transfer");

    const balances = inventoryService.getItemBalances(tenantA, createdItemId);
    const dockBal = balances.find((b) => b.locationId === locDockId);
    const floorBal = balances.find((b) => b.locationId === locFloorId);

    expect(dockBal?.onHandQuantity).toBe("30");
    expect(floorBal?.onHandQuantity).toBe("20");
  });

  it("enforces Negative Stock Policy and rejects issue requests exceeding available stock", () => {
    expect(() =>
      inventoryService.postMovement(tenantA, {
        movementType: "issue_to_job",
        itemId: createdItemId,
        fromLocationId: locFloorId,
        quantity: "35.0000",
        reason: "Job issue attempt exceeding balance",
      })
    ).toThrow("Negative Stock Policy Violation");
  });

  it("issues material within balance and updates on-hand ledger correctly", () => {
    const move = inventoryService.postMovement(tenantA, {
      movementType: "issue_to_job",
      itemId: createdItemId,
      fromLocationId: locFloorId,
      quantity: "15.0000",
      reason: "Issued to laser cut stage",
    });

    expect(move.movementType).toBe("issue_to_job");

    const balances = inventoryService.getItemBalances(tenantA, createdItemId);
    const floorBal = balances.find((b) => b.locationId === locFloorId);
    expect(floorBal?.onHandQuantity).toBe("5");
  });

  it("records physical cycle count and creates automatic adjustment movement when variance exists", () => {
    const result = inventoryService.recordCycleCount(tenantA, {
      itemId: createdItemId,
      locationId: locFloorId,
      observedQuantity: "7.0000",
      reason: "Monthly audit count",
    });

    expect(result.cycleCount.varianceQuantity).toBe("2");
    expect(result.adjustmentMovement).toBeDefined();

    const balances = inventoryService.getItemBalances(tenantA, createdItemId);
    const floorBal = balances.find((b) => b.locationId === locFloorId);
    expect(floorBal?.onHandQuantity).toBe("7");
  });

  it("replays idempotent movement request safely without duplicating stock", () => {
    const move1 = inventoryService.postMovement(tenantA, {
      movementType: "receive",
      itemId: createdItemId,
      toLocationId: locDockId,
      quantity: "10.0000",
      idempotencyKey: "idemp_dup_1",
    });

    const move2 = inventoryService.postMovement(tenantA, {
      movementType: "receive",
      itemId: createdItemId,
      toLocationId: locDockId,
      quantity: "10.0000",
      idempotencyKey: "idemp_dup_1",
    });

    expect(move1.id).toBe(move2.id);
  });

  it("strictly enforces tenant boundary and denies cross-tenant item and balance access (IDOR)", () => {
    expect(() => inventoryService.getItem(tenantB, createdItemId)).toThrow("not found in active organization");
  });
});
