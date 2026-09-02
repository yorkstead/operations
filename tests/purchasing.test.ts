import { describe, expect, it, beforeEach } from "bun:test";
import { PurchasingService } from "../modules/purchasing/application/purchasing-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Purchasing & Material Sourcing Module", () => {
  let purchasingService: PurchasingService;
  let identityService: IdentityService;

  beforeEach(() => {
    purchasingService = new PurchasingService();
    identityService = new IdentityService();
  });

  it("creates a purchase order, computes cost breakdown in integer cents, and evaluates spend thresholds", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const po = purchasingService.createPurchaseOrder(session, {
      vendorId: "vend_1",
      vendorName: "Ryerson Metals",
      vendorEmail: "orders@ryerson.com",
      expectedDeliveryDate: "2026-09-01",
      lineItems: [
        {
          itemCode: "RAW-SS-304-0250",
          description: "304 SS Sheet",
          quantityOrdered: 5,
          uom: "sheets",
          unitCostCents: 40000, // $400.00
        },
      ],
      shippingCostCents: 10000, // $100.00
    });

    expect(po.poNumber).toContain("PO-");
    expect(po.subtotalCostCents).toBe(200000); // 5 * 40000
    expect(po.totalCostCents).toBe(210000); // 200000 + 10000
    expect(po.status).toBe("draft"); // Under $5,000 threshold
  });

  it("enforces spend approval threshold governance (> $5,000 requires manager approval)", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    // Large order: 20 sheets @ $400 = $8,000 -> exceeds $5,000 threshold
    const largePO = purchasingService.createPurchaseOrder(session, {
      vendorId: "vend_1",
      vendorName: "Ryerson Metals",
      vendorEmail: "orders@ryerson.com",
      expectedDeliveryDate: "2026-09-01",
      lineItems: [
        {
          itemCode: "RAW-SS-304-0250",
          description: "304 SS Sheet",
          quantityOrdered: 20,
          uom: "sheets",
          unitCostCents: 40000,
        },
      ],
    });

    expect(largePO.requiresManagerApproval).toBe(true);
    expect(largePO.status).toBe("pending_approval");

    // Approve
    const approved = purchasingService.approvePurchaseOrder(session, largePO.poNumber);
    expect(approved.status).toBe("approved");
    expect(approved.approvedByUserId).toBe(owner.id);
  });

  it("processes dock receiving receipts and updates inventory ledger balances", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const po = purchasingService.createPurchaseOrder(session, {
      vendorId: "vend_1",
      vendorName: "Ryerson Metals",
      vendorEmail: "orders@ryerson.com",
      expectedDeliveryDate: "2026-09-01",
      lineItems: [
        {
          itemCode: "RAW-ALUM-6061-0500",
          description: "6061 Aluminum Plate",
          quantityOrdered: 10,
          uom: "plates",
          unitCostCents: 15000,
        },
      ],
    });

    purchasingService.issuePO(session, po.poNumber);

    // Partial receipt of 4 plates
    const { purchaseOrder: partialPO } = purchasingService.recordReceipt(session, po.poNumber, {
      packingSlipNumber: "PS-88129",
      itemsReceived: [{ itemCode: "RAW-ALUM-6061-0500", quantityReceived: 4, lotNumber: "LOT-AL-01" }],
    });

    expect(partialPO.status).toBe("partially_received");
    expect(partialPO.lineItems[0].quantityReceived).toBe(4);

    // Final receipt of remaining 6 plates
    const { purchaseOrder: completePO } = purchasingService.recordReceipt(session, po.poNumber, {
      packingSlipNumber: "PS-88135",
      itemsReceived: [{ itemCode: "RAW-ALUM-6061-0500", quantityReceived: 6, lotNumber: "LOT-AL-02" }],
    });

    expect(completePO.status).toBe("received_complete");
    expect(completePO.lineItems[0].quantityReceived).toBe(10);
  });
  it("denies high-value PO approval to roles lacking purchasing:approve_po (operator denied, owner allowed)", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@factory.com",
      name: "Owner",
      organizationName: "Factory B",
      organizationSlug: "factory-b",
    });

    const ownerSession = identityService.getSessionContext(owner.id);

    // Simulate an operator session: same tenant, same org, role = operator.
    // Operators do not hold purchasing:approve_po.
    const operatorSession = {
      ...ownerSession,
      currentMembership: { ...ownerSession.currentMembership, role: "operator" as const },
    };

    // High-value PO: 20 sheets @ $400 = $8,000 (exceeds $5,000 threshold)
    const po = purchasingService.createPurchaseOrder(ownerSession, {
      vendorId: "vend_1",
      vendorName: "Ryerson Metals",
      vendorEmail: "orders@ryerson.com",
      expectedDeliveryDate: "2026-10-01",
      lineItems: [
        {
          itemCode: "RAW-SS-304-0250",
          description: "304 SS Sheet",
          quantityOrdered: 20,
          uom: "sheets",
          unitCostCents: 40000,
        },
      ],
    });

    expect(po.requiresManagerApproval).toBe(true);
    expect(po.status).toBe("pending_approval");

    // Operator must be denied — they lack purchasing:approve_po
    expect(() => {
      purchasingService.approvePurchaseOrder(operatorSession, po.poNumber);
    }).toThrow();

    // Owner must succeed — they hold purchasing:approve_po
    const approved = purchasingService.approvePurchaseOrder(ownerSession, po.poNumber);
    expect(approved.status).toBe("approved");
    expect(approved.approvedByUserId).toBe(owner.id);
  });
});
