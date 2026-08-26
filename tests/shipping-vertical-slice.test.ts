import { describe, expect, it } from "bun:test";
import { ShippingService } from "../modules/shipping/application/shipping-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const shippingService = new ShippingService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "dispatch_lead@acme.com",
  name: "Dispatch Lead",
  organizationName: "Acme Logistics",
  organizationSlug: "acme-logistics",
});

identityService.createOrganization(userA.id, "Rival Hauling", "rival-hauling");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("Shipping & Outbound Logistics Vertical Slice: BOLs, Package Staging, Dispatch & IDOR", () => {
  let createdManifestNumber: string;

  it("creates a draft shipping manifest (Bill of Lading) with multi-stop destination", () => {
    const manifest = shippingService.createManifest(tenantA, {
      carrierType: "dedicated_flatbed",
      carrierName: "Rocky Mountain Express",
      trackingOrProNumber: "RME-99120",
      stops: [
        {
          stopSequence: 1,
          destinationCustomerName: "Summit Facades & Glazing",
          destinationAddress: "1200 Brighton Blvd, Denver, CO 80216",
          packageNumbers: ["PKG-2026-101"],
          contactPerson: "Dave Reynolds",
          contactPhone: "303-555-0199",
        },
      ],
    });

    createdManifestNumber = manifest.manifestNumber;
    expect(manifest.manifestNumber).toContain("BOL-");
    expect(manifest.status).toBe("draft_manifest");
    expect(manifest.stops.length).toBe(1);
  });

  it("assigns sealed packages onto manifest, sets status to staged_for_loading, and calculates gross weight", () => {
    const assigned = shippingService.assignPackages(tenantA, createdManifestNumber, ["PKG-2026-101"]);
    expect(assigned.status).toBe("staged_for_loading");
    expect(assigned.packageNumbers).toContain("PKG-2026-101");
    expect(assigned.totalGrossWeightLbs).toBeGreaterThan(0);
  });

  it("dispatches shipment and timestamps driver attribution", () => {
    const dispatched = shippingService.dispatchShipment(tenantA, createdManifestNumber, {
      driverName: "Sarah Jenkins",
      trailerOrPlateNumber: "TR-53-CO-9921",
    });

    expect(dispatched.status).toBe("dispatched_in_transit");
    expect(dispatched.driverName).toBe("Sarah Jenkins");
    expect(dispatched.dispatchedAt).toBeDefined();
  });

  it("confirms proof-of-delivery (POD) with digital recipient sign-off", () => {
    const delivered = shippingService.confirmDelivery(tenantA, createdManifestNumber, 1, "Dave Reynolds (Receiving Lead)");
    expect(delivered.status).toBe("delivered");
    expect(delivered.stops[0].status).toBe("delivered");
    expect(delivered.stops[0].signedBy).toContain("Dave Reynolds");
    expect(delivered.deliveredAt).toBeDefined();
  });

  it("strictly enforces tenant boundary and denies cross-tenant manifest lookups (IDOR)", () => {
    const orgBManifests = shippingService.listManifests(tenantB);
    expect(orgBManifests.some((m) => m.manifestNumber === createdManifestNumber)).toBe(false);
  });
});
