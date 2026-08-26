import {
  PackagingUnit,
  PackagedItem,
  PackagingMetricsSummary,
  ContainerType,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";

export class PackagingService {
  private packages: Map<string, PackagingUnit> = new Map();

  constructor() {
    this.seedDefaultPackages("org_default");
  }

  private seedDefaultPackages(orgId: string) {
    const pkg: PackagingUnit = {
      id: "pkg_1",
      organizationId: orgId,
      packageNumber: "PKG-2026-081",
      containerType: "box",
      items: [
        {
          id: "pi_1",
          jobId: "job_104",
          jobNumber: "JOB-2026-104",
          partDescription: "Precision Laser Cut Flanges - 0.25in 304 SS",
          quantityPacked: 50,
          unitWeightLbs: 0.85,
          lotNumber: "LOT-2026-SS1",
        },
      ],
      totalQuantity: 50,
      netWeightLbs: 42.5,
      tareWeightLbs: 2.5,
      grossWeightLbs: 45.0,
      maxCapacityLbs: 70.0,
      dimensionsInches: { length: 18, width: 14, height: 10 },
      labelBarcode: "yorkstead://package/PKG-2026-081",
      status: "sealed_ready_for_shipping",
      sealedAt: new Date().toISOString(),
      sealedByUserId: "usr_pack",
      sealedByName: "Packaging Tech",
      createdAt: new Date().toISOString(),
    };

    this.packages.set(`${orgId}:${pkg.packageNumber}`, pkg);
  }

  private ensurePackagesSeeded(orgId: string) {
    const existing = Array.from(this.packages.values()).filter((p) => p.organizationId === orgId);
    if (existing.length === 0) {
      this.seedDefaultPackages(orgId);
    }
  }

  // 1. Create Packaging Unit (Box / Pallet / Crate)
  createPackagingUnit(
    session: SessionContext,
    params: {
      containerType: ContainerType;
      specificationId?: string;
      maxCapacityLbs?: number;
      tareWeightLbs?: number;
      dimensionsInches?: { length: number; width: number; height: number };
    }
  ): PackagingUnit {
    authorizationService.requireCapability(session, "shopfloor:execute_station");

    const orgId = session.activeOrganization.id;
    const isPallet = params.containerType === "pallet";
    const prefix = isPallet ? "PALLET" : "PKG";
    const count = Array.from(this.packages.values()).filter(
      (p) => p.organizationId === orgId && p.containerType === params.containerType
    ).length + 1;

    const packageNumber = `${prefix}-${new Date().getFullYear()}-${count.toString().padStart(3, "0")}`;
    const id = `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const barcode = `yorkstead://package/${packageNumber}`;

    const tare = params.tareWeightLbs || (isPallet ? 40.0 : 2.0);
    const capacity = params.maxCapacityLbs || (isPallet ? 2000.0 : 50.0);
    const dims = params.dimensionsInches || (isPallet ? { length: 48, width: 40, height: 48 } : { length: 18, width: 14, height: 10 });

    const unit: PackagingUnit = {
      id,
      organizationId: orgId,
      packageNumber,
      containerType: params.containerType,
      specificationId: params.specificationId,
      items: [],
      totalQuantity: 0,
      netWeightLbs: 0,
      tareWeightLbs: tare,
      grossWeightLbs: tare,
      maxCapacityLbs: capacity,
      dimensionsInches: dims,
      labelBarcode: barcode,
      status: "in_pack",
      createdAt: new Date().toISOString(),
    };

    this.packages.set(`${orgId}:${packageNumber}`, unit);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: id,
      action: "packaging.unit_created",
      summary: `Created ${params.containerType.toUpperCase()} container: ${packageNumber}`,
    });

    return unit;
  }

  // 2. Pack Item into Container with Capacity Guardrail
  packItem(
    session: SessionContext,
    packageNumber: string,
    params: {
      jobId?: string;
      jobNumber?: string;
      partDescription: string;
      quantity: number;
      unitWeightLbs: number;
      lotNumber?: string;
    }
  ): PackagingUnit {
    authorizationService.requireCapability(session, "shopfloor:execute_station");

    const unit = this.findPackage(session, packageNumber);
    if (unit.status !== "in_pack" && unit.status !== "ready_for_inspection") {
      throw new Error(`Cannot pack items into container with status '${unit.status}'.`);
    }

    const additionalWeight = params.quantity * params.unitWeightLbs;
    const newGross = unit.grossWeightLbs + additionalWeight;

    if (newGross > unit.maxCapacityLbs) {
      throw new Error(
        `Capacity Violation: Container ${unit.packageNumber} maximum capacity is ${unit.maxCapacityLbs} lbs. Total weight would be ${newGross.toFixed(1)} lbs.`
      );
    }

    const item: PackagedItem = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      jobId: params.jobId || "unlinked",
      jobNumber: params.jobNumber || "JOB-MOCK",
      partDescription: params.partDescription,
      quantityPacked: params.quantity,
      unitWeightLbs: params.unitWeightLbs,
      lotNumber: params.lotNumber,
    };

    unit.items.push(item);
    unit.totalQuantity += params.quantity;
    unit.netWeightLbs += additionalWeight;
    unit.grossWeightLbs = newGross;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: unit.id,
      action: "packaging.item_packed",
      summary: `Packed ${params.quantity}x ${params.partDescription} into ${unit.packageNumber}`,
    });

    return unit;
  }

  // 3. Seal Container & Finalize Gross Weight
  sealPackagingUnit(session: SessionContext, packageNumber: string): PackagingUnit {
    authorizationService.requireCapability(session, "shopfloor:execute_station");

    const unit = this.findPackage(session, packageNumber);
    unit.status = "sealed_ready_for_shipping";
    unit.sealedAt = new Date().toISOString();
    unit.sealedByUserId = session.user.id;
    unit.sealedByName = session.user.name;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: unit.id,
      action: "packaging.unit_sealed",
      summary: `Sealed container ${unit.packageNumber} (${unit.grossWeightLbs.toFixed(1)} lbs)`,
    });

    return unit;
  }

  // 4. Query Metrics
  getPackagingMetrics(session: SessionContext): PackagingMetricsSummary {
    const orgPackages = Array.from(this.packages.values()).filter(
      (p) => p.organizationId === session.activeOrganization.id
    );

    const activePackagesCount = orgPackages.filter((p) => p.status === "in_pack" || p.status === "ready_for_inspection").length;
    const readyForShipmentCount = orgPackages.filter((p) => p.status === "sealed_ready_for_shipping").length;
    const totalWeightPackedLbs = orgPackages.reduce((acc, p) => acc + p.grossWeightLbs, 0);

    return {
      activePackagesCount,
      readyForShipmentCount,
      totalWeightPackedLbs: Math.round(totalWeightPackedLbs * 10) / 10,
    };
  }

  listPackages(session: SessionContext): PackagingUnit[] {
    return Array.from(this.packages.values()).filter(
      (p) => p.organizationId === session.activeOrganization.id
    );
  }

  getPackage(session: SessionContext, packageNumberOrId: string): PackagingUnit {
    return this.findPackage(session, packageNumberOrId);
  }

  private findPackage(session: SessionContext, packageNumberOrId: string): PackagingUnit {
    const pkg = Array.from(this.packages.values()).find(
      (p) =>
        (p.id === packageNumberOrId || p.packageNumber === packageNumberOrId) &&
        p.organizationId === session.activeOrganization.id
    );
    if (!pkg) {
      throw new Error(`Packaging container '${packageNumberOrId}' not found.`);
    }
    return pkg;
  }
}

export const packagingService = new PackagingService();
