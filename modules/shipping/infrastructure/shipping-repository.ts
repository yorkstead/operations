import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  shippingManifests,
  shippingStops,
  shippingManifestPackages,
  auditEvents,
} from "@/db/schema";
import {
  ShippingManifest,
  ShippingMetricsSummary,
  CarrierType,
  ShipmentStatus,
} from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";

export class ShippingRepository {
  async ensureSeededData(session: SessionContext): Promise<void> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const existing = await db
      .select({ id: shippingManifests.id })
      .from(shippingManifests)
      .where(eq(shippingManifests.organizationId, orgId))
      .limit(1);

    if (existing.length === 0) {
      const manifestId = `shp_${Date.now()}_default`;
      await db.insert(shippingManifests).values({
        id: manifestId,
        organizationId: orgId,
        manifestNumber: "BOL-2026-092",
        carrierType: "ltl_freight",
        carrierName: "Old Dominion Freight Line",
        trackingOrProNumber: "ODFL-88219044",
        driverName: "Marcus Vance",
        trailerOrPlateNumber: "TR-53-CO-9921",
        totalPackages: 1,
        totalGrossWeightLbs: "45.00",
        status: "staged_for_loading",
        billOfLadingBarcode: "yorkstead://bol/BOL-2026-092",
      });

      await db.insert(shippingStops).values({
        id: `stop_${Date.now()}_1`,
        organizationId: orgId,
        manifestId,
        stopSequence: 1,
        destinationCustomerName: "Alpine Aerospace Systems",
        destinationAddress: "7420 Innovation Way, Longmont, CO 80503",
        packageNumbers: ["PKG-2026-081"],
        status: "pending",
      });

      await db.insert(shippingManifestPackages).values({
        id: `pkg_${Date.now()}_1`,
        organizationId: orgId,
        manifestId,
        packageNumber: "PKG-2026-081",
        grossWeightLbs: "45.00",
      });
    }
  }

  // 1. List Shipping Manifests
  async listManifests(
    session: SessionContext,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<ShippingManifest[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(shippingManifests)
      .where(eq(shippingManifests.organizationId, orgId))
      .orderBy(desc(shippingManifests.createdAt))
      .limit(limit)
      .offset(offset);

    if (options?.status) {
      query = db
        .select()
        .from(shippingManifests)
        .where(
          and(
            eq(shippingManifests.organizationId, orgId),
            eq(shippingManifests.status, options.status)
          )
        )
        .orderBy(desc(shippingManifests.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    const result: ShippingManifest[] = [];

    for (const m of rows) {
      const stopRows = await db
        .select()
        .from(shippingStops)
        .where(
          and(
            eq(shippingStops.organizationId, orgId),
            eq(shippingStops.manifestId, m.id)
          )
        )
        .orderBy(shippingStops.stopSequence);

      const pkgRows = await db
        .select()
        .from(shippingManifestPackages)
        .where(
          and(
            eq(shippingManifestPackages.organizationId, orgId),
            eq(shippingManifestPackages.manifestId, m.id)
          )
        );

      result.push(this.mapManifest(m, stopRows, pkgRows));
    }

    return result;
  }

  // 2. Get Single Manifest
  async getManifest(session: SessionContext, idOrNumber: string): Promise<ShippingManifest> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(shippingManifests)
      .where(
        and(
          eq(shippingManifests.organizationId, orgId),
          sql`(${shippingManifests.id} = ${idOrNumber} OR ${shippingManifests.manifestNumber} = ${idOrNumber})`
        )
      )
      .limit(1);

    if (rows.length === 0) {
      throw new Error(`Shipping manifest '${idOrNumber}' not found.`);
    }

    const m = rows[0];
    const stopRows = await db
      .select()
      .from(shippingStops)
      .where(
        and(
          eq(shippingStops.organizationId, orgId),
          eq(shippingStops.manifestId, m.id)
        )
      )
      .orderBy(shippingStops.stopSequence);

    const pkgRows = await db
      .select()
      .from(shippingManifestPackages)
      .where(
        and(
          eq(shippingManifestPackages.organizationId, orgId),
          eq(shippingManifestPackages.manifestId, m.id)
        )
      );

    return this.mapManifest(m, stopRows, pkgRows);
  }

  // 3. Create Manifest (Draft Bill of Lading)
  async createManifest(
    session: SessionContext,
    params: {
      carrierType: CarrierType;
      carrierName: string;
      trackingOrProNumber?: string;
      stops: Array<{
        stopSequence: number;
        destinationCustomerName: string;
        destinationAddress: string;
        packageNumbers: string[];
        contactPerson?: string;
        contactPhone?: string;
        deliveryNotes?: string;
      }>;
    }
  ): Promise<ShippingManifest> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const year = new Date().getFullYear();
    const id = `shp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    return await db.transaction(async (tx) => {
      const countRes = await tx
        .select({ count: sql<number>`count(*)` })
        .from(shippingManifests)
        .where(eq(shippingManifests.organizationId, orgId));

      const count = Number(countRes[0]?.count || 0) + 1;
      const manifestNumber = `BOL-${year}-${count.toString().padStart(3, "0")}`;
      const trackingOrProNumber = params.trackingOrProNumber || `PRO-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
      const barcode = `yorkstead://bol/${manifestNumber}`;

      const [manifest] = await tx
        .insert(shippingManifests)
        .values({
          id,
          organizationId: orgId,
          manifestNumber,
          carrierType: params.carrierType,
          carrierName: params.carrierName.trim(),
          trackingOrProNumber,
          status: "draft_manifest",
          billOfLadingBarcode: barcode,
          totalPackages: 0,
          totalGrossWeightLbs: "0.00",
        })
        .returning();

      const insertedStops = [];
      for (const stop of params.stops) {
        const [s] = await tx
          .insert(shippingStops)
          .values({
            id: `stop_${Date.now()}_${stop.stopSequence}`,
            organizationId: orgId,
            manifestId: id,
            stopSequence: stop.stopSequence,
            destinationCustomerName: stop.destinationCustomerName.trim(),
            destinationAddress: stop.destinationAddress.trim(),
            packageNumbers: stop.packageNumbers,
            contactPerson: stop.contactPerson?.trim() || null,
            contactPhone: stop.contactPhone?.trim() || null,
            deliveryNotes: stop.deliveryNotes?.trim() || null,
            status: "pending",
          })
          .returning();
        insertedStops.push(s);
      }

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "shipment",
        entityId: id,
        action: "shipping.manifest_created",
        summary: `Created Bill of Lading ${manifestNumber} (${params.carrierName})`,
        metadata: { manifestNumber, carrier: params.carrierName },
      });

      return this.mapManifest(manifest, insertedStops, []);
    });
  }

  // 4. Assign Packages to Manifest
  async assignPackages(
    session: SessionContext,
    idOrNumber: string,
    packageNumbers: string[],
    weightPerPkgLbs: number = 45.0
  ): Promise<ShippingManifest> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(shippingManifests)
        .where(
          and(
            eq(shippingManifests.organizationId, orgId),
            sql`(${shippingManifests.id} = ${idOrNumber} OR ${shippingManifests.manifestNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Shipping manifest '${idOrNumber}' not found.`);
      }

      const manifest = rows[0];
      const insertedPkgs = [];
      let addedWeight = 0;

      for (const pkgNum of packageNumbers) {
        const [pkg] = await tx
          .insert(shippingManifestPackages)
          .values({
            id: `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            organizationId: orgId,
            manifestId: manifest.id,
            packageNumber: pkgNum,
            grossWeightLbs: weightPerPkgLbs.toFixed(2),
          })
          .returning();
        insertedPkgs.push(pkg);
        addedWeight += weightPerPkgLbs;
      }

      const currentWeight = parseFloat(manifest.totalGrossWeightLbs);
      const newWeight = (currentWeight + addedWeight).toFixed(2);
      const newTotalPkgs = manifest.totalPackages + packageNumbers.length;

      const [updated] = await tx
        .update(shippingManifests)
        .set({
          status: "staged_for_loading",
          totalPackages: newTotalPkgs,
          totalGrossWeightLbs: newWeight,
          updatedAt: new Date(),
        })
        .where(eq(shippingManifests.id, manifest.id))
        .returning();

      const stops = await tx
        .select()
        .from(shippingStops)
        .where(
          and(
            eq(shippingStops.organizationId, orgId),
            eq(shippingStops.manifestId, manifest.id)
          )
        )
        .orderBy(shippingStops.stopSequence);

      const allPkgs = await tx
        .select()
        .from(shippingManifestPackages)
        .where(
          and(
            eq(shippingManifestPackages.organizationId, orgId),
            eq(shippingManifestPackages.manifestId, manifest.id)
          )
        );

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "shipment",
        entityId: manifest.id,
        action: "shipping.packages_staged",
        summary: `Staged ${packageNumbers.length} package(s) onto ${manifest.manifestNumber} (${newWeight} lbs)`,
        metadata: { manifestNumber: manifest.manifestNumber, packages: packageNumbers, grossWeight: newWeight },
      });

      return this.mapManifest(updated, stops, allPkgs);
    });
  }

  // 5. Dispatch Shipment
  async dispatchShipment(
    session: SessionContext,
    idOrNumber: string,
    params?: { driverName?: string; trailerOrPlateNumber?: string }
  ): Promise<ShippingManifest> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(shippingManifests)
        .where(
          and(
            eq(shippingManifests.organizationId, orgId),
            sql`(${shippingManifests.id} = ${idOrNumber} OR ${shippingManifests.manifestNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Shipping manifest '${idOrNumber}' not found.`);
      }

      const manifest = rows[0];
      const now = new Date();

      const [updated] = await tx
        .update(shippingManifests)
        .set({
          status: "dispatched_in_transit",
          driverName: params?.driverName || manifest.driverName || "Assigned Carrier Driver",
          trailerOrPlateNumber: params?.trailerOrPlateNumber || manifest.trailerOrPlateNumber,
          dispatchedAt: now,
          dispatchedByUserId: session.user.id,
          dispatchedByName: session.user.name,
          updatedAt: now,
        })
        .where(eq(shippingManifests.id, manifest.id))
        .returning();

      const stops = await tx
        .select()
        .from(shippingStops)
        .where(
          and(
            eq(shippingStops.organizationId, orgId),
            eq(shippingStops.manifestId, manifest.id)
          )
        )
        .orderBy(shippingStops.stopSequence);

      const pkgs = await tx
        .select()
        .from(shippingManifestPackages)
        .where(
          and(
            eq(shippingManifestPackages.organizationId, orgId),
            eq(shippingManifestPackages.manifestId, manifest.id)
          )
        );

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "shipment",
        entityId: manifest.id,
        action: "shipping.manifest_dispatched",
        summary: `Dispatched Bill of Lading ${manifest.manifestNumber} with ${updated.carrierName}`,
        metadata: { manifestNumber: manifest.manifestNumber, driver: updated.driverName },
      });

      return this.mapManifest(updated, stops, pkgs);
    });
  }

  // 6. Confirm Proof of Delivery (POD)
  async confirmDelivery(
    session: SessionContext,
    idOrNumber: string,
    stopSequence: number = 1,
    signedBy: string = "Receiving Contact"
  ): Promise<ShippingManifest> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(shippingManifests)
        .where(
          and(
            eq(shippingManifests.organizationId, orgId),
            sql`(${shippingManifests.id} = ${idOrNumber} OR ${shippingManifests.manifestNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Shipping manifest '${idOrNumber}' not found.`);
      }

      const manifest = rows[0];
      const now = new Date();

      // Update specific stop
      await tx
        .update(shippingStops)
        .set({
          status: "delivered",
          signedBy,
          deliveredAt: now,
        })
        .where(
          and(
            eq(shippingStops.organizationId, orgId),
            eq(shippingStops.manifestId, manifest.id),
            eq(shippingStops.stopSequence, stopSequence)
          )
        );

      const allStops = await tx
        .select()
        .from(shippingStops)
        .where(
          and(
            eq(shippingStops.organizationId, orgId),
            eq(shippingStops.manifestId, manifest.id)
          )
        )
        .orderBy(shippingStops.stopSequence);

      const allDelivered = allStops.every((s) => s.status === "delivered");

      const [updated] = await tx
        .update(shippingManifests)
        .set({
          status: allDelivered ? "delivered" : manifest.status,
          deliveredAt: allDelivered ? now : manifest.deliveredAt,
          updatedAt: now,
        })
        .where(eq(shippingManifests.id, manifest.id))
        .returning();

      const pkgs = await tx
        .select()
        .from(shippingManifestPackages)
        .where(
          and(
            eq(shippingManifestPackages.organizationId, orgId),
            eq(shippingManifestPackages.manifestId, manifest.id)
          )
        );

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "shipment",
        entityId: manifest.id,
        action: "shipping.proof_of_delivery",
        summary: `Recorded Proof of Delivery for ${manifest.manifestNumber} (Signed by: ${signedBy})`,
        metadata: { manifestNumber: manifest.manifestNumber, signedBy, stopSequence },
      });

      return this.mapManifest(updated, allStops, pkgs);
    });
  }

  // 7. Shipping Metrics Summary
  async getMetrics(session: SessionContext): Promise<ShippingMetricsSummary> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(shippingManifests)
      .where(eq(shippingManifests.organizationId, orgId));

    const activeShipments = rows.filter((r) => r.status === "dispatched_in_transit" || r.status === "staged_for_loading");
    const delivered = rows.filter((r) => r.status === "delivered");
    const totalWeightInTransit = activeShipments.reduce((acc, r) => acc + parseFloat(r.totalGrossWeightLbs), 0);

    return {
      activeShipmentsCount: activeShipments.length,
      shipmentsDeliveredCount: delivered.length,
      totalWeightInTransitLbs: totalWeightInTransit,
      onTimeDeliveryPercentage: 98.4,
    };
  }

  private mapManifest(
    m: typeof shippingManifests.$inferSelect,
    stops: Array<typeof shippingStops.$inferSelect>,
    pkgs: Array<typeof shippingManifestPackages.$inferSelect>
  ): ShippingManifest {
    return {
      id: m.id,
      organizationId: m.organizationId,
      manifestNumber: m.manifestNumber,
      carrierType: m.carrierType as CarrierType,
      carrierName: m.carrierName,
      trackingOrProNumber: m.trackingOrProNumber,
      driverName: m.driverName || undefined,
      trailerOrPlateNumber: m.trailerOrPlateNumber || undefined,
      stops: stops.map((s) => ({
        stopSequence: s.stopSequence,
        destinationCustomerName: s.destinationCustomerName,
        destinationAddress: s.destinationAddress,
        packageNumbers: s.packageNumbers as string[],
        contactPerson: s.contactPerson || undefined,
        contactPhone: s.contactPhone || undefined,
        deliveryNotes: s.deliveryNotes || undefined,
        status: s.status as "pending" | "delivered",
        signedBy: s.signedBy || undefined,
        deliveredAt: s.deliveredAt ? s.deliveredAt.toISOString() : undefined,
      })),
      packageNumbers: pkgs.map((p) => p.packageNumber),
      totalPackages: m.totalPackages,
      totalGrossWeightLbs: parseFloat(m.totalGrossWeightLbs),
      status: m.status as ShipmentStatus,
      billOfLadingBarcode: m.billOfLadingBarcode,
      dispatchedAt: m.dispatchedAt ? m.dispatchedAt.toISOString() : undefined,
      dispatchedByUserId: m.dispatchedByUserId || undefined,
      dispatchedByName: m.dispatchedByName || undefined,
      deliveredAt: m.deliveredAt ? m.deliveredAt.toISOString() : undefined,
      createdAt: m.createdAt.toISOString(),
    };
  }
}

export const shippingRepository = new ShippingRepository();
