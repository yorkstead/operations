import { ModuleGuidance } from "./types";

export const MODULE_GUIDANCE_REGISTRY: Record<string, ModuleGuidance> = {
  maintenance: {
    moduleCode: "maintenance",
    name: "Equipment Maintenance & Downtime Health",
    badge: "OPERATIONS//MAINTENANCE",
    kicker: "Plant Asset Health, PM Cadence & Return-to-Service Control",
    whatItDoes:
      "Tracks capital industrial machinery, CNC cutting cells, and facility assets with real-time runtime hours, scheduled preventive maintenance (PM) triggers, unscheduled breakdown workflows, and verified return-to-service sign-offs.",
    problemReplaced:
      "Replaces whiteboards, paper PM clipboards, unlogged machine halts, and informal verbal repair requests that cause unexpected production line bottlenecks and unbudgeted emergency downtime.",
    whatYouAreLookingAt:
      "A live telemetry and maintenance command center displaying fleet-wide operational uptime (99.2%), active emergency breakdown counters, overdue preventive maintenance schedules, and mean time to repair (MTTR). The main asset ledger lists machine serials, runtime hours, and critical breakdown action triggers.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Asset Telemetry & Runtime Monitoring",
        description:
          "Monitor live machine status, work center assignments, and cumulative runtime hours across cutting, forming, and facility assets.",
        keyAction: "Inspect active equipment health badges and overdue PM markers.",
        expectedOutcome: "Immediate visibility into machine readiness and scheduled maintenance horizons.",
      },
      {
        stepNumber: 2,
        title: "Emergency Breakdown Reporting",
        description:
          "When a machine faults or stops unexpectedly, operators trigger an emergency breakdown with category classification, fault reason, and station impact.",
        keyAction: "Click 'Report Breakdown' and submit downtime diagnostic.",
        expectedOutcome: "Equipment status transitions to 'down', triggering technician dispatch and halting station scheduling.",
      },
      {
        stepNumber: 3,
        title: "Lockout/Tagout (LOTO) & Safe Maintenance Execution",
        description:
          "Technicians execute safety lockout/tagout procedures, record replacement parts used, and log labor hours against the work order.",
        keyAction: "Review safety checklist and technician diagnostic logs.",
        expectedOutcome: "Downtime interval is actively timed to feed MTTR analytics.",
      },
      {
        stepNumber: 4,
        title: "Return-to-Service Authorization",
        description:
          "Authorized supervisors verify test cuts or operational calibration, sign off the repair record, and restore the asset to active operational status.",
        keyAction: "Sign return-to-service authorization.",
        expectedOutcome: "Asset returns to 'operational' status, closing the downtime event and updating uptime metrics.",
      },
    ],
    suggestedActions: [
      {
        title: "Log Unscheduled Breakdown",
        action: "Click the 'Report Breakdown' button in the top right to open the breakdown diagnostic modal.",
        expectedResult: "Select an asset (e.g. 6kW Laser Cell), choose a category, and submit to observe real-time status change.",
      },
      {
        title: "Review Fleet MTTR Signals",
        action: "Examine the Mean Time to Repair KPI card and overdue PM countdowns.",
        expectedResult: "Evaluate how quickly historical repairs are completed and which machines require service next.",
      },
      {
        title: "Explore Chiller & Facility Maintenance in Summit Demo",
        action: "Switch to the Summit Facility Services demo sandbox.",
        expectedResult: "Observe multi-site HVAC and compressor telemetry with pre-populated preventive maintenance routines.",
      },
    ],
    businessOutcomes: [
      {
        title: "Preventive Uptime Protection",
        impact: "Transition from reactive fire-fighting to proactive scheduled service, protecting critical machine uptime.",
        metricBadge: "99.2% Uptime",
      },
      {
        title: "Elimination of Hidden Production Scrap",
        impact: "Catch tool wear and mechanical calibration drift before defective parts flow into downstream packaging and shipping.",
        metricBadge: "Zero Scrap Drift",
      },
      {
        title: "Audit-Ready Safety Compliance",
        impact: "Immutable digital logs of technician work, LOTO procedures, and supervisory sign-offs satisfy OSHA and ISO requirements.",
        metricBadge: "100% LOTO Audit",
      },
    ],
    relatedModules: [
      {
        code: "shopfloor",
        name: "ShopFloor Execution",
        path: "/shopfloor",
        description: "Station travelers automatically detect equipment downtime and reroute work to secondary cells.",
      },
      {
        code: "quality",
        name: "Quality & Inspection",
        path: "/quality",
        description: "Links non-conformance reports (NCRs) directly to root-cause machine calibration issues.",
      },
      {
        code: "knowledge",
        name: "Knowledge & SOPs",
        path: "/knowledge",
        description: "Provides standard operating procedures and step-by-step equipment troubleshooting guides.",
      },
      {
        code: "analytics",
        name: "Analytics & Capacity",
        path: "/analytics",
        description: "Aggregates overall equipment effectiveness (OEE) and historical downtime intervals.",
      },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "summit-facility-services",
        name: "Summit Facility Services",
        industry: "Commercial HVAC & Plant Maintenance",
        narrative:
          "Multi-site facility operations managing 48 capital air handlers, chillers, and compressor skids with LOTO checklists and return-to-service signoffs.",
        targetStep: 1,
      },
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative:
          "Heavy CNC press brake and fiber laser maintenance telemetry integrated into high-mix traveler execution.",
        targetStep: 2,
      },
    ],
    publicLinks: [
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Explore custom software for production visibility, machine tracking, and shop-floor handoffs.",
        badgeText: "Services",
        isExternal: true,
      },
      {
        label: "Summit Facility Services Walkthrough",
        href: "https://yorkstead.com/demos/summit-facility-services",
        description: "Read the public narrative on multi-site maintenance, ATP swab telemetry, and proof of work.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
      {
        label: "Workflow Audit Consultation",
        href: "https://yorkstead.com/workflow-audit",
        description: "Map equipment maintenance bottlenecks and evaluate tailored downtime capture systems.",
        badgeText: "Intake",
        isExternal: true,
      },
    ],
    visualReferences: [
      {
        title: "Maintenance Workflow State Machine",
        caption: "Operational -> Fault Reported -> LOTO Active -> Repair In-Progress -> Calibration Sign-Off -> Restored",
        type: "diagram",
      },
    ],
  },

  packaging: {
    moduleCode: "packaging",
    name: "Packaging & Container Palletization",
    badge: "OPERATIONS//PACKAGING",
    kicker: "Container Packing, Gross Weight Compliance & Seal Controls",
    whatItDoes:
      "Governs container provisioning (boxes, wooden crates, corrugated cartons, heavy-duty pallets), item pack-lists, lot number attribution, gross weight calculation against tare limits, and tamper-evident container sealing.",
    problemReplaced:
      "Replaces loose paper packing slips, unverified box capacities, overweight freight penalties, and missing lot traceability that lead to carrier rejections, damaged goods in transit, and customer chargebacks.",
    whatYouAreLookingAt:
      "A packaging operations workspace showing active open containers, units staged for shipping, and cumulative weight packed in lbs. The container table highlights container types, gross vs. max capacity limits, item manifests, and seal actions.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Container Provisioning & Tare Weight Setup",
        description:
          "Create a new container (box, wooden crate, or pallet) with declared tare weight and maximum gross weight capacity limits.",
        keyAction: "Click 'New Container' to provision a crate or box with strict tare limits.",
        expectedOutcome: "Container created in 'open' status ready to receive packed parts.",
      },
      {
        stepNumber: 2,
        title: "Part Pack-List & Lot Traceability",
        description:
          "Scan or select finished parts, enter packed quantities, and associate manufacturing lot numbers with individual piece weights.",
        keyAction: "Click 'Pack Items' on an open container to add lot-verified parts.",
        expectedOutcome: "Container recalculates gross weight and remaining capacity in real time.",
      },
      {
        stepNumber: 3,
        title: "Weight Capacity & Overload Governance",
        description:
          "The system enforces maximum weight thresholds, preventing container overfilling and ensuring DOT/carrier freight compliance.",
        keyAction: "Verify that calculated gross weight remains under max capacity limits.",
        expectedOutcome: "Visual indicators validate load distribution safety.",
      },
      {
        stepNumber: 4,
        title: "Container Sealing & Shipping Staging",
        description:
          "Seal the finished container to lock the manifest, generate a tamper-evident barcode identifier, and mark it ready for freight palletization.",
        keyAction: "Click 'Seal Container' to transition from 'open' to 'sealed'.",
        expectedOutcome: "Container is locked and immediately available to the Outbound Shipping Bill of Lading builder.",
      },
    ],
    suggestedActions: [
      {
        title: "Provision a Custom Wooden Crate",
        action: "Click 'New Container' and select container type 'Crate' with a 500 lb capacity.",
        expectedResult: "A new crate is added to the active registry with a unique container number.",
      },
      {
        title: "Pack Lot-Numbered Parts",
        action: "Click 'Pack Items' on an open container and assign 50 precision flanges with lot attribution.",
        expectedResult: "The container updates gross weight and part count instantaneously.",
      },
      {
        title: "Seal Container for Outbound Freight",
        action: "Click 'Seal Container' to lock the packing slip.",
        expectedResult: "The container transitions to 'sealed' status and increments the 'Ready for Shipment' KPI count.",
      },
    ],
    businessOutcomes: [
      {
        title: "Zero Carrier Freight Overweight Penalties",
        impact: "Pre-computed tare and gross weights guarantee compliance with carrier Bill of Lading manifests.",
        metricBadge: "100% Weight Compliance",
      },
      {
        title: "End-to-End Lot Traceability",
        impact: "Every packed carton retains exact part numbers, lot codes, and operator attribution for customer QA handoffs.",
        metricBadge: "Full Lot Audit",
      },
      {
        title: "Accelerated Dock Staging Speed",
        impact: "Sealed containers flow straight onto shipping pallets without manual re-weighing or re-counting at the dock.",
        metricBadge: "3x Dock Velocity",
      },
    ],
    relatedModules: [
      {
        code: "shipping",
        name: "Shipping & Load Builder",
        path: "/shipping",
        description: "Combines sealed packaging containers onto multi-stop Bills of Lading and carrier manifests.",
      },
      {
        code: "quality",
        name: "Quality & Inspection",
        path: "/quality",
        description: "Ensures only First Article Inspection (FAI) approved parts are released for packaging.",
      },
      {
        code: "shopfloor",
        name: "ShopFloor Execution",
        path: "/shopfloor",
        description: "Completed digital traveler operations feed directly into packaging queues.",
      },
      {
        code: "inventory",
        name: "Inventory Ledger",
        path: "/inventory",
        description: "Deducts packed finished goods from WIP and updates stock allocation ledgers.",
      },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative:
          "Pallet load building and gross-weight crate packing for aerospace enclosures and laser-cut assemblies.",
        targetStep: 4,
      },
      {
        scenarioSlug: "mile-high-signworks",
        name: "Mile High Signworks",
        industry: "Architectural Signage & Crane Rigging",
        narrative:
          "Protective foam crating and crate tagging for custom illuminated pylon signs and LED channel letters.",
        targetStep: 2,
      },
    ],
    publicLinks: [
      {
        label: "Elward Flow Case Study",
        href: "https://yorkstead.com/work/elward-flow",
        description: "Review production release control, document handling, and manufacturing handoffs in action.",
        badgeText: "Case Study",
        isExternal: true,
      },
      {
        label: "Shop Inventory Prototype",
        href: "https://yorkstead.com/work/shop-inventory",
        description: "Explore on-hand vs. committed stock visibility and material movement records.",
        badgeText: "Prototype",
        isExternal: true,
      },
      {
        label: "Front Range Manufacturing Demo",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Read the public walkthrough of quoting, traveler execution, and pallet shipping.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
    ],
    visualReferences: [
      {
        title: "Palletization Hierarchy",
        caption: "Individual Parts -> Lot Pack Unit -> Sealed Crate -> Pallet Master -> Bill of Lading",
        type: "diagram",
      },
    ],
  },
};

export function getModuleGuidance(moduleCode: string): ModuleGuidance | undefined {
  return MODULE_GUIDANCE_REGISTRY[moduleCode];
}

export function getAllModuleGuidance(): ModuleGuidance[] {
  return Object.values(MODULE_GUIDANCE_REGISTRY);
}
