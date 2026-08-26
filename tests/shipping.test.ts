import { describe, expect, it, beforeEach } from "bun:test";
import { ShippingService } from "../modules/shipping/application/shipping-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Shipping & Load Builder Module", () => {
  let shippingService: ShippingService;
  let identityService: IdentityService;

  beforeEach(() => {
    shippingService = new ShippingService();
    identityService = new IdentityService();
  });

  it("creates a shipping manifest, validates sealed packages, and calculates gross weight", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    // Create a manifest
    const manifest = shippingService.createManifest(session, {
      carrierType: "ltl_freight",
      carrierName: "Old Dominion Freight",
      trackingOrProNumber: "PRO-88124",
      stops: [
        {
          stopSequence: 1,
          destinationCustomerName: "Alpine Aerospace",
          destinationAddress: "7420 Innovation Way",
          packageNumbers: ["PKG-2026-081"],
        },
      ],
    });

    expect(manifest.id).toBeDefined();
    expect(manifest.manifestNumber).toContain("BOL-");
    expect(manifest.status).toBe("draft_manifest");

    // Assign packages (PKG-2026-081 is seeded sealed)
    const assigned = shippingService.assignPackages(session, manifest.manifestNumber, ["PKG-2026-081"]);
    expect(assigned.status).toBe("staged_for_loading");
    expect(assigned.totalGrossWeightLbs).toBe(45.0);
  });

  it("dispatches shipment and confirms delivery with proof of delivery (POD)", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const manifest = shippingService.createManifest(session, {
      carrierType: "dedicated_flatbed",
      carrierName: "Front Range Hauling",
      stops: [
        {
          stopSequence: 1,
          destinationCustomerName: "Summit Glass",
          destinationAddress: "Denver, CO",
          packageNumbers: ["PKG-2026-081"],
        },
      ],
    });

    shippingService.assignPackages(session, manifest.manifestNumber, ["PKG-2026-081"]);

    // Dispatch
    const dispatched = shippingService.dispatchShipment(session, manifest.manifestNumber, {
      driverName: "John Doe",
      trailerOrPlateNumber: "TR-9912",
    });

    expect(dispatched.status).toBe("dispatched_in_transit");
    expect(dispatched.dispatchedAt).toBeDefined();

    // Confirm Delivery
    const delivered = shippingService.confirmDelivery(session, manifest.manifestNumber, 1, "Receiving Dock Mgr: A. Smith");
    expect(delivered.status).toBe("delivered");
    expect(delivered.stops[0].status).toBe("delivered");
    expect(delivered.stops[0].signedBy).toContain("A. Smith");
  });

  it("calculates logistics metrics and on-time performance", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);
    const metrics = shippingService.getShippingMetrics(session);

    expect(metrics.onTimeDeliveryPercentage).toBeGreaterThan(90);
  });
});
