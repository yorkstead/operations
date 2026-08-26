import { describe, expect, it, beforeEach } from "bun:test";
import { PackagingService } from "../modules/packaging/application/packaging-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Packaging & Palletization Module", () => {
  let packagingService: PackagingService;
  let identityService: IdentityService;

  beforeEach(() => {
    packagingService = new PackagingService();
    identityService = new IdentityService();
  });

  it("creates a container, packs items, and verifies gross weight math", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const box = packagingService.createPackagingUnit(session, {
      containerType: "box",
      maxCapacityLbs: 50.0,
      tareWeightLbs: 2.0,
    });

    expect(box.packageNumber).toContain("PKG-");
    expect(box.grossWeightLbs).toBe(2.0); // tare weight

    // Pack 20 parts (1.5 lbs each = 30 lbs net)
    const packed = packagingService.packItem(session, box.packageNumber, {
      jobId: "job_104",
      jobNumber: "JOB-2026-104",
      partDescription: "Flanges",
      quantity: 20,
      unitWeightLbs: 1.5,
    });

    expect(packed.items.length).toBe(1);
    expect(packed.netWeightLbs).toBe(30.0);
    expect(packed.grossWeightLbs).toBe(32.0); // 30 + 2
    expect(packed.status).toBe("in_pack");
  });

  it("enforces container weight capacity constraint guardrail", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const smallBox = packagingService.createPackagingUnit(session, {
      containerType: "box",
      maxCapacityLbs: 25.0,
      tareWeightLbs: 2.0,
    });

    // Attempting to pack 20 parts at 2 lbs each = 40 lbs -> exceeds 25 lbs max
    expect(() => {
      packagingService.packItem(session, smallBox.packageNumber, {
        jobId: "job_105",
        jobNumber: "JOB-2026-105",
        partDescription: "Heavy Plates",
        quantity: 20,
        unitWeightLbs: 2.0,
      });
    }).toThrow("Capacity Violation");
  });

  it("seals container, updates status to ready for shipping, and derives metrics", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const pallet = packagingService.createPackagingUnit(session, {
      containerType: "pallet",
      maxCapacityLbs: 2000.0,
      tareWeightLbs: 40.0,
    });

    packagingService.packItem(session, pallet.packageNumber, {
      jobId: "job_106",
      jobNumber: "JOB-2026-106",
      partDescription: "Structural Angles",
      quantity: 50,
      unitWeightLbs: 10.0,
    });

    const sealed = packagingService.sealPackagingUnit(session, pallet.packageNumber);
    expect(sealed.status).toBe("sealed_ready_for_shipping");
    expect(sealed.sealedByUserId).toBe(owner.id);

    const metrics = packagingService.getPackagingMetrics(session);
    expect(metrics.readyForShipmentCount).toBeGreaterThan(0);
    expect(metrics.totalWeightPackedLbs).toBeGreaterThan(0);
  });
});
