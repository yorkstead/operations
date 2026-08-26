import { describe, expect, it, beforeEach } from "bun:test";
import { ShopfloorService } from "../modules/shopfloor/application/shopfloor-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("ShopFloor & Digital Traveler Module", () => {
  let shopfloorService: ShopfloorService;
  let identityService: IdentityService;

  beforeEach(() => {
    shopfloorService = new ShopfloorService();
    identityService = new IdentityService();
  });

  it("creates a digital traveler and executes ordered operations", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const traveler = shopfloorService.createTraveler(session, {
      jobId: "job_101",
      jobNumber: "JOB-2026-104",
      partDescription: "Mounting Flanges",
      customerName: "Alpine Aerospace",
      totalQuantity: 100,
      targetDueDate: "2026-09-02",
      operations: [
        { sequence: 10, workCenterCode: "WC-LASER-01", workCenterName: "Laser Cutting", operationName: "Profile Cut" },
        { sequence: 20, workCenterCode: "WC-BRAKE-01", workCenterName: "Press Brake", operationName: "Form 90 Deg" },
      ],
    });

    expect(traveler.id).toBeDefined();
    expect(traveler.travelerNumber).toBe("TRV-2026-104");
    expect(traveler.operations.length).toBe(2);

    // Start Step 10
    const step1 = traveler.operations[0];
    const started = shopfloorService.startOperation(session, traveler.id, step1.id);
    expect(started.operations[0].status).toBe("running");
    expect(started.status).toBe("active");

    // Complete Step 10
    const completed = shopfloorService.completeOperation(session, traveler.id, step1.id, {
      completedQuantity: 98,
      scrappedQuantity: 2,
      laborMinutes: 35,
    });

    expect(completed.operations[0].status).toBe("completed");
    expect(completed.operations[0].completedQuantity).toBe(98);
    expect(completed.currentStepIndex).toBe(1); // advanced to step 20
  });

  it("handles blocker reporting and QR-tag resolution", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const traveler = shopfloorService.createTraveler(session, {
      jobId: "job_102",
      jobNumber: "JOB-2026-105",
      partDescription: "Brackets",
      customerName: "Summit Glass",
      totalQuantity: 50,
      targetDueDate: "2026-09-03",
      operations: [
        { sequence: 10, workCenterCode: "WC-BRAKE-01", workCenterName: "Press Brake", operationName: "Form 90 Deg" },
      ],
    });

    // Report blocker
    const step1 = traveler.operations[0];
    const blocked = shopfloorService.reportBlocker(session, traveler.id, step1.id, "Tooling worn, waiting for punch die.");
    expect(blocked.operations[0].status).toBe("blocked");
    expect(blocked.operations[0].blockerReason).toContain("Tooling worn");
    expect(blocked.status).toBe("on_hold");

    // QR Lookup
    const lookedUp = shopfloorService.getTravelerByQr(session, "yorkstead://traveler/TRV-2026-105");
    expect(lookedUp.id).toBe(traveler.id);
  });
});
