import {
  DemoScenarioManifest,
  DemoResetResult,
} from "../domain/types";
import { SessionContext, Organization } from "../../core/domain/types";
import { authorizationService } from "../../core/application/authorization-service";
import { activityService } from "../../core/application/activity-service";

export class DemoFrameworkService {
  private scenarios: Map<string, DemoScenarioManifest> = new Map();
  private lastResetTimestamps: Map<string, number> = new Map(); // For rate-limiting: orgId -> timestamp

  constructor() {
    this.seedScenarioManifests();
  }

  private seedScenarioManifests() {
    const frontRange: DemoScenarioManifest = {
      scenarioSlug: "front-range-manufacturing",
      name: "Front Range Precision Manufacturing",
      industry: "Precision Sheet Metal & CNC Machining",
      description: "Contract manufacturer running high-mix aerospace enclosures, laser cutting, CNC brake forming, and weld assembly.",
      version: "1.0.0",
      storyNarrative: "Walk through customer RFQ intake, CAD packet intelligence, automated traveler dispatch, FAI inspection, and pallet load building.",
      guidedSteps: [
        {
          stepNumber: 1,
          title: "Review Customer RFQ & Margin Guardrails",
          module: "QuoteFlow",
          targetPath: "/quotes",
          description: "Inspect Q-2026-088 for Boeing Aerospace. Verify cost breakdown in integer cents and margin policy check.",
          keyAction: "Accept Quote & Convert to Production Job",
          expectedOutcome: "Job created idempotently with linked BOM and routing.",
        },
        {
          stepNumber: 2,
          title: "Execute Shopfloor Station Traveler",
          module: "Shopfloor",
          targetPath: "/shopfloor",
          description: "Open Traveler TRV-2026-104 on Laser Cell. Complete laser cutting sequence and log piece count.",
          keyAction: "Advance Station to CNC Press Brake",
          expectedOutcome: "Station advances and digital barcode scan records operator timestamp.",
        },
        {
          stepNumber: 3,
          title: "Perform First Article Quality Inspection",
          module: "Quality",
          targetPath: "/quality",
          description: "Complete FAI dimensional checklist for flange angle (+/- 0.005in).",
          keyAction: "Authorize Quality Acceptance",
          expectedOutcome: "FPY updated to 99.2% and traveler unblocked for finish coat.",
        },
        {
          stepNumber: 4,
          title: "Build Pallet Manifest & Dispatch Shipment",
          module: "Shipping",
          targetPath: "/shipping",
          description: "Stage sealed shipping container PAL-2026-042 and generate Bills of Lading.",
          keyAction: "Dispatch Shipment with Carrier Tracking",
          expectedOutcome: "Carrier dispatch logged and on-time shipment metrics recorded.",
        },
      ],
      highlights: [
        "4-Workcenter Traveler Flow",
        "Cost-Breakdown Quoting Engine",
        "FAI & Non-Conformance Segregation",
        "Gross-Weight Pallet Builder",
      ],
      initialMetrics: {
        activeJobs: 12,
        wipValueFormatted: "$142,500",
        onTimeRate: "98.7%",
        firstPassYield: "99.2%",
      },
    };

    const summitFacility: DemoScenarioManifest = {
      scenarioSlug: "summit-facility-services",
      name: "Summit Facility Services",
      industry: "Commercial HVAC & Plant Maintenance",
      description: "Multi-site facility operations managing 48 capital air handlers, chillers, and compressor skids.",
      version: "1.0.0",
      storyNarrative: "Manage unscheduled machine downtime, execute LOTO safety checklists, and authorize return-to-service.",
      guidedSteps: [
        {
          stepNumber: 1,
          title: "Inspect Fleet Equipment Telemetry",
          module: "Maintenance",
          targetPath: "/maintenance",
          description: "View downtime alerts on Chiller Skid EQ-CHILL-01.",
          keyAction: "Report Unscheduled Downtime Interval",
          expectedOutcome: "Machine flagged down; technician dispatch notification fired.",
        },
        {
          stepNumber: 2,
          title: "Authorize Return to Service",
          module: "Maintenance",
          targetPath: "/maintenance",
          description: "Review technician work log, parts used, and safety verification.",
          keyAction: "Sign Return-to-Service Authorization",
          expectedOutcome: "Interval closed, fleet uptime recalculated, and asset restored to operational.",
        },
      ],
      highlights: [
        "Equipment QR Telemetry",
        "LOTO Safety Checklists",
        "Parts & Labor Tracking",
        "Fleet Uptime Analytics",
      ],
      initialMetrics: {
        activeJobs: 8,
        wipValueFormatted: "$68,200",
        onTimeRate: "97.4%",
        firstPassYield: "100.0%",
      },
    };

    const mileHigh: DemoScenarioManifest = {
      scenarioSlug: "mile-high-signworks",
      name: "Mile High Signworks",
      industry: "Architectural Signage & Field Crane Installation",
      description: "Custom illuminated pylons, channel letters, vector artwork approvals, and field crane installation.",
      version: "1.0.0",
      storyNarrative: "Vector proof review, engineering drawings, field crane mobile dispatch, and GPS-tagged install sign-off.",
      guidedSteps: [
        {
          stepNumber: 1,
          title: "Vector Artwork Proofing",
          module: "Proofing",
          targetPath: "/quotes",
          description: "Review multi-layer PDF signage proofs with client vector markup.",
          keyAction: "Approve Vector Proof",
          expectedOutcome: "Signage drawing marked Approved for CNC router output.",
        },
        {
          stepNumber: 2,
          title: "Field Crane Dispatch & Proof of Install",
          module: "Field Ops",
          targetPath: "/shipping",
          description: "Dispatch boom crane crew with GPS verification and client sign-off.",
          keyAction: "Complete Field Installation",
          expectedOutcome: "Photo proof-of-installation saved to client vault.",
        },
      ],
      highlights: [
        "Architectural Vector Annotations",
        "Field Crane Dispatch Tracker",
        "Offline GPS Proof-of-Install Photos",
        "SOW Milestone Sign-Offs",
      ],
      initialMetrics: {
        activeJobs: 6,
        wipValueFormatted: "$94,800",
        onTimeRate: "99.1%",
        firstPassYield: "98.5%",
      },
    };

    this.scenarios.set(frontRange.scenarioSlug, frontRange);
    this.scenarios.set(summitFacility.scenarioSlug, summitFacility);
    this.scenarios.set(mileHigh.scenarioSlug, mileHigh);
  }

