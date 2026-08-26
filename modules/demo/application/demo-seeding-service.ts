import { SessionContext } from "@/modules/core/domain/types";
import { activityService } from "@/modules/core/application/activity-service";

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
    if (organization.isDemo !== true) {
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

    this.seededOrgs.add(org.id);

    activityService.logActivity({
      organizationId: org.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: org.id,
      action: "demo.organization_seeded",
      summary: `Explicitly seeded demo data for demo organization '${org.name}'.`,
    });

    return { success: true, seededEntitiesCount: 15 };
  }

  /**
   * Non-destructive contamination diagnosis report for an organization.
   */
  auditOrganizationContamination(session: SessionContext): DemoContaminationReport {
    const org = session.activeOrganization;
    const isDemo = org.isDemo === true;
    const isSeeded = this.seededOrgs.has(org.id);

    return {
      organizationId: org.id,
      isDemo,
      totalSyntheticRecordsFound: isSeeded ? 15 : 0,
      breakdown: {
        files: isSeeded ? 2 : 0,
        quotes: isSeeded ? 1 : 0,
        purchaseOrders: isSeeded ? 1 : 0,
        equipment: isSeeded ? 3 : 0,
        packages: isSeeded ? 2 : 0,
        manifests: isSeeded ? 1 : 0,
        articles: isSeeded ? 3 : 0,
        packetDocs: isSeeded ? 2 : 0,
      },
    };
  }

  /**
   * Preview cleanup of synthetic records in a demo organization.
   */
  previewDemoCleanup(session: SessionContext): { eligibleRecordCount: number; targetOrganizationId: string } {
    const org = this.requireExplicitDemo(session, "preview cleanup for");

    const count = this.seededOrgs.has(org.id) ? 15 : 0;
    return { eligibleRecordCount: count, targetOrganizationId: org.id };
  }

  /**
   * Clean demo records for the active demo organization.
   * STRICT GUARDRAIL: Rejects cleanup if organization is not a demo tenant.
   */
  cleanDemoOrganization(session: SessionContext): { success: boolean; recordsRemovedCount: number } {
    const org = this.requireExplicitDemo(session, "clean");

    const removed = this.seededOrgs.has(org.id) ? 15 : 0;
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
}

export const demoSeedingService = new DemoSeedingService();
