import { describe, expect, it, beforeEach } from "bun:test";
import { EngagementService } from "../modules/engagements/application/engagement-service";
import { IdentityService } from "../modules/core/application/identity-service";
import { SyntheticEmailAdapter } from "../modules/core/domain/ports/email-port";
import { SessionContext } from "../modules/core/domain/types";

describe("Client Engagements & Software Delivery Vertical Slice", () => {
  let engagementService: EngagementService;
  let identityService: IdentityService;
  let yorksteadSession: SessionContext;
  let tenantBetaSession: SessionContext;

  beforeEach(() => {
    engagementService = new EngagementService();
    identityService = new IdentityService(new SyntheticEmailAdapter());

    const tenant0 = identityService.ensureTenantZero();
    yorksteadSession = identityService.getSessionContext(tenant0.user.id);

    // Create a secondary tenant organization
    const orgBeta = identityService.createOrganization(tenant0.user.id, "Client Beta Corp", "client-beta");
    tenantBetaSession = identityService.switchActiveOrganization(tenant0.user.id, orgBeta.id);
  });

  it("creates a client engagement with deliverables, tech stack, and contract value", () => {
    const engagement = engagementService.createEngagement(yorksteadSession, {
      clientName: "Alpine Robotics",
      clientContactName: "Sarah Connor",
      clientContactEmail: "sarah@alpinerobotics.com",
      title: "Warehouse Autonomous Mobile Robot (AMR) Fleet Telemetry",
      stage: "architecture_scoping",
      techStack: ["Next.js", "WebSockets", "Cloud Run", "Neon Postgres"],
      contractValueCents: 6000000, // $60,000.00
      initialDeliverables: [
        {
          title: "Real-time telemetry WebSocket gateway",
          description: "Sub-100ms state streaming for 50 active robots",
          dueDate: "2026-09-15",
        },
        {
          title: "Safety e-stop event dispatch broker",
          description: "Durable queue with SMS and audio alarm triggers",
          dueDate: "2026-09-20",
        },
      ],
    });

    expect(engagement.id).toBeDefined();
    expect(engagement.organizationId).toBe(yorksteadSession.activeOrganization.id);
    expect(engagement.clientName).toBe("Alpine Robotics");
    expect(engagement.stage).toBe("architecture_scoping");
    expect(engagement.contractValueCents).toBe(6000000);
    expect(engagement.deliverables.length).toBe(2);
    expect(engagement.deliverables[0].status).toBe("pending");
  });

  it("progresses engagement across full lifecycle stages and tracks activity audit", () => {
    const engagement = engagementService.createEngagement(yorksteadSession, {
      clientName: "Summit Logistics",
      clientContactName: "Dave Miller",
      clientContactEmail: "dave@summitlogistics.com",
      title: "Automated BOL & Cross-dock Dispatcher",
      contractValueCents: 3500000,
    });

    expect(engagement.stage).toBe("lead_intake");

    // Transition 1: Scoping
    engagementService.updateEngagementStage(yorksteadSession, engagement.id, "architecture_scoping");
    expect(engagement.stage).toBe("architecture_scoping");

    // Transition 2: Active Build
    engagementService.updateEngagementStage(yorksteadSession, engagement.id, "active_development");
    expect(engagement.stage).toBe("active_development");

    // Transition 3: Staging
    engagementService.updateEngagementStage(yorksteadSession, engagement.id, "staging_qa");
    expect(engagement.stage).toBe("staging_qa");

    // Transition 4: Production
    engagementService.updateEngagementStage(yorksteadSession, engagement.id, "production_monitored");
    expect(engagement.stage).toBe("production_monitored");

    // Verify activity trail
    expect(engagement.activity.length).toBeGreaterThanOrEqual(4);
    expect(engagement.activity[0].action).toBe("engagement.stage_changed");
  });

  it("manages SOW deliverable completion and checklist updates", () => {
    const engagement = engagementService.createEngagement(yorksteadSession, {
      clientName: "Precision Optics",
      clientContactName: "Dr. Karen Lee",
      clientContactEmail: "karen@precisionoptics.com",
      title: "Laser Calibration QA Machine Vision App",
      contractValueCents: 5000000,
    });

    const deliverable = engagementService.addDeliverable(yorksteadSession, engagement.id, {
      title: "Sub-pixel edge detection neural network",
      dueDate: "2026-09-01",
    });

    expect(deliverable.status).toBe("pending");

    // Mark completed
    const updated = engagementService.toggleDeliverable(
      yorksteadSession,
      engagement.id,
      deliverable.id,
      "completed"
    );

    expect(updated.status).toBe("completed");
    expect(updated.completedAt).toBeDefined();
  });

  it("attaches architectural drawings and contracts to Cloudflare R2 file vault", () => {
    const engagement = engagementService.createEngagement(yorksteadSession, {
      clientName: "Nordic Thermal",
      clientContactName: "Lars Lindqvist",
      clientContactEmail: "lars@nordicthermal.com",
      title: "Heat Exchanger Sensor Ingestion Network",
      contractValueCents: 4000000,
    });

    const file = engagementService.addVaultFile(yorksteadSession, engagement.id, {
      filename: "sensor_mesh_topology.pdf",
      fileType: "architecture_diagram",
      r2Key: "r2://vault/nordic/topology.pdf",
      sizeBytes: 1850000,
    });

    expect(file.id).toBeDefined();
    expect(file.filename).toBe("sensor_mesh_topology.pdf");
    expect(engagement.fileVault.length).toBe(1);
    expect(engagement.fileVault[0].r2Key).toBe("r2://vault/nordic/topology.pdf");
  });

  it("strictly enforces tenant boundary isolation and denies cross-tenant access (IDOR prevention)", () => {
    // Create engagement in Yorkstead Systems
    const engagementYorkstead = engagementService.createEngagement(yorksteadSession, {
      clientName: "Proprietary Client A",
      clientContactName: "Confidential",
      clientContactEmail: "confidential@secret.com",
      title: "Proprietary Automation Strategy",
      contractValueCents: 10000000,
    });

    // Secondary tenant (Client Beta) attempts to view Yorkstead engagement
    expect(() => {
      engagementService.getEngagementById(tenantBetaSession, engagementYorkstead.id);
    }).toThrow("Cross-Tenant Isolation Violation");

    // Secondary tenant attempts to update stage
    expect(() => {
      engagementService.updateEngagementStage(tenantBetaSession, engagementYorkstead.id, "production_monitored");
    }).toThrow("Cross-Tenant Isolation Violation");

    // Secondary tenant list must not show Yorkstead engagements
    const betaList = engagementService.listEngagements(tenantBetaSession);
    expect(betaList.find((e) => e.id === engagementYorkstead.id)).toBeUndefined();
  });

  it("calculates aggregate engagement metrics for active delivery pipeline", () => {
    const metrics = engagementService.getEngagementMetrics(yorksteadSession);

    expect(metrics.totalEngagementsCount).toBeGreaterThanOrEqual(2);
    expect(metrics.totalContractValueCents).toBeGreaterThan(0);
    expect(metrics.activeDeliveryCount).toBeGreaterThan(0);
    expect(metrics.averageDeliverableCompletionPercent).toBeGreaterThanOrEqual(0);
  });
});
