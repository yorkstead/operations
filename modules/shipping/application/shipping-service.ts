import {
  ShippingManifest,
  ShipmentStop,
  ShippingMetricsSummary,
  CarrierType,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";
import { notificationService } from "../../core/application/notification-service";
import { packagingService } from "../../packaging/application/packaging-service";

export class ShippingService {
  private manifests: Map<string, ShippingManifest> = new Map();

  constructor() {
    this.seedDefaultManifest("org_default");
  }

  private seedDefaultManifest(orgId: string) {
    const defaultManifest: ShippingManifest = {
      id: "shp_1",
      organizationId: orgId,
      manifestNumber: "BOL-2026-092",
      carrierType: "ltl_freight",
      carrierName: "Old Dominion Freight Line",
      trackingOrProNumber: "ODFL-88219044",
      driverName: "Marcus Vance",
      trailerOrPlateNumber: "TR-53-CO-9921",
      stops: [
        {
          stopSequence: 1,
          destinationCustomerName: "Alpine Aerospace Systems",
          destinationAddress: "7420 Innovation Way, Longmont, CO 80503",
          packageNumbers: ["PKG-2026-081"],
          status: "pending",
        },
      ],
      packageNumbers: ["PKG-2026-081"],
      totalPackages: 1,
      totalGrossWeightLbs: 45.0,
      status: "staged_for_loading",
      billOfLadingBarcode: "yorkstead://bol/BOL-2026-092",
      createdAt: new Date().toISOString(),
    };

    this.manifests.set(`${orgId}:${defaultManifest.manifestNumber}`, defaultManifest);
  }

  private ensureManifestsSeeded(orgId: string) {
    const existing = Array.from(this.manifests.values()).filter((m) => m.organizationId === orgId);
    if (existing.length === 0) {
      this.seedDefaultManifest(orgId);
    }
  }

  // 1. Create Shipping Manifest (Draft Bill of Lading)
  createManifest(
    session: SessionContext,
    params: {
      carrierType: CarrierType;
      carrierName: string;
      trackingOrProNumber?: string;
      stops: {
        stopSequence: number;
        destinationCustomerName: string;
        destinationAddress: string;
        packageNumbers: string[];
        contactPerson?: string;
        contactPhone?: string;
        deliveryNotes?: string;
      }[];
    }
  ): ShippingManifest {
    authorizationService.requireCapability(session, "shipping:create_manifest");

    const orgId = session.activeOrganization.id;
    const count = Array.from(this.manifests.values()).filter((m) => m.organizationId === orgId).length + 1;
    const manifestNumber = `BOL-${new Date().getFullYear()}-${count.toString().padStart(3, "0")}`;
    const id = `shp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const barcode = `yorkstead://bol/${manifestNumber}`;

    const stops: ShipmentStop[] = params.stops.map((s) => ({
      ...s,
      status: "pending",
    }));

    const allPackageNumbers = stops.flatMap((s) => s.packageNumbers);

    const manifest: ShippingManifest = {
      id,
      organizationId: orgId,
      manifestNumber,
      carrierType: params.carrierType,
      carrierName: params.carrierName,
      trackingOrProNumber: params.trackingOrProNumber || `PRO-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      stops,
      packageNumbers: allPackageNumbers,
      totalPackages: allPackageNumbers.length,
      totalGrossWeightLbs: 0,
      status: "draft_manifest",
      billOfLadingBarcode: barcode,
      createdAt: new Date().toISOString(),
    };

    this.manifests.set(`${orgId}:${manifest.manifestNumber}`, manifest);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "system",
      entityId: id,
      action: "shipping.manifest_created",
      summary: `Created Bill of Lading ${manifestNumber} (${params.carrierName})`,
    });

    return manifest;
  }

  // 2. Assign Packages & Build Load
  assignPackages(
    session: SessionContext,
    manifestNumber: string,
    packageNumbers: string[]
  ): ShippingManifest {
    authorizationService.requireCapability(session, "shipping:create_manifest");

    const manifest = this.findManifest(session, manifestNumber);
    if (manifest.status !== "draft_manifest" && manifest.status !== "staged_for_loading") {
      throw new Error(`Cannot assign packages to manifest in '${manifest.status}' state.`);
    }

    let calculatedWeight = 0;
    for (const pkgNumber of packageNumbers) {
      try {
        const pkg = packagingService.getPackage(session, pkgNumber);
        if (pkg.status !== "sealed_ready_for_shipping") {
          throw new Error(`Package ${pkgNumber} must be sealed before staging onto a manifest.`);
        }
        calculatedWeight += pkg.grossWeightLbs;
      } catch {
        calculatedWeight += 45.0; // Fallback mock container weight
      }
    }

    manifest.packageNumbers = Array.from(new Set([...manifest.packageNumbers, ...packageNumbers]));
    manifest.totalPackages = manifest.packageNumbers.length;
    manifest.totalGrossWeightLbs = calculatedWeight;
    manifest.status = "staged_for_loading";

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "system",
      entityId: manifest.id,
      action: "shipping.packages_staged",
      summary: `Staged Packages for Loading: ${manifestNumber} (${manifest.totalGrossWeightLbs.toFixed(1)} lbs)`,
    });

    return manifest;
  }

  // 3. Dispatch Shipment to Carrier
  dispatchShipment(
    session: SessionContext,
    manifestNumber: string,
    driverDetails?: { driverName?: string; trailerOrPlateNumber?: string }
  ): ShippingManifest {
    authorizationService.requireCapability(session, "shipping:complete_shipment");

    const manifest = this.findManifest(session, manifestNumber);
    if (manifest.status !== "staged_for_loading" && manifest.status !== "draft_manifest") {
      throw new Error(`Manifest ${manifestNumber} cannot be dispatched from '${manifest.status}'.`);
    }

    manifest.status = "dispatched_in_transit";
    manifest.dispatchedAt = new Date().toISOString();
    manifest.dispatchedByUserId = session.user.id;
    manifest.dispatchedByName = session.user.name;
    if (driverDetails?.driverName) manifest.driverName = driverDetails.driverName;
    if (driverDetails?.trailerOrPlateNumber) manifest.trailerOrPlateNumber = driverDetails.trailerOrPlateNumber;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "system",
      entityId: manifest.id,
      action: "shipping.manifest_dispatched",
      summary: `Dispatched Outbound Shipment: ${manifestNumber} via ${manifest.carrierName}`,
    });

    notificationService.dispatchNotification({
      organizationId: session.activeOrganization.id,
      recipientUserId: session.user.id,
      title: "Shipment Dispatched",
      message: `Outbound manifest ${manifestNumber} is in transit via ${manifest.carrierName}.`,
    });

    return manifest;
  }

  // 4. Confirm Proof of Delivery (POD)
  confirmDelivery(
    session: SessionContext,
    manifestNumber: string,
    stopSequence: number,
    signedBy: string
  ): ShippingManifest {
    authorizationService.requireCapability(session, "shipping:complete_shipment");

    const manifest = this.findManifest(session, manifestNumber);
    const stop = manifest.stops.find((s) => s.stopSequence === stopSequence);
    if (!stop) {
      throw new Error(`Stop #${stopSequence} not found on manifest ${manifestNumber}.`);
    }

    stop.status = "delivered";
    stop.signedBy = signedBy;
    stop.deliveredAt = new Date().toISOString();

    const allDelivered = manifest.stops.every((s) => s.status === "delivered");
    if (allDelivered) {
      manifest.status = "delivered";
      manifest.deliveredAt = new Date().toISOString();
    }

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "system",
      entityId: manifest.id,
      action: "shipping.proof_of_delivery",
      summary: `Confirmed Proof of Delivery: ${manifestNumber} (Stop #${stopSequence}: ${stop.destinationCustomerName})`,
    });

    return manifest;
  }

  // 5. Query Metrics
  getShippingMetrics(session: SessionContext): ShippingMetricsSummary {
    const orgManifests = Array.from(this.manifests.values()).filter(
      (m) => m.organizationId === session.activeOrganization.id
    );

    const activeShipments = orgManifests.filter(
      (m) => m.status === "dispatched_in_transit" || m.status === "staged_for_loading"
    );
    const delivered = orgManifests.filter((m) => m.status === "delivered");
    const totalWeightInTransit = activeShipments.reduce((acc, m) => acc + m.totalGrossWeightLbs, 0);

    return {
      activeShipmentsCount: activeShipments.length,
      shipmentsDeliveredCount: delivered.length,
      totalWeightInTransitLbs: totalWeightInTransit,
      onTimeDeliveryPercentage: 98.8,
    };
  }

  listManifests(session: SessionContext): ShippingManifest[] {
    return Array.from(this.manifests.values()).filter(
      (m) => m.organizationId === session.activeOrganization.id
    );
  }

  getManifest(session: SessionContext, manifestNumberOrId: string): ShippingManifest {
    return this.findManifest(session, manifestNumberOrId);
  }

  private findManifest(session: SessionContext, manifestNumberOrId: string): ShippingManifest {
    const manifest = Array.from(this.manifests.values()).find(
      (m) =>
        (m.id === manifestNumberOrId || m.manifestNumber === manifestNumberOrId) &&
        m.organizationId === session.activeOrganization.id
    );
    if (!manifest) {
      throw new Error(`Shipping Manifest '${manifestNumberOrId}' not found.`);
    }
    return manifest;
  }
}

export const shippingService = new ShippingService();
