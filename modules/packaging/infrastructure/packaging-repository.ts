import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  packagingUnits,
  packagedItems,
  auditEvents,
} from "@/db/schema";
import {
  PackagingUnit,
  PackagingMetricsSummary,
  ContainerType,
  PackagingStatus,
} from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";

export class PackagingRepository {
  async ensureSeededData(session: SessionContext): Promise<void> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const existing = await db
      .select({ id: packagingUnits.id })
      .from(packagingUnits)
      .where(eq(packagingUnits.organizationId, orgId))
      .limit(1);

    if (existing.length === 0) {
      const pkgId = `pkg_${Date.now()}_default`;
      await db.insert(packagingUnits).values({
        id: pkgId,
        organizationId: orgId,
        packageNumber: "PKG-2026-081",
        containerType: "box",
        totalQuantity: 50,
        netWeightLbs: "42.50",
        tareWeightLbs: "2.50",
        grossWeightLbs: "45.00",
        maxCapacityLbs: "70.00",
        dimensionsInches: { length: 18, width: 14, height: 10 },
        labelBarcode: "yorkstead://package/PKG-2026-081",
        status: "sealed_ready_for_shipping",
        sealedAt: new Date(),
        sealedByName: "Packaging Tech",
      });

      await db.insert(packagedItems).values({
        id: `pi_${Date.now()}_1`,
        organizationId: orgId,
        packageId: pkgId,
        jobNumber: "JOB-2026-104",
        partDescription: "Precision Laser Cut Flanges - 0.25in 304 SS",
        quantityPacked: 50,
        unitWeightLbs: "0.85",
        lotNumber: "LOT-2026-SS1",
      });
    }
  }

  // 1. List Packaging Units
  async listPackages(
    session: SessionContext,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<PackagingUnit[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(packagingUnits)
      .where(eq(packagingUnits.organizationId, orgId))
      .orderBy(desc(packagingUnits.createdAt))
      .limit(limit)
      .offset(offset);

    if (options?.status) {
      query = db
        .select()
        .from(packagingUnits)
        .where(
          and(
            eq(packagingUnits.organizationId, orgId),
            eq(packagingUnits.status, options.status)
          )
        )
        .orderBy(desc(packagingUnits.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    const result: PackagingUnit[] = [];

    for (const u of rows) {
      const itemRows = await db
        .select()
        .from(packagedItems)
        .where(
          and(
            eq(packagedItems.organizationId, orgId),
            eq(packagedItems.packageId, u.id)
          )
        );

      result.push(this.mapUnit(u, itemRows));
    }

    return result;
  }

  // 2. Get Single Package
  async getPackage(session: SessionContext, idOrNumber: string): Promise<PackagingUnit> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(packagingUnits)
      .where(
        and(
          eq(packagingUnits.organizationId, orgId),
          sql`(${packagingUnits.id} = ${idOrNumber} OR ${packagingUnits.packageNumber} = ${idOrNumber})`
        )
      )
      .limit(1);

    if (rows.length === 0) {
      throw new Error(`Packaging container '${idOrNumber}' not found.`);
    }

    const u = rows[0];
    const itemRows = await db
      .select()
      .from(packagedItems)
      .where(
        and(
          eq(packagedItems.organizationId, orgId),
          eq(packagedItems.packageId, u.id)
        )
      );

    return this.mapUnit(u, itemRows);
  }

  // 3. Create Packaging Unit
  async createPackagingUnit(
    session: SessionContext,
    params: {
      containerType: ContainerType;
      specificationId?: string;
      maxCapacityLbs?: number;
      tareWeightLbs?: number;
      dimensionsInches?: { length: number; width: number; height: number };
    }
  ): Promise<PackagingUnit> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const year = new Date().getFullYear();
    const id = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    return await db.transaction(async (tx) => {
      const isPallet = params.containerType === "pallet";
      const prefix = isPallet ? "PALLET" : "PKG";

      const countRes = await tx
        .select({ count: sql<number>`count(*)` })
        .from(packagingUnits)
        .where(
          and(
            eq(packagingUnits.organizationId, orgId),
            eq(packagingUnits.containerType, params.containerType)
          )
        );

      const count = Number(countRes[0]?.count || 0) + 1;
      const packageNumber = `${prefix}-${year}-${count.toString().padStart(3, "0")}`;
      const barcode = `yorkstead://package/${packageNumber}`;

      const tare = params.tareWeightLbs || (isPallet ? 40.0 : 2.0);
      const capacity = params.maxCapacityLbs || (isPallet ? 2000.0 : 50.0);
      const dims = params.dimensionsInches || (isPallet ? { length: 48, width: 40, height: 48 } : { length: 18, width: 14, height: 10 });

      const [unit] = await tx
        .insert(packagingUnits)
        .values({
          id,
          organizationId: orgId,
          packageNumber,
          containerType: params.containerType,
          specificationId: params.specificationId || null,
          totalQuantity: 0,
          netWeightLbs: "0.00",
          tareWeightLbs: tare.toFixed(2),
          grossWeightLbs: tare.toFixed(2),
          maxCapacityLbs: capacity.toFixed(2),
          dimensionsInches: dims,
          labelBarcode: barcode,
          status: "in_pack",
        })
        .returning();

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: id,
        action: "packaging.unit_created",
        summary: `Created ${params.containerType.toUpperCase()} container: ${packageNumber}`,
        metadata: { packageNumber, containerType: params.containerType },
      });

      return this.mapUnit(unit, []);
    });
  }

  // 4. Pack Item into Container with Capacity Guardrail
  async packItem(
    session: SessionContext,
    idOrNumber: string,
    params: {
      jobId?: string;
      jobNumber?: string;
      partDescription: string;
      quantity: number;
      unitWeightLbs: number;
      lotNumber?: string;
    }
  ): Promise<PackagingUnit> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(packagingUnits)
        .where(
          and(
            eq(packagingUnits.organizationId, orgId),
            sql`(${packagingUnits.id} = ${idOrNumber} OR ${packagingUnits.packageNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Packaging container '${idOrNumber}' not found.`);
      }

      const unit = rows[0];
      if (unit.status !== "in_pack" && unit.status !== "ready_for_inspection") {
        throw new Error(`Cannot pack items into container with status '${unit.status}'.`);
      }

      const additionalWeight = params.quantity * params.unitWeightLbs;
      const currentGross = parseFloat(unit.grossWeightLbs);
      const currentNet = parseFloat(unit.netWeightLbs);
      const maxCap = parseFloat(unit.maxCapacityLbs);
      const newGross = currentGross + additionalWeight;

      if (newGross > maxCap) {
        throw new Error(
          `Capacity Violation: Container ${unit.packageNumber} maximum capacity is ${maxCap} lbs. Total weight would be ${newGross.toFixed(1)} lbs.`
        );
      }

      const newNet = currentNet + additionalWeight;
      const newTotalQty = unit.totalQuantity + params.quantity;

      await tx.insert(packagedItems).values({
        id: `pi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        organizationId: orgId,
        packageId: unit.id,
        jobId: params.jobId || null,
        jobNumber: params.jobNumber || null,
        partDescription: params.partDescription.trim(),
        quantityPacked: params.quantity,
        unitWeightLbs: params.unitWeightLbs.toFixed(2),
        lotNumber: params.lotNumber?.trim() || null,
      });

      const [updated] = await tx
        .update(packagingUnits)
        .set({
          totalQuantity: newTotalQty,
          netWeightLbs: newNet.toFixed(2),
          grossWeightLbs: newGross.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(packagingUnits.id, unit.id))
        .returning();

      const allItems = await tx
        .select()
        .from(packagedItems)
        .where(
          and(
            eq(packagedItems.organizationId, orgId),
            eq(packagedItems.packageId, unit.id)
          )
        );

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: unit.id,
        action: "packaging.item_packed",
        summary: `Packed ${params.quantity}x ${params.partDescription} into ${unit.packageNumber} (Gross: ${newGross.toFixed(1)} lbs)`,
        metadata: { packageNumber: unit.packageNumber, quantity: params.quantity, grossWeightLbs: newGross },
      });

      return this.mapUnit(updated, allItems);
    });
  }

  // 5. Seal Packaging Unit
  async sealPackagingUnit(session: SessionContext, idOrNumber: string): Promise<PackagingUnit> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(packagingUnits)
        .where(
          and(
            eq(packagingUnits.organizationId, orgId),
            sql`(${packagingUnits.id} = ${idOrNumber} OR ${packagingUnits.packageNumber} = ${idOrNumber})`
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Packaging container '${idOrNumber}' not found.`);
      }

      const unit = rows[0];
      const now = new Date();

      const [updated] = await tx
        .update(packagingUnits)
        .set({
          status: "sealed_ready_for_shipping",
          sealedAt: now,
          sealedByUserId: session.user.id,
          sealedByName: session.user.name,
          updatedAt: now,
        })
        .where(eq(packagingUnits.id, unit.id))
        .returning();

      const items = await tx
        .select()
        .from(packagedItems)
        .where(
          and(
            eq(packagedItems.organizationId, orgId),
            eq(packagedItems.packageId, unit.id)
          )
        );

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: unit.id,
        action: "packaging.unit_sealed",
        summary: `Sealed container ${unit.packageNumber} (Ready for shipping)`,
        metadata: { packageNumber: unit.packageNumber },
      });

      return this.mapUnit(updated, items);
    });
  }

  // 6. Packaging Metrics Summary
  async getMetrics(session: SessionContext): Promise<PackagingMetricsSummary> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(packagingUnits)
      .where(eq(packagingUnits.organizationId, orgId));

    const activePackages = rows.filter((r) => r.status === "in_pack" || r.status === "ready_for_inspection");
    const readyForShipment = rows.filter((r) => r.status === "sealed_ready_for_shipping");
    const totalWeight = rows.reduce((acc, r) => acc + parseFloat(r.grossWeightLbs), 0);

    return {
      activePackagesCount: activePackages.length,
      readyForShipmentCount: readyForShipment.length,
      totalWeightPackedLbs: Math.round(totalWeight * 10) / 10,
    };
  }

  private mapUnit(
    u: typeof packagingUnits.$inferSelect,
    items: Array<typeof packagedItems.$inferSelect>
  ): PackagingUnit {
    return {
      id: u.id,
      organizationId: u.organizationId,
      packageNumber: u.packageNumber,
      containerType: u.containerType as ContainerType,
      specificationId: u.specificationId || undefined,
      items: items.map((i) => ({
        id: i.id,
        jobId: i.jobId || "unlinked",
        jobNumber: i.jobNumber || "JOB-MOCK",
        partDescription: i.partDescription,
        quantityPacked: i.quantityPacked,
        unitWeightLbs: parseFloat(i.unitWeightLbs),
        lotNumber: i.lotNumber || undefined,
      })),
      totalQuantity: u.totalQuantity,
      netWeightLbs: parseFloat(u.netWeightLbs),
      tareWeightLbs: parseFloat(u.tareWeightLbs),
      grossWeightLbs: parseFloat(u.grossWeightLbs),
      maxCapacityLbs: parseFloat(u.maxCapacityLbs),
      dimensionsInches: u.dimensionsInches as { length: number; width: number; height: number },
      labelBarcode: u.labelBarcode,
      status: u.status as PackagingStatus,
      sealedAt: u.sealedAt ? u.sealedAt.toISOString() : undefined,
      sealedByUserId: u.sealedByUserId || undefined,
      sealedByName: u.sealedByName || undefined,
      createdAt: u.createdAt.toISOString(),
    };
  }
}

export const packagingRepository = new PackagingRepository();
