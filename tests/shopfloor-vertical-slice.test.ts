import { describe, expect, it } from "bun:test";
import { ShopfloorService } from "../modules/shopfloor/application/shopfloor-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("ShopFloor Vertical Slice: Station Execution, Routing & IDOR Prevention", () => {
  it("dispatches digital traveler, runs sequential station execution, logs blocker and completes operations", () => {
    const identity = new IdentityService();
    const service = new ShopfloorService();

    const bootstrap = identity.bootstrapOwner({
      email: "shopfloor@yorkstead.com",
      name: "Shop Supervisor",
      organizationName: "Precision Manufacturing LLC",
      organizationSlug: "precision-mfg",
    });
    const session = identity.getSessionContext(bootstrap.user.id);

    // 1. Dispatch Traveler
    const traveler = service.createTraveler(session, {
      jobId: "job_test_101",
      jobNumber: "JOB-2026-101",
      partDescription: "Laser Cut Enclosure Base",
      customerName: "Frontier Precision",
      totalQuantity: 100,
      targetDueDate: "2026-09-15",
      operations: [
        { sequence: 10, workCenterCode: "WC-LASER-01", workCenterName: "Laser Cutting Bay", operationName: "Laser Contour Cut" },
        { sequence: 20, workCenterCode: "WC-BRAKE-01", workCenterName: "CNC Press Brake", operationName: "Form Return Flanges" },
      ],
    });

    expect(traveler.travelerNumber).toBe("TRV-2026-101");
    expect(traveler.status).toBe("queued");
    expect(traveler.operations.length).toBe(2);

    const op1 = traveler.operations[0];

    // 2. Start Station Operation
    const activeTraveler = service.startOperation(session, traveler.id, op1.id);
    expect(activeTraveler.status).toBe("active");
    expect(activeTraveler.operations[0].status).toBe("running");

    // 3. Report Blocker on Operation
    const blockedTraveler = service.reportBlocker(session, traveler.id, op1.id, "Optical lens alignment drift");
    expect(blockedTraveler.status).toBe("on_hold");
    expect(blockedTraveler.operations[0].status).toBe("blocked");
    expect(blockedTraveler.operations[0].blockerReason).toContain("alignment drift");

    // 4. Complete Operation
    const completedTraveler = service.completeOperation(session, traveler.id, op1.id, {
      completedQuantity: 100,
      scrappedQuantity: 0,
      laborMinutes: 25,
    });
    expect(completedTraveler.operations[0].status).toBe("completed");
    expect(completedTraveler.currentStepIndex).toBe(1);
  });

  it("strictly enforces tenant boundary and denies cross-tenant traveler lookups", () => {
    const identity = new IdentityService();
    const service = new ShopfloorService();

    const bootstrap1 = identity.bootstrapOwner({
      email: "owner1@shop1.com",
      name: "Owner 1",
      organizationName: "Shop Alpha",
      organizationSlug: "shop-alpha",
    });
    const session1 = identity.getSessionContext(bootstrap1.user.id);

    const org2 = identity.createOrganization(bootstrap1.user.id, "Shop Beta", "shop-beta");
    const session2 = identity.switchActiveOrganization(bootstrap1.user.id, org2.id);

    const travelerOrg1 = service.createTraveler(session1, {
      jobId: "job_alpha_1",
      jobNumber: "JOB-2026-888",
      partDescription: "Alpha Confidential Bracket",
      customerName: "Defense Prime",
      totalQuantity: 50,
      targetDueDate: "2026-09-30",
      operations: [
        { sequence: 10, workCenterCode: "WC-LASER-01", workCenterName: "Laser", operationName: "Cut" },
      ],
    });

    // Org 1 can retrieve via QR
    const found = service.getTravelerByQr(session1, travelerOrg1.travelerNumber);
    expect(found.id).toBe(travelerOrg1.id);

    // Org 2 is denied access to Org 1's traveler
    expect(() => service.getTravelerByQr(session2, travelerOrg1.travelerNumber)).toThrow("No traveler found matching scan");
  });
});