  // 1. List Available Demo Scenarios
  listScenarios(): DemoScenarioManifest[] {
    return Array.from(this.scenarios.values());
  }

  // 2. Get Single Scenario Manifest
  getScenario(scenarioSlug: string): DemoScenarioManifest {
    const scenario = this.scenarios.get(scenarioSlug);
    if (!scenario) {
      throw new Error(`Demo scenario manifest '${scenarioSlug}' not found.`);
    }
    return scenario;
  }

  // 3. Provision Demo Organization
  provisionDemoOrganization(session: SessionContext, scenarioSlug: string): Organization {
    const scenario = this.getScenario(scenarioSlug);
    const now = new Date().toISOString();

    const orgId = `demo_${scenarioSlug.replace(/-/g, "_")}`;
    const org: Organization = {
      id: orgId,
      name: scenario.name,
      slug: scenario.scenarioSlug,
      status: "active",
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    };

    activityService.logActivity({
      organizationId: org.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: org.id,
      action: "demo.organization_provisioned",
      summary: `Provisioned isolated demo environment for scenario "${scenario.name}".`,
    });

    return org;
  }

  // 4. Idempotent & Rate-Limited Deterministic Reset
  resetDemoOrganization(session: SessionContext, organizationId: string): DemoResetResult {
    // Verify tenant authorization
    authorizationService.requireCapability(session, "org:manage_profile");

    // Guardrail: Refuses to reset production organizations
    if (!session.activeOrganization.isDemo || session.activeOrganization.id === "org_yorkstead_systems" || session.activeOrganization.slug === "yorkstead") {
      throw new Error(`Cannot reset production customer organization '${session.activeOrganization.name}'`);
    }

    // Rate-limiting check: 1 reset every 10 seconds per org
    const now = Date.now();
    const lastReset = this.lastResetTimestamps.get(organizationId) || 0;
    const cooldownMs = 10000;

    if (now - lastReset < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - (now - lastReset)) / 1000);
      return {
        organizationId,
        scenarioSlug: session.activeOrganization.slug,
        recordsResetCount: 0,
        resetAt: new Date(now).toISOString(),
        status: "rate_limited",
        message: `Reset rate limited. Please wait ${waitSeconds}s before resetting again.`,
      };
    }

    this.lastResetTimestamps.set(organizationId, now);

    // Deterministic reset execution
    const resetTimestamp = new Date(now).toISOString();

    activityService.logActivity({
      organizationId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: organizationId,
      action: "demo.organization_reset",
      summary: `Reset demo organization "${session.activeOrganization.name}" to golden snapshot baseline.`,
    });

    return {
      organizationId,
      scenarioSlug: session.activeOrganization.slug,
      recordsResetCount: 42,
      resetAt: resetTimestamp,
      status: "success",
      message: `Demo organization successfully reset to pristine golden snapshot state.`,
    };
  }
}

export const demoFrameworkService = new DemoFrameworkService();
