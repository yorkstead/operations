import {
  ClientEngagement,
  EngagementStage,
  EngagementDeliverable,
  EngagementFileVaultItem,
  EngagementMetricsSummary,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";

export class EngagementService {
  private engagements: Map<string, ClientEngagement> = new Map();

  constructor() {
    this.seedDefaultEngagements("org_yorkstead_systems");
  }

  private seedDefaultEngagements(orgId: string) {
    const defaultEngagements: ClientEngagement[] = [
      {
        id: "eng_front_range_erp",
        organizationId: orgId,
        clientName: "Front Range Precision Manufacturing",
        clientContactName: "Marcus Vance",
        clientContactEmail: "m.vance@frontrangemfg.com",
        title: "Digital Traveler & Shopfloor Dispatch Engine",
        stage: "active_development",
        repositoryUrl: "https://github.com/Yorkstead-Systems/front-range-traveler",
        stagingUrl: "https://staging.frontrange.yorkstead.com",
        productionUrl: "https://ops.frontrangemfg.com",
        techStack: ["Next.js", "Cloud Run", "Neon Postgres", "Tailwind", "Cloudflare R2"],
        contractValueCents: 4500000, // $45,000.00
        milestones: [
          {
            id: "ms_1",
            title: "Architecture & Schema Scoping",
            targetDate: "2026-08-15",
            completed: true,
          },
          {
            id: "ms_2",
            title: "Shopfloor Execution & QR Routing",
            targetDate: "2026-09-01",
            completed: false,
          },
          {
            id: "ms_3",
            title: "Production Cutover & Staff Training",
            targetDate: "2026-09-15",
            completed: false,
          },
        ],
        deliverables: [
          {
            id: "del_1",
            title: "Multi-tenant inventory movement ledger & schema migration",
            description: "Postgres schema with ACID balance constraints and advisory lock migration runner.",
            status: "completed",
            dueDate: "2026-08-20",
            completedAt: "2026-08-19T14:30:00Z",
          },
          {
            id: "del_2",
            title: "Station terminal scanner with QR badge authentication",
            description: "PWA tablet interface with barcode camera scanner and offline capability.",
            status: "in_progress",
            dueDate: "2026-08-28",
          },
          {
            id: "del_3",
            title: "ERP sync worker for QuickBooks & purchasing integration",
            description: "Cloud Run worker service with durable exponential backoff queue.",
            status: "pending",
            dueDate: "2026-09-05",
          },
        ],
        fileVault: [
          {
            id: "fv_1",
            filename: "system_architecture_diagram_v2.pdf",
            fileType: "architecture_diagram",
            r2Key: "vault/front-range/arch-v2.pdf",
            sizeBytes: 2450000,
            uploadedAt: "2026-08-12T10:00:00Z",
          },
          {
            id: "fv_2",
            filename: "signed_sow_deliverables_contract.pdf",
            fileType: "sow_contract",
            r2Key: "vault/front-range/sow-signed.pdf",
            sizeBytes: 1120000,
            uploadedAt: "2026-08-10T16:00:00Z",
          },
        ],
        secrets: [
          {
            id: "sec_1",
            key: "DATABASE_CONNECTION_POOL",
            description: "Neon Postgres read-write connection pool URI for staging.",
            storageRef: "r2://secrets/front-range/db-staging.enc",
            updatedAt: "2026-08-14T11:00:00Z",
          },
        ],
        activity: [
          {
            id: "act_1",
            actorName: "Brandon",
            action: "engagement.milestone_completed",
            summary: "Completed Milestone 1: Architecture & Schema Scoping.",
            timestamp: "2026-08-15T18:00:00Z",
          },
          {
            id: "act_2",
            actorName: "Brandon",
            action: "engagement.deliverable_updated",
            summary: "Marked inventory movement ledger deliverable completed.",
            timestamp: "2026-08-19T14:30:00Z",
          },
        ],
        createdAt: "2026-08-01T09:00:00Z",
        updatedAt: "2026-08-19T14:30:00Z",
      },
      {
        id: "eng_mile_high_signworks",
        organizationId: orgId,
        clientName: "Mile High Signworks",
        clientContactName: "Elena Rostova",
        clientContactEmail: "elena@milehighsigns.com",
        title: "Architectural Signage Vector Proofing & Crane Field Install App",
        stage: "staging_qa",
        repositoryUrl: "https://github.com/Yorkstead-Systems/mile-high-signworks-app",
        stagingUrl: "https://staging.milehigh.yorkstead.com",
        productionUrl: "https://ops.milehighsigns.com",
        techStack: ["Next.js", "PostgreSQL", "Cloudflare R2", "Tailwind"],
        contractValueCents: 3200000, // $32,000.00
        milestones: [
          {
            id: "ms_m1",
            title: "Client Portal & Vector Proof Approval",
            targetDate: "2026-08-10",
            completed: true,
          },
          {
            id: "ms_m2",
            title: "Field Crane Installer Mobile Dispatch",
            targetDate: "2026-08-25",
            completed: true,
          },
        ],
        deliverables: [
          {
            id: "del_m1",
            title: "PDF vector annotation engine for architectural sign approvals",
            status: "completed",
            dueDate: "2026-08-10",
            completedAt: "2026-08-09T17:00:00Z",
          },
          {
            id: "del_m2",
            title: "Offline photo proof-of-install sync with GPS tagging",
            status: "completed",
            dueDate: "2026-08-24",
            completedAt: "2026-08-24T12:00:00Z",
          },
        ],
        fileVault: [
          {
            id: "fv_m1",
            filename: "mile_high_crane_sow.pdf",
            fileType: "sow_contract",
            r2Key: "vault/mile-high/sow.pdf",
            sizeBytes: 980000,
            uploadedAt: "2026-08-05T09:00:00Z",
          },
        ],
        secrets: [],
        activity: [],
        createdAt: "2026-08-02T10:00:00Z",
        updatedAt: "2026-08-24T12:00:00Z",
      },
      {
        id: "eng_denver_express_reworkflow",
        organizationId: orgId,
        clientName: "Denver Express Warehousing & No Limit Trucking",
        clientContactName: "Steve Chapman / Dale Burget",
        clientContactEmail: "schapman@denverexpressco.com",
        title: "ReworkFlow™ Cross-Dock Intake & Terminal Platform",
        stage: "staging_qa",
        repositoryUrl: "https://github.com/yorkstead/rework-flow.git",
        stagingUrl: "https://rework.yorkstead.com",
        productionUrl: "https://rework.denverexpressco.com",
        techStack: ["Next.js", "Web Audio API", "Tailwind", "Cloudflare R2", "Android PWA"],
        contractValueCents: 950000, // $9,500.00
        milestones: [
          {
            id: "ms_de_1",
            title: "50% Buyout Deposit & Cloud Architecture Provisioning",
            targetDate: "2026-09-04",
            completed: true,
          },
          {
            id: "ms_de_2",
            title: "30% Staging Deployment & 6030 Washington St Dock Walkthrough",
            targetDate: "2026-09-12",
            completed: true,
          },
          {
            id: "ms_de_3",
            title: "20% Live Forklift Terminal Go-Live & SpinFlow Agency Handover",
            targetDate: "2026-09-20",
            completed: false,
          },
        ],
        deliverables: [
          {
            id: "del_de_1",
            title: "Driver self-service bay hold portal (/reserve) with 45-min hold",
            description: "Instant rework rate calculator ($450-$550) with automated bay countdown lock.",
            status: "completed",
            dueDate: "2026-09-04",
            completedAt: "2026-09-04T10:00:00Z",
          },
          {
            id: "del_de_2",
            title: "Forklift glove-friendly touchscreen terminal (/dock)",
            description: "High-contrast roll-cage UI with camera intake, pallet breakdown, and driver signature.",
            status: "completed",
            dueDate: "2026-09-04",
            completedAt: "2026-09-04T10:30:00Z",
          },
          {
            id: "del_de_3",
            title: "Dispatcher operations board (/office) with Web Audio chimes & QuickBooks CSV",
            description: "Live bay occupancy monitor, audible arrival alert chimes, and 1-click broker billing export.",
            status: "completed",
            dueDate: "2026-09-04",
            completedAt: "2026-09-04T11:00:00Z",
          },
          {
            id: "del_de_4",
            title: "Forklift hardware deployment (HOTWAV R9 Pro + RAM Tough-Claw mount)",
            description: "Turnkey rugged 11-inch Android 14 tablet and vibration-damped roll-cage clamp installation.",
            status: "in_progress",
            dueDate: "2026-09-12",
          },
          {
            id: "del_de_5",
            title: "SpinFlow.ai web agency handover & DNS cutover to rework.denverexpressco.com",
            description: "Full GitHub repository handover, zero vendor lock-in documentation, and Cloudflare DNS routing.",
            status: "pending",
            dueDate: "2026-09-20",
          },
        ],
        fileVault: [
          {
            id: "fv_de_1",
            filename: "Denver_Express_ReworkFlow_Master_Brief.pdf",
            fileType: "sow_contract",
            r2Key: "vault/denver-express/Denver_Express_ReworkFlow_Master_Brief.pdf",
            sizeBytes: 1420000,
            uploadedAt: "2026-09-04T09:00:00Z",
          },
          {
            id: "fv_de_2",
            filename: "Denver_Express_ReworkFlow_Deal_Kit.zip",
            fileType: "asset",
            r2Key: "vault/denver-express/Denver_Express_ReworkFlow_Deal_Kit.zip",
            sizeBytes: 4850000,
            uploadedAt: "2026-09-04T09:30:00Z",
          },
        ],
        secrets: [
          {
            id: "sec_de_1",
            key: "REWORKFLOW_ADMIN_KEY",
            description: "Production supervisor administrative key for Denver Express dock terminal override.",
            storageRef: "r2://secrets/denver-express/admin-token.enc",
            updatedAt: "2026-09-04T10:00:00Z",
          },
        ],
        activity: [
          {
            id: "act_de_1",
            actorName: "Brandon",
            action: "engagement.created",
            summary: "Initialized ReworkFlow™ client engagement for Denver Express & No Limit Trucking ($9,500 Buyout).",
            timestamp: "2026-09-04T08:30:00Z",
          },
          {
            id: "act_de_2",
            actorName: "Brandon",
            action: "engagement.milestone_completed",
            summary: "Completed Milestone 1: 50% Buyout Deposit & Cloud Architecture Provisioning.",
            timestamp: "2026-09-04T09:00:00Z",
          },
          {
            id: "act_de_3",
            actorName: "Brandon",
            action: "engagement.staging_deployed",
            summary: "Deployed ReworkFlow™ production staging to rework.yorkstead.com.",
            timestamp: "2026-09-04T10:00:00Z",
          },
        ],
        createdAt: "2026-09-04T08:30:00Z",
        updatedAt: "2026-09-04T11:00:00Z",
      },
    ];

    for (const eng of defaultEngagements) {
      this.engagements.set(eng.id, eng);
    }
  }

  // 1. Create Engagement
  createEngagement(
    session: SessionContext,
    params: {
      clientName: string;
      clientContactName: string;
      clientContactEmail: string;
      title: string;
      stage?: EngagementStage;
      repositoryUrl?: string;
      stagingUrl?: string;
      productionUrl?: string;
      techStack?: string[];
      contractValueCents: number;
      initialDeliverables?: Array<{ title: string; description?: string; dueDate?: string }>;
    }
  ): ClientEngagement {
    const orgId = session.activeOrganization.id;
    const now = new Date().toISOString();
    const id = `eng_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const deliverables: EngagementDeliverable[] = (params.initialDeliverables || []).map((d, index) => ({
      id: `del_${Date.now()}_${index}`,
      title: d.title,
      description: d.description,
      status: "pending",
      dueDate: d.dueDate,
    }));

    const engagement: ClientEngagement = {
      id,
      organizationId: orgId,
      clientName: params.clientName.trim(),
      clientContactName: params.clientContactName.trim(),
      clientContactEmail: params.clientContactEmail.toLowerCase().trim(),
      title: params.title.trim(),
      stage: params.stage || "lead_intake",
      repositoryUrl: params.repositoryUrl?.trim(),
      stagingUrl: params.stagingUrl?.trim(),
      productionUrl: params.productionUrl?.trim(),
      techStack: params.techStack || ["Next.js", "Cloud Run", "PostgreSQL", "Tailwind"],
      contractValueCents: params.contractValueCents,
      milestones: [
        {
          id: `ms_${Date.now()}_1`,
          title: "Scoping & Architecture",
          targetDate: "Sprint 1",
          completed: false,
        },
      ],
      deliverables,
      fileVault: [],
      secrets: [],
      activity: [
        {
          id: `act_${Date.now()}`,
          actorName: session.user.name,
          action: "engagement.created",
          summary: `Engagement '${params.title}' created for ${params.clientName}.`,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.engagements.set(id, engagement);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: id,
      action: "engagement.created",
      summary: `Created client engagement '${engagement.title}' for ${engagement.clientName}.`,
    });

    return engagement;
  }

  // 2. Get Engagement (Strict Tenant Isolation)
  getEngagementById(session: SessionContext, engagementId: string): ClientEngagement {
    const engagement = this.engagements.get(engagementId);
    if (!engagement) {
      throw new Error(`Engagement '${engagementId}' not found.`);
    }

    const isYorksteadMatch =
      (session.activeOrganization.slug === "yorkstead" || session.activeOrganization.id === "org_yorkstead_systems") &&
      (engagement.organizationId === "org_yorkstead_systems" || engagement.organizationId === session.activeOrganization.id);

    if (engagement.organizationId !== session.activeOrganization.id && !isYorksteadMatch) {
      throw new Error(
        `Cross-Tenant Isolation Violation: Active organization (${session.activeOrganization.id}) cannot access engagement (${engagementId}) belonging to ${engagement.organizationId}.`
      );
    }

    return engagement;
  }

  // 3. List Engagements (Tenant Filtered)
  listEngagements(session: SessionContext): ClientEngagement[] {
    const orgId = session.activeOrganization.id;
    const isYorkstead = session.activeOrganization.slug === "yorkstead" || orgId === "org_yorkstead_systems";

    return Array.from(this.engagements.values())
      .filter((e) => e.organizationId === orgId || (isYorkstead && e.organizationId === "org_yorkstead_systems"))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // 4. Update Engagement Stage
  updateEngagementStage(
    session: SessionContext,
    engagementId: string,
    newStage: EngagementStage
  ): ClientEngagement {
    const engagement = this.getEngagementById(session, engagementId);
    const now = new Date().toISOString();
    const oldStage = engagement.stage;

    engagement.stage = newStage;
    engagement.updatedAt = now;

    const activityEntry = {
      id: `act_${Date.now()}`,
      actorName: session.user.name,
      action: "engagement.stage_changed",
      summary: `Stage transitioned from ${oldStage} to ${newStage}.`,
      timestamp: now,
    };

    engagement.activity.unshift(activityEntry);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: engagementId,
      action: "engagement.stage_changed",
      summary: `Engagement '${engagement.title}' stage moved to ${newStage}.`,
    });

    return engagement;
  }

  // 5. Add Deliverable to Engagement
  addDeliverable(
    session: SessionContext,
    engagementId: string,
    params: { title: string; description?: string; dueDate?: string }
  ): EngagementDeliverable {
    const engagement = this.getEngagementById(session, engagementId);
    const deliverableId = `del_${Date.now()}`;

    const deliverable: EngagementDeliverable = {
      id: deliverableId,
      title: params.title.trim(),
      description: params.description?.trim(),
      status: "pending",
      dueDate: params.dueDate,
    };

    engagement.deliverables.push(deliverable);
    engagement.updatedAt = new Date().toISOString();

    return deliverable;
  }

  // 6. Toggle Deliverable Status
  toggleDeliverable(
    session: SessionContext,
    engagementId: string,
    deliverableId: string,
    status: EngagementDeliverable["status"]
  ): EngagementDeliverable {
    const engagement = this.getEngagementById(session, engagementId);
    const deliverable = engagement.deliverables.find((d) => d.id === deliverableId);

    if (!deliverable) {
      throw new Error(`Deliverable '${deliverableId}' not found in engagement '${engagementId}'.`);
    }

    deliverable.status = status;
    if (status === "completed") {
      deliverable.completedAt = new Date().toISOString();
    } else {
      deliverable.completedAt = undefined;
    }

    engagement.updatedAt = new Date().toISOString();
    return deliverable;
  }

  // 7. Add File to Cloudflare R2 Vault
  addVaultFile(
    session: SessionContext,
    engagementId: string,
    params: {
      filename: string;
      fileType: EngagementFileVaultItem["fileType"];
      r2Key: string;
      sizeBytes: number;
    }
  ): EngagementFileVaultItem {
    const engagement = this.getEngagementById(session, engagementId);
    const fileId = `fv_${Date.now()}`;

    const item: EngagementFileVaultItem = {
      id: fileId,
      filename: params.filename.trim(),
      fileType: params.fileType,
      r2Key: params.r2Key.trim(),
      sizeBytes: params.sizeBytes,
      uploadedAt: new Date().toISOString(),
    };

    engagement.fileVault.push(item);
    engagement.updatedAt = new Date().toISOString();

    return item;
  }

  // 8. Metrics Summary
  getEngagementMetrics(session: SessionContext): EngagementMetricsSummary {
    const list = this.listEngagements(session);

    let totalContractValueCents = 0;
    let totalDeliverables = 0;
    let completedDeliverables = 0;

    const stageCounts: Record<EngagementStage, number> = {
      lead_intake: 0,
      architecture_scoping: 0,
      active_development: 0,
      staging_qa: 0,
      production_monitored: 0,
      completed: 0,
    };

    for (const eng of list) {
      totalContractValueCents += eng.contractValueCents;
      stageCounts[eng.stage] = (stageCounts[eng.stage] || 0) + 1;

      for (const d of eng.deliverables) {
        totalDeliverables++;
        if (d.status === "completed") {
          completedDeliverables++;
        }
      }
    }

    const activeDeliveryCount =
      stageCounts.active_development + stageCounts.staging_qa + stageCounts.architecture_scoping;

    const averageDeliverableCompletionPercent =
      totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

    return {
      totalEngagementsCount: list.length,
      activeDeliveryCount,
      totalContractValueCents,
      averageDeliverableCompletionPercent,
      stageCounts,
    };
  }
}

export const engagementService = new EngagementService();
