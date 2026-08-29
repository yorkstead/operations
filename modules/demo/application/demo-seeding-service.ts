import { SessionContext } from "@/modules/core/domain/types";
import { activityService } from "@/modules/core/application/activity-service";
import { frontRangeSeeder, FrontRangeSeedingResult } from "./front-range-seeder";
import { summitFacilitySeeder, SummitFacilitySeedingResult } from "./summit-facility-seeder";
import { FRONT_RANGE_FIXTURE_DATA } from "../domain/front-range-scenario";
import { SUMMIT_FACILITY_FIXTURE_DATA } from "../domain/summit-facility-scenario";

export interface DemoContaminationReport {
  organizationId: string;
  isDemo: boolean;
  totalSyntheticRecordsFound: number;
  breakdown: {
    files: number;
    quotes: number;
    purchaseOrders: number;
    equipment: number;
    packages: number;
    manifests: number;
    articles: number;
    packetDocs: number;
  };
}

export class DemoSeedingService {
  private seededOrgs: Set<string> = new Set();

  private requireExplicitDemo(session: SessionContext, operation: string) {
    if (!session?.activeOrganization) {
      throw new Error("Unauthorized: Session required.");
    }

    const organization = session.activeOrganization;
    if (organization.isDemo !== true || organization.id === "org_yorkstead_systems" || organization.slug === "yorkstead") {
      throw new Error(
        `Forbidden: Cannot ${operation} production customer organization '${organization.name}' (${organization.id}). Demo operations require isDemo: true.`
      );
    }

    return organization;
  }

  /**
   * Explicitly seeds synthetic demo data into an organization.
   * STRICT GUARDRAIL: Refuses to seed production customer organizations (isDemo must be true).
   */
  seedDemoOrganization(session: SessionContext): { success: boolean; seededEntitiesCount: number } {
    const org = this.requireExplicitDemo(session, "seed");

    if (this.seededOrgs.has(org.id)) {
      // Idempotent: already seeded
      return { success: true, seededEntitiesCount: 0 };
    }

    let totalCount = 0;
    if (org.slug === "summit-facility-services") {
      const result: SummitFacilitySeedingResult = summitFacilitySeeder.seed(session);
      totalCount = result.totalRecordsSeeded;
    } else {
      // Default to Front Range connected scenario
      const result: FrontRangeSeedingResult = frontRangeSeeder.seed(session);
      totalCount = result.totalRecordsSeeded;
    }
    this.seededOrgs.add(org.id);

    activityService.logActivity({
      organizationId: org.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: org.id,
      action: "demo.organization_seeded",
      summary: `Explicitly seeded demo data (${totalCount} records) for demo organization '${org.name}'.`,
    });

    return { success: true, seededEntitiesCount: totalCount };
  }

  /**
   * Non-destructive contamination diagnosis report for an organization.
   */
  auditOrganizationContamination(session: SessionContext): DemoContaminationReport {
    const org = session.activeOrganization;
    const isDemo = org.isDemo === true && org.id !== "org_yorkstead_systems" && org.slug !== "yorkstead";
    const isSeeded = this.seededOrgs.has(org.id);
    const count = org.slug === "summit-facility-services"
      ? SUMMIT_FACILITY_FIXTURE_DATA.counts.totalConnectedRecords
      : FRONT_RANGE_FIXTURE_DATA.counts.totalConnectedRecords;

    return {
      organizationId: org.id,
      isDemo,
      totalSyntheticRecordsFound: isSeeded ? count : 0,
      breakdown: {
        files: isSeeded ? 2 : 0,
        quotes: isSeeded ? 1 : 0,
        purchaseOrders: isSeeded ? 1 : 0,
        equipment: isSeeded ? 3 : 0,
        packages: isSeeded ? 1 : 0,
        manifests: isSeeded ? 1 : 0,
        articles: isSeeded ? 3 : 0,
        packetDocs: isSeeded ? 1 : 0,
      },
    };
  }

  /**
   * Preview cleanup of synthetic records in a demo organization.
   */
  previewDemoCleanup(session: SessionContext): { eligibleRecordCount: number; targetOrganizationId: string } {
    const org = this.requireExplicitDemo(session, "preview cleanup for");

    const count = this.seededOrgs.has(org.id)
      ? (org.slug === "summit-facility-services"
          ? SUMMIT_FACILITY_FIXTURE_DATA.counts.totalConnectedRecords
          : FRONT_RANGE_FIXTURE_DATA.counts.totalConnectedRecords)
      : 0;
    return { eligibleRecordCount: count, targetOrganizationId: org.id };
  }

  /**
   * Clean demo records for the active demo organization.
   * STRICT GUARDRAIL: Rejects cleanup if organization is not a demo tenant.
   */
  cleanDemoOrganization(session: SessionContext): { success: boolean; recordsRemovedCount: number } {
    const org = this.requireExplicitDemo(session, "clean");

    const removed = this.seededOrgs.has(org.id)
      ? (org.slug === "summit-facility-services"
          ? SUMMIT_FACILITY_FIXTURE_DATA.counts.totalConnectedRecords
          : FRONT_RANGE_FIXTURE_DATA.counts.totalConnectedRecords)
      : 0;

    if (org.slug === "summit-facility-services") {
      summitFacilitySeeder.clean(session);
    } else {
      frontRangeSeeder.clean(session);
    }
    this.seededOrgs.delete(org.id);

    activityService.logActivity({
      organizationId: org.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: org.id,
      action: "demo.organization_cleaned",
      summary: `Cleaned demo records for organization '${org.name}'.`,
    });

    return { success: true, recordsRemovedCount: removed };
  }

  /**
   * Resets the demo organization back to golden baseline state.
   */
  resetDemoOrganization(session: SessionContext): { success: boolean; recordsResetCount: number } {
    this.cleanDemoOrganization(session);
    const seedResult = this.seedDemoOrganization(session);
    return { success: true, recordsResetCount: seedResult.seededEntitiesCount };
  }
}

export const demoSeedingService = new DemoSeedingService();
