import type { PresenterScenario } from "../domain/sales-presenter";

export const PRESENTER_PASSCODE = "yorkstead-presenter-2026";

export const presenterScenarios: PresenterScenario[] = [
  {
    scenarioSlug: "front-range-manufacturing",
    scenarioName: "Front Range Precision Manufacturing",
    industry: "High-Mix Precision Sheet Metal & CNC Machining",
    checkpointName: "Baseline Release 2026-Q1",
    targetAudience: "Shop Owners, VP of Operations, General Managers",
    executiveSummary: "Walk prospects through integer-cents quoting with margin guardrails, laser cell traveler execution with CAD revision lock, FAI inspection, and pallet freight dispatch.",
    supportedRoles: ["executive_owner", "commercial_estimator", "shopfloor_lead", "quality_manager"],
    steps: [
      {
        id: "frm-step-1",
        stepNumber: 1,
        title: "Quote-to-Job Estimating & Margin Guardrails",
        targetRoute: "/quotes",
        customerFriction: "Estimators spend 45 minutes per RFQ in spreadsheets, frequently missing laser setup time or material yield loss.",
        yorksteadSolution: "Automated integer-cent machine run rates with executive margin threshold warnings (<25% margin alerts).",
        talkTrack: "Notice how QuoteFlow calculates exact material yield and machine hours. If the estimator drops margin below the 25% company policy, the system alerts before release.",
        suggestedAction: "Click 'Convert to Live Job' to generate traveler packet SGN-2026-09 with zero duplicate entry.",
        uiHighlightKey: "quoteflow-convert-action",
      },
      {
        id: "frm-step-2",
        stepNumber: 2,
        title: "Laser Cell Shopfloor Traveler & Drawing Lock",
        targetRoute: "/shopfloor",
        customerFriction: "Operators cut from outdated PDF printouts on clipboards, resulting in expensive sheet metal scrap.",
        yorksteadSolution: "Touch-optimized digital traveler with vector CAD drawing lock (Rev C) and live machine blocker reporting.",
        talkTrack: "The operator sees the exact CAD drawing revision locked by engineering. If assist-gas pressure drops, they log a blocker in one tap.",
        suggestedAction: "Select the 6kW Fiber Laser operation and complete the traveler step with timestamped operator attribution.",
        uiHighlightKey: "shopfloor-step-signoff",
      },
      {
        id: "frm-step-3",
        stepNumber: 3,
        title: "First Article Inspection (FAI) & NCR Quarantine",
        targetRoute: "/quality",
        customerFriction: "Quality bottlenecks delay shipping while paper inspection sheets wait for manager signoffs.",
        yorksteadSolution: "Digital dimensional FAI checklist with segregated scrap/rework disposition authority.",
        talkTrack: "Quality inspectors record caliper measurements. If out of tolerance, the lot is instantly quarantined with segregation of duties.",
        suggestedAction: "Review the passed FAI record and verify the inspector stamp.",
        uiHighlightKey: "quality-fai-stamp",
      },
      {
        id: "frm-step-4",
        stepNumber: 4,
        title: "Pallet Load Building & Freight Dispatch",
        targetRoute: "/shipping",
        customerFriction: "Overloaded pallets get rejected at the freight dock, leading to missed customer delivery commitments.",
        yorksteadSolution: "Automated container capacity constraints, gross weight math (1,420 lbs), and carrier BOL manifest generator.",
        talkTrack: "The shipping lead builds the pallet, confirms gross weight limits, and generates carrier BOL paperwork in seconds.",
        suggestedAction: "Dispatch shipment and review the electronic proof-of-delivery trail.",
        uiHighlightKey: "shipping-dispatch-action",
      },
    ],
  },
  {
    scenarioSlug: "summit-facility-services",
    scenarioName: "Summit Facility Services",
    industry: "Commercial HVAC & Multi-Site Facility Maintenance",
    checkpointName: "Facility Baseline Alpha",
    targetAudience: "Director of Facilities, Plant Operations Managers",
    executiveSummary: "Showcase capital chiller telemetry, LOTO lockout safety signoffs, citation-backed KnowHow SOPs, and fleet uptime analytics.",
    supportedRoles: ["executive_owner", "shopfloor_lead", "field_technician"],
    steps: [
      {
        id: "sfs-step-1",
        stepNumber: 1,
        title: "Capital Equipment Telemetry & Runtime Monitoring",
        targetRoute: "/maintenance",
        customerFriction: "Chillers fail unexpectedly without runtime trend visibility, causing emergency tenant shutdowns.",
        yorksteadSolution: "Live equipment runtime tracking and interval alerting.",
        talkTrack: "Demonstrate how equipment runtime intervals flag upcoming 2,000-hour compressor oil overhauls before breakdown.",
        suggestedAction: "Inspect Chiller CH-01 telemetry and open preventive work order WO-8842.",
        uiHighlightKey: "maintenance-telemetry-card",
      },
      {
        id: "sfs-step-2",
        stepNumber: 2,
        title: "Lockout/Tagout (LOTO) Verified Safety Signoff",
        targetRoute: "/maintenance",
        customerFriction: "OSHA compliance violations and hazardous energy risks during compressor teardowns.",
        yorksteadSolution: "Multi-point verified LOTO checklist with dual-technician signoff requirements.",
        talkTrack: "Safety protocol requires zero-energy verification before the maintenance ticket can transition to in-progress.",
        suggestedAction: "Complete LOTO verification checklist with technician badge attribution.",
        uiHighlightKey: "loto-signoff-checklist",
      },
      {
        id: "sfs-step-3",
        stepNumber: 3,
        title: "KnowHow Citation-Backed Troubleshooting SOPs",
        targetRoute: "/knowledge",
        customerFriction: "Junior technicians misdiagnose complex chiller error codes without senior techs on-site.",
        yorksteadSolution: "Structured operational knowledge base with direct OEM manual citations.",
        talkTrack: "Show how searchable SOPs give field techs instant, verified diagnostic procedures for York and Trane chillers.",
        suggestedAction: "Search 'Low Suction Pressure' and open the verified diagnostic SOP.",
        uiHighlightKey: "knowledge-sop-search",
      },
      {
        id: "sfs-step-4",
        stepNumber: 4,
        title: "Executive Uptime & Capacity Analytics",
        targetRoute: "/analytics",
        customerFriction: "Owners lack visibility into preventive maintenance ratio and machine uptime trends.",
        yorksteadSolution: "Executive KPI dashboard showing 97.4% equipment uptime and planned vs reactive work.",
        talkTrack: "Highlight the executive analytics dashboard aggregating uptime across all multi-site commercial facilities.",
        suggestedAction: "Review overall fleet uptime KPIs.",
        uiHighlightKey: "analytics-uptime-kpi",
      },
    ],
  },
  {
    scenarioSlug: "mile-high-signworks",
    scenarioName: "Mile High Signworks",
    industry: "Architectural Signage & Boom Crane Rigging",
    checkpointName: "Signworks Golden State",
    targetAudience: "Sign Company Owners, Production Managers",
    executiveSummary: "Illustrate architectural sign fabrication with vector CAD revision gates, city electrical permits, CNC routing, and crane rigging.",
    supportedRoles: ["executive_owner", "commercial_estimator", "shopfloor_lead", "field_technician"],
    steps: [
      {
        id: "mhs-step-1",
        stepNumber: 1,
        title: "Vector CAD Client Revision Gate",
        targetRoute: "/shopfloor",
        customerFriction: "Custom signs routed before final client vector art approval result in wasted acrylic and channel letter stock.",
        yorksteadSolution: "Engineering drawing gate requiring client Rev C approval before releasing to CNC router.",
        talkTrack: "Demonstrate how the system blocks machine routing until the client-approved vector drawing is cryptographically locked.",
        suggestedAction: "Verify drawing Rev C lock on project SGN-2026-09.",
        uiHighlightKey: "signworks-vector-lock",
      },
      {
        id: "mhs-step-2",
        stepNumber: 2,
        title: "City Electrical Permit & UL 48 Listing Vault",
        targetRoute: "/files",
        customerFriction: "Installation crews arrive on-site without city electrical permits, delaying installation.",
        yorksteadSolution: "Document vault tying city permit PERMIT-DEN-2026-881 and UL 48 listing directly to the job traveler.",
        talkTrack: "Both the shop and the rigging crew carry authorized, expiring URLs to the city permit and UL wiring schematic.",
        suggestedAction: "Open the authorized city electrical permit.",
        uiHighlightKey: "signworks-permit-link",
      },
      {
        id: "mhs-step-3",
        stepNumber: 3,
        title: "Multi-Stage Architectural Fabrication",
        targetRoute: "/shopfloor",
        customerFriction: "Channel letter fabrication requires 5 discrete stages with separate trades (routing, returns, LED wiring, vinyl face, assembly).",
        yorksteadSolution: "Stage-by-stage digital travelers tracking exact work center progress.",
        talkTrack: "Each trade signs off on their station before the sign transitions to electrical testing and crane staging.",
        suggestedAction: "Sign off on LED wiring bench test.",
        uiHighlightKey: "signworks-led-signoff",
      },
      {
        id: "mhs-step-4",
        stepNumber: 4,
        title: "Boom Crane Rigging & Night Illumination Proof",
        targetRoute: "/shipping",
        customerFriction: "Disputed installations and claims of non-functional illumination after crane departure.",
        yorksteadSolution: "45ft boom crane dispatch manifest with required night illumination photo proof-of-work.",
        talkTrack: "The installation crew uploads geotagged night illumination photos before closing the contract.",
        suggestedAction: "Review installation proof photo and close out job traveler.",
        uiHighlightKey: "signworks-crane-closeout",
      },
    ],
  },
  {
    scenarioSlug: "peak-mobile-detail",
    scenarioName: "Peak Mobile Detail",
    industry: "Mobile Detailing & Ceramic Quartz Services",
    checkpointName: "Mobile Van Fleet Gold",
    targetAudience: "Mobile Detailers, Fleet Operations Managers",
    executiveSummary: "Demonstrate phone-first technician execution, ultrasonic clearcoat paint depth mapping, digital add-on consent, and simulated card capture.",
    supportedRoles: ["executive_owner", "field_technician"],
    steps: [
      {
        id: "pmd-step-1",
        stepNumber: 1,
        title: "Intake Ultrasonic Paint Depth Telemetry",
        targetRoute: "/shopfloor",
        customerFriction: "Technicians compound thin clearcoat on exotic vehicles without measuring paint depth, burning paint.",
        yorksteadSolution: "Intake inspection mapping ultrasonic paint readings (135µm safe threshold) across vehicle panels.",
        talkTrack: "Show how the mobile intake form records paint depth readings across 6 panels on a 2024 Porsche 911 GT3 RS.",
        suggestedAction: "Verify clearcoat depth readings are within the 135µm safe compound threshold.",
        uiHighlightKey: "paint-depth-telemetry",
      },
      {
        id: "pmd-step-2",
        stepNumber: 2,
        title: "Phone-First 6-Stage Mobile Checklist",
        targetRoute: "/quality",
        customerFriction: "Field technicians skip decontamination or ceramic cure steps on long hot summer days.",
        yorksteadSolution: "Touch-optimized phone checklist guiding multi-stage foam wash, iron decon, 2-stage polish, and ceramic cure.",
        talkTrack: "The technician completes each stage with large mobile-friendly buttons designed for wet/gloved hands.",
        suggestedAction: "Check off 2-stage paint correction and ceramic quartz application.",
        uiHighlightKey: "mobile-detail-checklist",
      },
      {
        id: "pmd-step-3",
        stepNumber: 3,
        title: "On-Site Add-On Consent (Cryo-Steam Cleaning)",
        targetRoute: "/quotes",
        customerFriction: "Technicians upsell additional services on-site verbally, causing customer billing disputes later.",
        yorksteadSolution: "Digital add-on consent module capturing client SMS/digital signature with immediate price adjustment.",
        talkTrack: "When the client requests cryogenic engine bay steam cleaning, the tech captures digital consent for +$250 in 10 seconds.",
        suggestedAction: "Authorize on-site add-on and review updated $850 invoice total.",
        uiHighlightKey: "addon-consent-action",
      },
      {
        id: "pmd-step-4",
        stepNumber: 4,
        title: "Simulated Payment Capture & Warranty Generation",
        targetRoute: "/analytics",
        customerFriction: "Delayed payments while technicians wait for back-office invoicing.",
        yorksteadSolution: "Instant simulated payment capture with zero external credit card charges or live gateway dependencies.",
        talkTrack: "Complete the service, record simulated payment, and generate the 3-year ceramic warranty certificate.",
        suggestedAction: "Confirm simulated payment and review warranty delivery.",
        uiHighlightKey: "simulated-payment-capture",
      },
    ],
  },
];

export class SalesPresenterService {
  static getScenarios(): PresenterScenario[] {
    return presenterScenarios;
  }

  static getScenario(slug: string): PresenterScenario | undefined {
    return presenterScenarios.find((s) => s.scenarioSlug === slug);
  }

  static verifyPasscode(passcode: string): boolean {
    return passcode.trim() === PRESENTER_PASSCODE;
  }

  static resetCheckpoint(scenarioSlug: string): { success: boolean; message: string; checkpoint: string } {
    const scenario = this.getScenario(scenarioSlug);
    if (!scenario) {
      return { success: false, message: "Scenario not found", checkpoint: "None" };
    }
    return {
      success: true,
      message: `Scenario '${scenario.scenarioName}' restored to golden checkpoint '${scenario.checkpointName}'.`,
      checkpoint: scenario.checkpointName,
    };
  }
}
