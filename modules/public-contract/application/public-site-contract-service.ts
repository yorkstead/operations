import {
  PublicDemoHealthManifest,
  PublicScenarioHealth,
  StaticFallbackData,
} from "../domain/types";
import { brand } from "../../../lib/brand";

export class PublicSiteContractService {
  private baseAppUrl = "https://ops.yorkstead.com";
  private publicSiteUrl = "https://yorkstead.com";

  // 1. Generate Public Demo Health Manifest
  getPublicDemoHealthManifest(): PublicDemoHealthManifest {
    const scenarios: PublicScenarioHealth[] = [
      {
        slug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        status: "available",
        canonicalUrl: `${this.baseAppUrl}/demo?scenario=front-range-manufacturing`,
        storyStageCount: 4,
        featuredMetrics: [
          { label: "WIP Value", value: "$142,500" },
          { label: "On-Time Rate", value: "98.7%" },
          { label: "First Pass Yield", value: "99.2%" },
        ],
      },
      {
        slug: "summit-facility-services",
        name: "Summit Facility Services",
        industry: "Commercial Facility Maintenance & Sanitation",
        status: "available",
        canonicalUrl: `${this.baseAppUrl}/demo?scenario=summit-facility-services`,
        storyStageCount: 4,
        featuredMetrics: [
          { label: "Active Sites", value: "3 Facilities" },
          { label: "Audit Quality", value: "99.4%" },
          { label: "Supply Efficiency", value: "98.1%" },
        ],
      },
      {
        slug: "mile-high-signworks",
        name: "Mile High Signworks",
        industry: "Architectural Sign Fabrication & Rigging",
        status: "available",
        canonicalUrl: `${this.baseAppUrl}/demo?scenario=mile-high-signworks`,
        storyStageCount: 3,
        featuredMetrics: [
          { label: "On-Time Installs", value: "98.2%" },
          { label: "Permit Pass Rate", value: "100.0%" },
          { label: "Avg Lead Time", value: "16 Days" },
        ],
      },
      {
        slug: "peak-mobile-detail",
        name: "Peak Mobile Detail",
        industry: "Mobile Automotive Detailing & Ceramic Quartz",
        status: "available",
        canonicalUrl: `${this.baseAppUrl}/demo?scenario=peak-mobile-detail`,
        storyStageCount: 4,
        featuredMetrics: [
          { label: "Van Utilization", value: "94.5%" },
          { label: "Avg Ticket", value: "$740.00" },
          { label: "5-Star Review Rate", value: "99.8%" },
        ],
      },
    ];

    return {
      status: "operational",
      version: brand.version,
      timestamp: new Date().toISOString(),
      appBaseUrl: this.baseAppUrl,
      publicSiteUrl: this.publicSiteUrl,
      scenarios,
    };
  }

  // 2. Validate Public Deep Link Target
  validatePublicDeepLink(targetUrl: string): { isValid: boolean; normalizedUrl: string } {
    try {
      const parsed = new URL(targetUrl);
      if (parsed.origin !== this.baseAppUrl && parsed.origin !== "http://localhost:3000") {
        return { isValid: false, normalizedUrl: `${this.baseAppUrl}/demo` };
      }
      return { isValid: true, normalizedUrl: parsed.toString() };
    } catch {
      return { isValid: false, normalizedUrl: `${this.baseAppUrl}/demo` };
    }
  }

  // 3. Get Static Fallback Evidence
  getStaticFallbackData(scenarioSlug: string): StaticFallbackData {
    const fallbacks: Record<string, StaticFallbackData> = {
      "front-range-manufacturing": {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        headline: "High-Mix Contract Manufacturing & Real-Time Traveler Routing",
        problemSummary: "Disjointed paper travelers, scrap from unverified CAD drawing revisions, and blind spots on machine downtime.",
        solutionSummary: "Digital travelers on 4kW laser cells, integer-cents quote margin enforcement, and FAI quality signoffs.",
        measuredImpact: [
          "99.2% First-Pass Inspection Yield",
          "Zero scrap parts from superseded CAD drawings",
          "100% on-time pallet dispatch with carrier BOL tracking",
        ],
        screenshotUrls: [
          "/static/demo/front-range-quote.png",
          "/static/demo/front-range-traveler.png",
          "/static/demo/front-range-quality.png",
        ],
        workflowStages: [
          "QuoteFlow RFQ Intake & Margin Policy Check",
          "Laser Cutting & Press Brake Digital Traveler Execution",
          "First Article Inspection (FAI) & NCR Containment",
          "Gross-Weight Pallet Load Builder & Carrier Dispatch",
        ],
      },
    };

    return (
      fallbacks[scenarioSlug] || {
        scenarioSlug,
        name: "Industrial Operations Showcase",
        headline: "High-Density Operations Architecture",
        problemSummary: "Fragmented factory operations and disconnected spreadsheets.",
        solutionSummary: "Unified modular monolith platform with strict multi-tenant isolation.",
        measuredImpact: ["98%+ schedule adherence", "Zero data leakage between tenant boundaries"],
        screenshotUrls: ["/static/demo/overview.png"],
        workflowStages: ["Estimating", "Shopfloor Execution", "Quality Inspection", "Logistics Dispatch"],
      }
    );
  }
}

export const publicSiteContractService = new PublicSiteContractService();
