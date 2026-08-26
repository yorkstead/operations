import { describe, expect, it, beforeEach } from "bun:test";
import { InventoryService } from "../modules/inventory/application/inventory-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Inventory & Material Ledger Module", () => {
  let inventoryService: InventoryService;
  let identityService: IdentityService;

  beforeEach(() => {
    inventoryService = new InventoryService();
    identityService = new IdentityService();
  });

  it("calculates stock balances exclusively from immutable ledger transactions", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const item = inventoryService.createItem(session, {
      itemCode: "ALUM-6061-0.25",
      description: "6061 Aluminum Sheet",
      category: "raw_material",
      unitOfMeasure: "SHEET",
      defaultLocationCode: "RACK-1",
      reorderPoint: 5,
      reorderQuantity: 20,
      standardCost: 150.0,
    });

    // Initial stock is zero
    const initial = inventoryService.getItemStockSummary(session, item.id);
    expect(initial.totalOnHand).toBe(0);

    // Receive +25 sheets
    inventoryService.receiveMaterial(session, {
      itemId: item.id,
      quantity: 25,
      lotNumber: "LOT-2026-A1",
    });

    const afterReceive = inventoryService.getItemStockSummary(session, item.id);
    expect(afterReceive.totalOnHand).toBe(25);
    expect(afterReceive.totalValuation).toBe(25 * 150.0);

    // Issue 10 sheets to a job
    inventoryService.issueToJob(session, {
      itemId: item.id,
      jobId: "job_101",
      jobNumber: "JOB-2026-101",
      quantity: 10,
    });

    const afterIssue = inventoryService.getItemStockSummary(session, item.id);
    expect(afterIssue.totalOnHand).toBe(15);
  });

  it("enforces Negative Stock Policy and rejects overdraft issues", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const item = inventoryService.createItem(session, {
      itemCode: "STEEL-PLATE-10GA",
      description: "10GA Steel Plate",
      category: "raw_material",
      unitOfMeasure: "SHEET",
      defaultLocationCode: "RACK-2",
      reorderPoint: 10,
      reorderQuantity: 30,
      standardCost: 80.0,
    });

    inventoryService.receiveMaterial(session, {
      itemId: item.id,
      quantity: 5,
    });

    // Attempting to issue 10 sheets when only 5 exist must throw Negative Stock Policy violation
    expect(() => {
      inventoryService.issueToJob(session, {
        itemId: item.id,
        jobId: "job_102",
        jobNumber: "JOB-2026-102",
        quantity: 10,
      });
    }).toThrow("Negative Stock Policy Violation");
  });

  it("handles cycle count adjustment and idempotency keys", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const item = inventoryService.createItem(session, {
      itemCode: "FAST-M8-BOLT",
      description: "M8 Flange Bolt",
      category: "hardware",
      unitOfMeasure: "EA",
      defaultLocationCode: "BIN-1",
      reorderPoint: 50,
      reorderQuantity: 500,
      standardCost: 0.5,
    });

    // Idempotent receive
    const tx1 = inventoryService.receiveMaterial(session, {
      itemId: item.id,
      quantity: 100,
      idempotencyKey: "po_123_line_1",
    });

    const tx2 = inventoryService.receiveMaterial(session, {
      itemId: item.id,
      quantity: 100,
      idempotencyKey: "po_123_line_1",
    });

    expect(tx1.id).toBe(tx2.id);
    expect(inventoryService.getItemStockSummary(session, item.id).totalOnHand).toBe(100);

    // Physical cycle count found 95
    inventoryService.adjustCycleCount(session, {
      itemId: item.id,
      countedQuantity: 95,
      varianceReason: "Physical count variance during weekly audit.",
    });

    expect(inventoryService.getItemStockSummary(session, item.id).totalOnHand).toBe(95);
  });
});
