import {
  PortfolioItem,
  DemoGuardrailPolicy,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { authorizationService } from "../../core/application/authorization-service";

export const DEFAULT_DEMO_GUARDRAILS: DemoGuardrailPolicy = {
  interceptExternalEmails: true,
  interceptPaymentGateways: true,
  interceptExternalWebhooks: true,
  enforceSyntheticDataOnly: true,
  requireVisualWatermark: true,
  allowSelfServiceReset: true,
};

export class DemoContractService {
  private portfolioItems: PortfolioItem[] = [
    {
      id: "port_front_range",
      category: "demo",
      title: "Front Range Precision Manufacturing",
      slug: "front-range-manufacturing",
      headline: "High-Mix Precision Sheet Metal & CNC Machining",
      problemStatement: "Paper travelers and disconnected spreadsheets caused shopfloor bottlenecks and 12-day quote cycle times.",
      workflowBottleneck: "Operators lacked real-time visibility into engineering revisions, resulting in scrap and rework on the press brake.",
      solutionSummary: "Deployed Yorkstead Operations digital travelers, integrated ERP material ledgers, and automated quote-to-job conversion.",
      measuredImpact: [
        "Quote cycle time reduced from 12 days to 4 hours",
        "First-pass yield increased to 99.2%",
        "Work-in-progress visibility across 4 critical workcenters",
      ],
      demoOrganizationSlug: "front-range-manufacturing",
      tags: ["CNC Machining", "Sheet Metal", "Digital Traveler", "Quality NCR"],
      isPublished: true,
    },
    {
      id: "port_summit_facility",
      category: "demo",
      title: "Summit Facility Services",
      slug: "summit-facility-services",
      headline: "Multi-Site Commercial HVAC & Preventive Maintenance",
      problemStatement: "Fragmented maintenance logs led to emergency downtime and missed preventive maintenance intervals.",
      workflowBottleneck: "Dispatchers had no real-time technician telemetry or asset service history at the equipment level.",
      solutionSummary: "Implemented QR-tagged equipment maintenance tracking, LOTO safety workflows, and fleet uptime analytics.",
      measuredImpact: [
        "Unscheduled downtime reduced by 64%",
        "100% compliance on quarterly preventive maintenance schedules",
        "Zero lockout/tagout safety non-compliances",
      ],
      demoOrganizationSlug: "summit-facility-services",
      tags: ["Field Service", "Preventive Maintenance", "LOTO Protocols", "Fleet Analytics"],
      isPublished: true,
    },
  ];

  // 1. Verify Demo Safety Guardrails
  validateDemoIsolation(session: SessionContext): { isDemo: boolean; guardrailsActive: boolean } {
    const isDemo = session.activeOrganization.isDemo || false;
    return {
      isDemo,
      guardrailsActive: isDemo,
    };
  }

  // 2. Intercept External Side Effects for Demo Organizations
  interceptSideEffect(
    session: SessionContext,
    effectType: "email" | "payment" | "webhook" | "hardware_plc"
  ): { intercepted: boolean; reason: string } {
    if (session.activeOrganization.isDemo) {
      return {
        intercepted: true,
        reason: `Side effect '${effectType}' intercepted: Organization '${session.activeOrganization.name}' is a synthetic demo environment. Zero external side-effects allowed.`,
      };
    }
    return {
      intercepted: false,
      reason: "Live production organization; side effects permitted subject to capabilities.",
    };
  }

  // 3. List Portfolio Showcases
  listPortfolioItems(session?: SessionContext): PortfolioItem[] {
    if (session) {
      authorizationService.requireCapability(session, "org:manage_profile");
    }
    return this.portfolioItems.filter((item) => item.isPublished);
  }
}

export const demoContractService = new DemoContractService();
