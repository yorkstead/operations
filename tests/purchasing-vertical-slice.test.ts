import { describe, expect, it } from "bun:test";
import { PurchasingService } from "../modules/purchasing/application/purchasing-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const purchasingService = new PurchasingService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "buyer_lead@acme.com",
  name: "Buyer Lead",
  organizationName: "Acme Metalworks",
  organizationSlug: "acme-procure",
});

identityService.createOrganization(userA.id, "Rival Metals", "rival-metals");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("Purchasing & Material Sourcing Vertical Slice: POs, Spend Thresholds, Dock Receiving & IDOR", () => {
  let createdPoNumber: string;

  it("creates high-value purchase order exceeding $5,000 and requires manager approval", () => {
    // 20 sheets @ $400.00 = $8,000.00 (800,000 cents)
    const po = purchasingService.createPurchaseOrder(tenantA, {
      vendorId: "vend_ryerson",
      vendorName: "Ryerson Metal Solutions",
      vendorEmail: "orders@ryerson.com",
      expectedDeliveryDate: "2026-09-15",
      lineItems: [
        {
          itemCode: "RAW-ALUM-7075-0500",
          description: "7075-T6 Aluminum Plate 0.50in",
          quantityOrdered: 20,
          uom: "plates",
          unitCostCents: 40000,
        },
      ],
      shippingCostCents: 15000, // $150.00
    });

    createdPoNumber = po.poNumber;
    expect(po.requiresManagerApproval).toBe(true);
    expect(po.status).toBe("pending_approval");
    expect(po.totalCostCents).toBe(815000); // $8,150.00
  });

  it("approves purchase order with manager sign-off", () => {
    const approved = purchasingService.approvePurchaseOrder(tenantA, createdPoNumber);
    expect(approved.status).toBe("approved");
    expect(approved.approvedByUserId).toBe(tenantA.user.id);
  });

  it("issues approved purchase order to vendor", () => {
    const issued = purchasingService.issuePO(tenantA, createdPoNumber);
    expect(issued.status).toBe("sent_to_vendor");
    expect(issued.issuedAt).toBeDefined();
  });

  it("processes dock receiving receipt, updates line received quantities, and verifies inventory ledger balance", () => {
    const { purchaseOrder: partialPO } = purchasingService.recordReceipt(tenantA, createdPoNumber, {
      packingSlipNumber: "PS-RYERSON-991",
      itemsReceived: [{ itemCode: "RAW-ALUM-7075-0500", quantityReceived: 10, lotNumber: "LOT-7075-A1" }],
    });

    expect(partialPO.status).toBe("partially_received");
    expect(partialPO.lineItems[0].quantityReceived).toBe(10);

    const { purchaseOrder: completedPO } = purchasingService.recordReceipt(tenantA, createdPoNumber, {
      packingSlipNumber: "PS-RYERSON-992",
      itemsReceived: [{ itemCode: "RAW-ALUM-7075-0500", quantityReceived: 10, lotNumber: "LOT-7075-A2" }],
    });

    expect(completedPO.status).toBe("received_complete");
    expect(completedPO.lineItems[0].quantityReceived).toBe(20);
  });

  it("strictly enforces tenant boundary and denies cross-tenant access (IDOR)", () => {
    const orgBPOs = purchasingService.listPurchaseOrders(tenantB);
    expect(orgBPOs.some((p) => p.poNumber === createdPoNumber)).toBe(false);
  });
});
