import { describe, expect, it } from "bun:test";
import { PackagingService } from "../modules/packaging/application/packaging-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const packagingService = new PackagingService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "pack_lead@acme.com",
  name: "Packaging Lead",
  organizationName: "Acme Packaging",
  organizationSlug: "acme-packaging",
});

identityService.createOrganization(userA.id, "Rival Pack", "rival-pack");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("Packaging & Palletization Vertical Slice: Units, Capacity Guardrails, Sealing & IDOR", () => {
  let createdPackageNumber: string;

  it("creates a box container unit with initial tare weight", () => {
    const box = packagingService.createPackagingUnit(tenantA, {
      containerType: "box",
      maxCapacityLbs: 60.0,
      tareWeightLbs: 2.5,
    });

    createdPackageNumber = box.packageNumber;
    expect(box.packageNumber).toContain("PKG-");
    expect(box.grossWeightLbs).toBe(2.5);
    expect(box.status).toBe("in_pack");
  });

  it("packs items into container and computes net/gross weight rollups", () => {
    const packed = packagingService.packItem(tenantA, createdPackageNumber, {
      jobId: "job_104",
      jobNumber: "JOB-2026-104",
      partDescription: "Precision Flanges",
      quantity: 20,
      unitWeightLbs: 1.5,
    });

    expect(packed.items.length).toBe(1);
    expect(packed.netWeightLbs).toBe(30.0);
    expect(packed.grossWeightLbs).toBe(32.5); // 30 + 2.5
  });

  it("enforces container weight capacity constraint guardrail and rejects overloads", () => {
    // Current gross: 32.5 lbs, Max: 60.0 lbs -> adding 30 parts @ 1.5 lbs = 45 lbs -> total 77.5 lbs (> 60 lbs)
    expect(() => {
      packagingService.packItem(tenantA, createdPackageNumber, {
        jobId: "job_104",
        jobNumber: "JOB-2026-104",
        partDescription: "Additional Flanges",
        quantity: 30,
        unitWeightLbs: 1.5,
      });
    }).toThrow("Capacity Violation");
  });

  it("seals container, updates status to ready for shipping, and records operator attribution", () => {
    const sealed = packagingService.sealPackagingUnit(tenantA, createdPackageNumber);
    expect(sealed.status).toBe("sealed_ready_for_shipping");
    expect(sealed.sealedByUserId).toBe(tenantA.user.id);
    expect(sealed.sealedAt).toBeDefined();
    expect(sealed.labelBarcode).toContain("yorkstead://package/");
  });

  it("strictly enforces tenant boundary and denies cross-tenant container lookups (IDOR)", () => {
    const orgBPackages = packagingService.listPackages(tenantB);
    expect(orgBPackages.some((p) => p.packageNumber === createdPackageNumber)).toBe(false);
  });
});
