import { ModuleGuidance } from "./types";

export const MODULE_GUIDANCE_REGISTRY: Record<string, ModuleGuidance> = {
  quotes: {
    moduleCode: "quotes",
    name: "QuoteFlow & Estimating",
    badge: "OPERATIONS//QUOTES",
    kicker: "RFQ Intake, Dynamic Margin Guardrails & Order Conversion",
    whatItDoes:
      "Translates customer RFQs into itemized, revision-controlled quotes with detailed material, labor, machine runtime, freight, and overhead cost models governed by executive margin thresholds.",
    problemReplaced:
      "Replaces disconnected spreadsheet cost calculators, unverified email price commitments, and unmanaged revision drift that result in negative-margin jobs and lost customer bidding momentum.",
    whatYouAreLookingAt:
      "An active quoting pipeline displaying draft, approved, and converted quotes with gross margin percentages, executive approval gates, line item cost breakdowns, and one-click production job conversion.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "RFQ Intake & Customer Association",
        description: "Log incoming customer request for quotation with CAD drawing numbers and requested delivery dates.",
        keyAction: "Create quote header with customer contact and expiration window.",
        expectedOutcome: "Quote initialized in 'draft' status ready for cost estimation.",
      },
      {
        stepNumber: 2,
        title: "Parametric Cost Breakdown & Pricing",
        description: "Break down unit costs across material sheets, CNC laser time, press brake labor, and overhead.",
        keyAction: "Configure target margin percentage (e.g. 35%).",
        expectedOutcome: "System computes unit price and total contract value with dynamic margin warnings.",
      },
      {
        stepNumber: 3,
        title: "Executive Approval & Revision Governance",
        description: "If margin falls below company policy thresholds (e.g. <25%), the quote triggers executive approval review.",
        keyAction: "Authorize quote with supervisory sign-off.",
        expectedOutcome: "Quote transitions to 'approved' status with immutable revision snapshot.",
      },
      {
        stepNumber: 4,
        title: "Seamless Production Job Conversion",
        description: "Once the customer awards the purchase order, convert the approved quote directly into a production job.",
        keyAction: "Click 'Convert to Job' to release to production order intake.",
        expectedOutcome: "Production job generated with linked quote reference and revision packet.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Quote #Q-2026-088",
        action: "Review the converted aerospace avionics enclosure quote.",
        expectedResult: "Observe the 35% margin model and linked conversion to JOB-2026-104.",
      },
      {
        title: "Test Margin Threshold Gate",
        action: "Simulate a quote revision with target margin set to 15%.",
        expectedResult: "Observe the required executive approval gate flag.",
      },
      {
        title: "Explore Consulting Quoting in Services",
        action: "Review the client work and prototype quoting patterns.",
        expectedResult: "Evaluate how Yorkstead structures bespoke manufacturing quote pipelines.",
      },
    ],
    businessOutcomes: [
      {
        title: "Protected Gross Margins",
        impact: "Enforce automated margin thresholds to prevent unprofitable jobs from ever reaching the shop floor.",
        metricBadge: "35% Target Margin",
      },
      {
        title: "Zero Quote-to-Production Misalignment",
        impact: "Converted jobs inherit exact drawing revisions, material specs, and contracted unit counts.",
        metricBadge: "100% Data Fidelity",
      },
      {
        title: "Fast RFQ Turnaround",
        impact: "Standardized parametric estimating accelerates customer quotation turnaround from days to minutes.",
        metricBadge: "<4hr Turnaround",
      },
    ],
    relatedModules: [
      { code: "jobs", name: "Production Jobs", path: "/jobs", description: "Converts approved quotes into active production orders." },
      { code: "packet-intelligence", name: "Job Packets", path: "/job-packets", description: "Extracts CAD drawing dimensions to feed parametric quoting." },
      { code: "purchasing", name: "Purchasing", path: "/purchasing", description: "Prices raw materials based on real-time vendor catalog costs." },
      { code: "analytics", name: "Analytics", path: "/analytics", description: "Analyzes win rates, quote velocity, and realized gross margins." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Aerospace enclosure RFQ intake, 35% margin governance, and one-click release to CNC laser cutting.",
        targetStep: 1,
      },
      {
        scenarioSlug: "summit-facility-services",
        name: "Summit Facility Services",
        industry: "Commercial HVAC & Plant Maintenance",
        narrative: "Multi-site quarterly maintenance contract estimating and emergency repair dispatch pricing.",
        targetStep: 1,
      },
    ],
    publicLinks: [
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Custom quote-to-cash systems, CPQ configurators, and shop-floor scheduling platforms.",
        badgeText: "Services",
        isExternal: true,
      },
      {
        label: "Front Range Demo Walkthrough",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Read the full narrative of quoting, traveler execution, and shipping manifests.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
      {
        label: "Workflow Audit Consultation",
        href: "https://yorkstead.com/workflow-audit",
        description: "Evaluate your quotation workflow, cost accuracy, and margin governance systems.",
        badgeText: "Intake",
        isExternal: true,
      },
    ],
  },

  jobs: {
    moduleCode: "jobs",
    name: "Production Jobs & Order Intake",
    badge: "OPERATIONS//JOBS",
    kicker: "Job Release Control, Multi-Revision Tracking & Due Date Management",
    whatItDoes:
      "Manages production orders through their lifecycle: intake review, engineering release, shopfloor execution, quality quarantine, and completion with immutable timeline auditing.",
    problemReplaced:
      "Replaces physical job folders, unversioned paper drawings, verbal status updates, and lost due dates that cause customer escalations and late deliveries.",
    whatYouAreLookingAt:
      "A real-time job registry displaying active production orders with customer associations, target due dates, priority tiers, revision tags, and live status progress.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Order Intake & Job Creation",
        description: "Capture production order specifications, customer purchase order numbers, and target delivery commitments.",
        keyAction: "Review job header and priority classification.",
        expectedOutcome: "Job created in 'intake_review' status.",
      },
      {
        stepNumber: 2,
        title: "Engineering Release & Revision Management",
        description: "Attach engineering drawings and verify revision alignment (e.g. Rev A to Rev B transition).",
        keyAction: "Verify attached job packet and approve release to production.",
        expectedOutcome: "Job transitions to 'in_progress' and releases shopfloor travelers.",
      },
      {
        stepNumber: 3,
        title: "Live Shopfloor Progress Tracking",
        description: "Monitor traveler station milestones from laser cutting through forming, welding, and surface finishing.",
        keyAction: "Track piece counts and operation statuses across work centers.",
        expectedOutcome: "Real-time visibility into bottleneck stations and WIP accumulation.",
      },
      {
        stepNumber: 4,
        title: "Order Fulfillment & Delivery Closeout",
        description: "Coordinate with quality inspection, container packaging, and shipping manifests to complete the order.",
        keyAction: "Mark job completed upon bill of lading dispatch.",
        expectedOutcome: "Job moves to 'completed' status with full timeline audit history.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Job #JOB-2026-104",
        action: "Open the active aerospace enclosure job in Front Range Manufacturing.",
        expectedResult: "Examine attached drawing Rev B, traveler operations, and PO receipts.",
      },
      {
        title: "Review Job Timeline Audit",
        action: "Inspect the immutable timeline events for actor attribution and timestamps.",
        expectedResult: "Verify full traceability from quote conversion to shopfloor release.",
      },
    ],
    businessOutcomes: [
      {
        title: "On-Time Delivery Reliability",
        impact: "Clear due-date tracking and priority scheduling eliminate forgotten jobs and expedite critical customer orders.",
        metricBadge: "98.7% On-Time",
      },
      {
        title: "Revision Control Integrity",
        impact: "Guarantees shopfloor operators always build against the latest approved engineering revision.",
        metricBadge: "100% Rev Sync",
      },
      {
        title: "End-to-End Auditability",
        impact: "Every status transition, timeline note, and actor action is immutably logged for AS9100 compliance.",
        metricBadge: "AS9100 Compliant",
      },
    ],
    relatedModules: [
      { code: "quotes", name: "Quoting", path: "/quotes", description: "Provides commercial cost models and customer PO references." },
      { code: "packet-intelligence", name: "Job Packets", path: "/job-packets", description: "Binds engineering drawings, CAD files, and AI entity extractions." },
      { code: "shopfloor", name: "ShopFloor", path: "/shopfloor", description: "Executes physical manufacturing operations via digital travelers." },
      { code: "shipping", name: "Shipping", path: "/shipping", description: "Dispatches completed production orders with carrier bills of lading." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Aerospace enclosure production order routing across 4 CNC workcenters with tight tolerance controls.",
        targetStep: 2,
      },
      {
        scenarioSlug: "mile-high-signworks",
        name: "Mile High Signworks",
        industry: "Architectural Signage & Crane Rigging",
        narrative: "Custom illuminated signage fabrication and on-site installation work orders.",
        targetStep: 1,
      },
    ],
    publicLinks: [
      {
        label: "Elward Flow Case Study",
        href: "https://yorkstead.com/work/elward-flow",
        description: "Read how custom production scheduling software eliminated manufacturing handoff delays.",
        badgeText: "Case Study",
        isExternal: true,
      },
      {
        label: "Front Range Manufacturing Demo",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Explore the live Front Range Precision Manufacturing interactive scenario.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
    ],
  },

  "packet-intelligence": {
    moduleCode: "packet-intelligence",
    name: "Job Packets & Drawing Intelligence",
    badge: "OPERATIONS//PACKETS",
    kicker: "CAD Extraction, Tolerance Verification & Revision Discrepancy Detection",
    whatItDoes:
      "Ingests PDF drawings and CAD files, automatically extracts bills of materials, critical tolerances, and hardware callouts using structured parsing, and highlights drawing-to-PO revision discrepancies.",
    problemReplaced:
      "Replaces manual manual re-typing of drawing callouts, missed revision change notes, and undetected material spec mismatches that cause costly scrap runs and assembly rework.",
    whatYouAreLookingAt:
      "A document intelligence workspace displaying uploaded engineering drawing packets, extracted entity confidence scores, detected revision mismatch flags, and human reviewer approval actions.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Drawing Upload & Cryptographic Vault Storage",
        description: "Upload customer CAD blueprints, spec sheets, and revision packets into the secure file vault.",
        keyAction: "Upload PDF drawing file to active job packet.",
        expectedOutcome: "File ingested with SHA-256 integrity hash and clean malware scan.",
      },
      {
        stepNumber: 2,
        title: "Automated Entity Extraction",
        description: "AI-powered packet parsing extracts part numbers, revision letters, material specs, and hardware callouts.",
        keyAction: "Inspect parsed key-value entities and confidence metrics.",
        expectedOutcome: "Structured bill of materials and dimensional tolerances extracted instantaneously.",
      },
      {
        stepNumber: 3,
        title: "Revision & Discrepancy Detection",
        description: "Compares extracted drawing revision against customer PO and ERP master records to flag mismatches.",
        keyAction: "Review any discrepancy alert banners.",
        expectedOutcome: "Guarantees potential drawing-to-PO conflicts are caught before cutting metal.",
      },
      {
        stepNumber: 4,
        title: "Quality Reviewer Sign-Off",
        description: "Authorized quality engineers verify extracted specifications and release the approved packet to shopfloor travelers.",
        keyAction: "Click 'Approve Packet' to certify for production release.",
        expectedOutcome: "Packet transitions to 'completed' status and binds to active travelers.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Drawing #DOC-PKT-2026-104",
        action: "Review extracted 5052-H32 material callout and 8x M4-0.7 PEM stud specifications.",
        expectedResult: "Observe high-confidence entity extractions and Elena Rostova's approval signature.",
      },
      {
        title: "Review Drawing Vault in Files",
        action: "Switch to the Document Vault to inspect drawing file hashes.",
        expectedResult: "Verify cryptographic SHA-256 integrity verification.",
      },
    ],
    businessOutcomes: [
      {
        title: "Zero Revision Mismatch Scrap",
        impact: "Automated drawing comparison eliminates parts cut to obsolete revision blueprints.",
        metricBadge: "Zero Rev Scrap",
      },
      {
        title: "Rapid Job Release",
        impact: "Instantaneous BOM extraction reduces engineering packet review from hours to minutes.",
        metricBadge: "90% Faster Review",
      },
      {
        title: "Certified Engineering Traceability",
        impact: "Human-in-the-loop sign-offs preserve verifiable compliance records for aerospace audits.",
        metricBadge: "100% Sign-Off Audit",
      },
    ],
    relatedModules: [
      { code: "jobs", name: "Production Jobs", path: "/jobs", description: "Binds verified drawing packets to active job headers." },
      { code: "purchasing", name: "Purchasing", path: "/purchasing", description: "Triggers raw material purchase orders based on extracted alloy specs." },
      { code: "shopfloor", name: "ShopFloor", path: "/shopfloor", description: "Renders approved drawings directly on operator tablet terminals." },
      { code: "quality", name: "Quality", path: "/quality", description: "Supplies nominal dimensions and tolerances to First Article Inspections." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Drawing extraction for 5052-H32 aerospace avionics box with critical +/-0.005in flange callouts.",
        targetStep: 2,
      },
    ],
    publicLinks: [
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Explore custom computer vision and drawing extraction workflows.",
        badgeText: "Services",
        isExternal: true,
      },
      {
        label: "Front Range Demo Walkthrough",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Read about automated drawing verification in high-mix manufacturing.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
    ],
  },

  shopfloor: {
    moduleCode: "shopfloor",
    name: "ShopFloor & Digital Travelers",
    badge: "OPERATIONS//SHOPFLOOR",
    kicker: "Touch-Screen Station Routing, Operator Piece Counts & Real-Time Blockers",
    whatItDoes:
      "Provides responsive, paperless digital station travelers for CNC laser cutting, press brake forming, welding, and finishing cells with real-time piece counting, scrap logging, and blocker reporting.",
    problemReplaced:
      "Replaces grease-stained paper travelers, untracked station queues, unlogged scrap counts, and delayed shift communication that cause bottleneck pile-ups and delayed production lines.",
    whatYouAreLookingAt:
      "A dynamic shopfloor station terminal showing active traveler queues, step-by-step routing operations, required vs. completed quantities, operator assignments, and active blocker alerts.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Station Traveler Check-In",
        description: "Operators scan the traveler QR barcode or select the job from their work center queue.",
        keyAction: "Select work center (e.g. WC-LASER-01) and claim traveler.",
        expectedOutcome: "Station status updates to 'in_progress' and begins tracking actual labor minutes.",
      },
      {
        stepNumber: 2,
        title: "Part Processing & Quantity Tracking",
        description: "Complete CNC machine cycle, record finished parts, and log any scrapped components with failure codes.",
        keyAction: "Enter completed pieces and scrap quantity.",
        expectedOutcome: "Operation updates completed counts and passes parts to the downstream queue.",
      },
      {
        stepNumber: 3,
        title: "Blocker Alert & Machine Exception Management",
        description: "If assist-gas pressure drops, tooling wears out, or material is missing, operators report a blocker.",
        keyAction: "Click 'Report Blocker' with symptom description.",
        expectedOutcome: "Operation flags red blocker banner and alerts maintenance and production leads.",
      },
      {
        stepNumber: 4,
        title: "Operation Sign-Off & Station Handoff",
        description: "Operator signs off completed step; parts flow to next operation (e.g. Press Brake -> Welding -> Powder Coat).",
        keyAction: "Click 'Complete Operation' to advance traveler.",
        expectedOutcome: "Traveler advances step index and updates plant-wide WIP status.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Traveler #TRV-2026-104",
        action: "Review operations across Laser Cutting, Press Brake, Welding, and Anodize cells.",
        expectedResult: "Observe completed Laser step (50/50), Brake step (48/48 with 2 scrapped), and active Anodize step.",
      },
      {
        title: "Simulate Laser Blocker Resolution",
        action: "Inspect the resolved assist-gas pressure loss blocker on Operation 10.",
        expectedResult: "Verify Dave Miller's corrective action log and restored cycle uptime.",
      },
    ],
    businessOutcomes: [
      {
        title: "Live Plant WIP Visibility",
        impact: "Plant directors see exact piece counts and station backlogs in real time without walking the floor.",
        metricBadge: "100% Real-Time WIP",
      },
      {
        title: "Accurate Labor & Scrap Accounting",
        impact: "Direct operator logging captures actual labor minutes and material scrap per work order.",
        metricBadge: "Exact Cost Rollups",
      },
      {
        title: "Rapid Exception Containment",
        impact: "Instant blocker alerts bring maintenance and engineering leads to the machine before lines stall.",
        metricBadge: "<5min Response",
      },
    ],
    relatedModules: [
      { code: "jobs", name: "Production Jobs", path: "/jobs", description: "Originates traveler requirements and receives completion signals." },
      { code: "maintenance", name: "Equipment Maintenance", path: "/maintenance", description: "Receives automated machine breakdown work orders from station blockers." },
      { code: "quality", name: "Quality", path: "/quality", description: "Triggers First Article Inspections at designated traveler milestones." },
      { code: "packaging", name: "Packaging", path: "/packaging", description: "Receives finished parts from the final traveler operation into packing crates." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Multi-workcenter routing across fiber laser, press brake, and welding cells with recoverable gas pressure alert.",
        targetStep: 3,
      },
    ],
    publicLinks: [
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Custom paperless shopfloor systems and operator touch-screen interfaces.",
        badgeText: "Services",
        isExternal: true,
      },
      {
        label: "Front Range Demo Walkthrough",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Experience the complete Front Range CNC shopfloor execution flow.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
    ],
  },

  inventory: {
    moduleCode: "inventory",
    name: "Inventory & Stock Movement Ledger",
    badge: "OPERATIONS//INVENTORY",
    kicker: "ACID-Safe Movements, Bin Locations & Lot Traceability",
    whatItDoes:
      "Maintains transactional on-hand, allocated, and available balances across warehouse bin locations with lot-tracking, PO receipt auto-transfers, job material issuance, and cycle count variance audits.",
    problemReplaced:
      "Replaces unmanaged stockrooms, phantom inventory balances, missing raw material sheets, and inaccurate manual count spreadsheets that stall production jobs mid-shift.",
    whatYouAreLookingAt:
      "A multi-location inventory ledger displaying raw materials, hardware components, WIP parts, and packaging stock with live stock balances, reorder point thresholds, and movement audit history.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Item & Bin Location Setup",
        description: "Configure raw stock, hardware, and finished goods with standard costs, UOMs, and bin locations.",
        keyAction: "Inspect item catalog and location hierarchy (Racks, Staging, Quarantine, Docks).",
        expectedOutcome: "Inventory structure established with lot tracking policies.",
      },
      {
        stepNumber: 2,
        title: "Material Receiving & Lot Number Assignment",
        description: "Receive incoming raw material sheets from vendor purchase orders with certified mill heat numbers.",
        keyAction: "Post receiving transaction against PO receipt.",
        expectedOutcome: "Item on-hand quantity increments in warehouse receiving rack with verified lot code.",
      },
      {
        stepNumber: 3,
        title: "Issuance to Production Job",
        description: "Issue raw material sheets directly to the active shopfloor traveler, decrementing warehouse stock.",
        keyAction: "Post 'issue_to_job' movement for Job #JOB-2026-104.",
        expectedOutcome: "Stock balance updates; material cost is attributed directly to the production order.",
      },
      {
        stepNumber: 4,
        title: "Cycle Count Audit & Reconciliation",
        description: "Execute periodic blind cycle counts, identify variances, and record approved balance adjustments.",
        keyAction: "Log observed physical count and submit for managerial approval.",
        expectedOutcome: "Inventory balance reconciled with permanent audit trail.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Lot #LOT-2026-AL-088",
        action: "Review the 5052-H32 aluminum lot with supplier reference CO-METALS-MT-9042.",
        expectedResult: "Observe full traceability to PO #PO-2026-042 and receiving slip PS-CO-89942.",
      },
      {
        title: "Review Stock Movements Ledger",
        action: "Filter movements by Job #JOB-2026-104.",
        expectedResult: "Examine receipt and job issue transactions with actor attribution.",
      },
    ],
    businessOutcomes: [
      {
        title: "Elimination of Phantom Inventory",
        impact: "ACID-safe double-entry movements guarantee physical stock matches system records at all times.",
        metricBadge: "99.8% Inventory Accuracy",
      },
      {
        title: "Total Material Traceability",
        impact: "Trace any finished product back to its specific raw material heat lot and supplier mill cert.",
        metricBadge: "100% Lot Traceable",
      },
      {
        title: "Automated Reorder Protection",
        impact: "Dynamic reorder triggers prevent material stockouts before cutting schedules are impacted.",
        metricBadge: "Zero Stockout Halts",
      },
    ],
    relatedModules: [
      { code: "purchasing", name: "Purchasing", path: "/purchasing", description: "Generates replenishment purchase orders when stock reaches reorder points." },
      { code: "shopfloor", name: "ShopFloor", path: "/shopfloor", description: "Consumes inventory stock during traveler operation execution." },
      { code: "packaging", name: "Packaging", path: "/packaging", description: "Manages finished goods stock in staging bins prior to freight loading." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Raw aluminum sheet receipt, lot tracking, and issuance to high-precision CNC laser nests.",
        targetStep: 2,
      },
    ],
    publicLinks: [
      {
        label: "Shop Inventory Prototype",
        href: "https://yorkstead.com/work/shop-inventory",
        description: "Review Yorkstead's dedicated inventory ledger prototype and stock visibility controls.",
        badgeText: "Prototype",
        isExternal: true,
      },
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Custom ERP integrations and material tracking systems.",
        badgeText: "Services",
        isExternal: true,
      },
    ],
  },

  purchasing: {
    moduleCode: "purchasing",
    name: "Purchasing & PO Sourcing",
    badge: "OPERATIONS//PURCHASING",
    kicker: "Shortage Detection, Supplier PO Issuance & Dock Receiving",
    whatItDoes:
      "Detects material shortages against scheduled production jobs, aggregates supplier RFQs, issues revision-controlled purchase orders with approval gates, and captures packing slips at receiving.",
    problemReplaced:
      "Replaces frantic last-minute supplier phone calls, untracked paper purchase orders, duplicate ordering, and unverified dock receipts that cause job halts and unbudgeted freight expediting fees.",
    whatYouAreLookingAt:
      "A purchasing management workspace showing active material shortage alerts, purchase orders across draft, sent, and received states, vendor catalogs, and dock receiving slip verification.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Shortage Signal Ingestion",
        description: "When a job is released, the system calculates material requirements against on-hand stock and flags shortages.",
        keyAction: "Review urgent shortage signal for 5052-H32 aluminum sheets.",
        expectedOutcome: "Shortage is categorized with required quantity and needed-by date.",
      },
      {
        stepNumber: 2,
        title: "Purchase Order Generation & Approval",
        description: "Draft purchase order to preferred supplier with pricing terms and linked job numbers.",
        keyAction: "Authorize PO #PO-2026-042 under manager spending threshold.",
        expectedOutcome: "Purchase order is approved and marked 'sent_to_vendor'.",
      },
      {
        stepNumber: 3,
        title: "Supplier Shipment & In-Transit Tracking",
        description: "Track expected delivery dates and carrier tracking numbers from supplier.",
        keyAction: "Verify supplier acknowledgment and delivery date confirmation.",
        expectedOutcome: "Production schedule reflects confirmed material arrival date.",
      },
      {
        stepNumber: 4,
        title: "Dock Receiving & Packing Slip Log",
        description: "Dock operators verify shipment against PO line items, record packing slip numbers, and inspect mill certs.",
        keyAction: "Click 'Receive PO' and log packing slip PS-CO-89942.",
        expectedOutcome: "PO status updates to 'received', resolving the shortage and stocking the warehouse.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect PO #PO-2026-042",
        action: "Review the $3,990 purchase order to Colorado Aluminum & Metal Supply.",
        expectedResult: "Observe line item details, linked Job #JOB-2026-104, and receiving sign-off by Dave Miller.",
      },
      {
        title: "Explore Vendor Management",
        action: "Review vendor pricing agreements and payment terms.",
        expectedResult: "Evaluate preferred supplier terms and on-time performance scoring.",
      },
    ],
    businessOutcomes: [
      {
        title: "Elimination of Unplanned Expedite Fees",
        impact: "Automated shortage detection gives purchasing leads lead time to buy at standard freight rates.",
        metricBadge: "Zero Rush Freight",
      },
      {
        title: "Controlled Spending Governance",
        impact: "Approval thresholds prevent unauthorized commitments and enforce supplier contract pricing.",
        metricBadge: "100% PO Compliance",
      },
      {
        title: "Fast Dock Receiving Handoff",
        impact: "Dock operators verify shipments against digital POs in seconds, eliminating receiving dock pileups.",
        metricBadge: "<3min Receiving",
      },
    ],
    relatedModules: [
      { code: "inventory", name: "Inventory", path: "/inventory", description: "Increments stock balances upon receiving receipt confirmation." },
      { code: "jobs", name: "Production Jobs", path: "/jobs", description: "Unblocks scheduled jobs when required materials are checked into inventory." },
      { code: "quality", name: "Quality", path: "/quality", description: "Verifies raw material certifications during receiving dock inspection." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Urgent 8-sheet aluminum shortage identification, PO issuance to Colorado Metals, and dock receipt.",
        targetStep: 2,
      },
    ],
    publicLinks: [
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Custom ERP integrations, purchasing pipelines, and vendor portal architectures.",
        badgeText: "Services",
        isExternal: true,
      },
      {
        label: "Front Range Manufacturing Demo",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Review automated material sourcing in the Front Range Precision Manufacturing sandbox.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
    ],
  },

  quality: {
    moduleCode: "quality",
    name: "Quality Assurance & NCR Disposition",
    badge: "OPERATIONS//QUALITY",
    kicker: "First Article Inspections (FAI), AS9102 Checklists & Controlled NCR Workflows",
    whatItDoes:
      "Enforces rigorous quality inspection gates (First Article, In-Process, Final Acceptance) with multi-point dimensional checklists, Non-Conformance Reports (NCRs), root cause analyses, and controlled disposition sign-offs.",
    problemReplaced:
      "Replaces undocumented scrap piles, unverified first-piece runs, informal verbal rework requests, and missing inspection certificates that lead to customer rejections and ISO/AS audit failures.",
    whatYouAreLookingAt:
      "A quality command center displaying recent inspection records, open/closed NCR counters, first-pass yield metrics (99.2%), sample size pass/fail breakdowns, and disposition logs.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "First Article Inspection (FAI) Execution",
        description: "Inspect first parts off the CNC machine against drawing dimensions and record pass/fail results.",
        keyAction: "Log inspection result with dimensional measurements and GO/NO-GO checks.",
        expectedOutcome: "Inspection is recorded with inspector attribution and status classification.",
      },
      {
        stepNumber: 2,
        title: "Non-Conformance Report (NCR) Flagging",
        description: "When parts fail tolerance limits, the system auto-generates an NCR and triggers immediate containment.",
        keyAction: "Review NCR #NCR-2026-012 for flange bend angle variance (+0.8 deg).",
        expectedOutcome: "Affected parts are flagged for quarantine in LOC-QUARANTINE.",
      },
      {
        stepNumber: 3,
        title: "Root Cause Analysis & Containment",
        description: "Quality engineers document root cause (e.g. backgauge datum offset) and implement corrective actions.",
        keyAction: "Log containment actions and machine re-calibration verification.",
        expectedOutcome: "Root cause documented to prevent recurring defects across subsequent shifts.",
      },
      {
        stepNumber: 4,
        title: "Controlled Disposition & Closeout",
        description: "Quality Lead dispositions parts (Rework, Use As-Is, Scrap & Remake) and authorizes final release.",
        keyAction: "Approve rework disposition and sign off closed NCR.",
        expectedOutcome: "Parts reworked to specification, returning the order to active production flow.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Inspection #INS-2026-044",
        action: "Review the AS9102 First Article Inspection for Job #JOB-2026-104.",
        expectedResult: "Observe the 4 passed checks and 1 flagged concession linking to NCR-2026-012.",
      },
      {
        title: "Review NCR #NCR-2026-012 Disposition",
        action: "Examine Elena Rostova's root cause analysis and press brake re-strike rework approval.",
        expectedResult: "Verify zero scrap cost and complete compliance audit trail.",
      },
    ],
    businessOutcomes: [
      {
        title: "High First-Pass Yield",
        impact: "Early First Article Inspection catches machine setup errors before full production batches are run.",
        metricBadge: "99.2% First-Pass Yield",
      },
      {
        title: "Controlled Scrap Containment",
        impact: "Immediate quarantine prevents defective parts from ever shipping to the customer dock.",
        metricBadge: "Zero Customer Escapes",
      },
      {
        title: "Audit-Ready AS9100 / ISO Compliance",
        impact: "Immutable digital NCRs, containment logs, and supervisory signatures satisfy aerospace auditor standards.",
        metricBadge: "100% AS9100 Ready",
      },
    ],
    relatedModules: [
      { code: "shopfloor", name: "ShopFloor", path: "/shopfloor", description: "Pauses traveler operations when quality inspections fail." },
      { code: "maintenance", name: "Equipment Maintenance", path: "/maintenance", description: "Feeds machine calibration findings into equipment maintenance work orders." },
      { code: "packaging", name: "Packaging", path: "/packaging", description: "Releases only FAI-approved and closed-NCR parts to shipping container packaging." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "First Article Inspection and controlled rework disposition for aerospace avionics chassis flanges.",
        targetStep: 3,
      },
    ],
    publicLinks: [
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Custom quality management systems, FAI digital forms, and SPC tracking.",
        badgeText: "Services",
        isExternal: true,
      },
      {
        label: "Front Range Demo Walkthrough",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Explore the complete quality inspection and NCR disposition workflow.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
    ],
  },

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
        description: "Monitor live machine status, work center assignments, and cumulative runtime hours across cutting, forming, and facility assets.",
        keyAction: "Inspect active equipment health badges and overdue PM markers.",
        expectedOutcome: "Immediate visibility into machine readiness and scheduled maintenance horizons.",
      },
      {
        stepNumber: 2,
        title: "Emergency Breakdown Reporting",
        description: "When a machine faults or stops unexpectedly, operators trigger an emergency breakdown with category classification, fault reason, and station impact.",
        keyAction: "Click 'Report Breakdown' and submit downtime diagnostic.",
        expectedOutcome: "Equipment status transitions to 'down', triggering technician dispatch and halting station scheduling.",
      },
      {
        stepNumber: 3,
        title: "Lockout/Tagout (LOTO) & Safe Maintenance Execution",
        description: "Technicians execute safety lockout/tagout procedures, record replacement parts used, and log labor hours against the work order.",
        keyAction: "Review safety checklist and technician diagnostic logs.",
        expectedOutcome: "Downtime interval is actively timed to feed MTTR analytics.",
      },
      {
        stepNumber: 4,
        title: "Return-to-Service Authorization",
        description: "Authorized supervisors verify test cuts or operational calibration, sign off the repair record, and restore the asset to active operational status.",
        keyAction: "Sign return-to-service authorization.",
        expectedOutcome: "Asset returns to 'operational' status, closing the downtime event and updating uptime metrics.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Laser Cell #EQ-LASER-01",
        action: "Review the Mitsubishi 4kW Fiber Laser asset details and resolved gas pressure work order.",
        expectedResult: "Observe the 35-minute resolved downtime interval and Dave Miller's return-to-service sign-off.",
      },
      {
        title: "Explore Chiller Maintenance in Summit Demo",
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
      { code: "shopfloor", name: "ShopFloor Execution", path: "/shopfloor", description: "Station travelers automatically detect equipment downtime and reroute work to secondary cells." },
      { code: "quality", name: "Quality & Inspection", path: "/quality", description: "Links non-conformance reports (NCRs) directly to root-cause machine calibration issues." },
      { code: "analytics", name: "Analytics & Capacity", path: "/analytics", description: "Aggregates overall equipment effectiveness (OEE) and historical downtime intervals." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Heavy CNC press brake and fiber laser maintenance telemetry integrated into high-mix traveler execution.",
        targetStep: 2,
      },
      {
        scenarioSlug: "summit-facility-services",
        name: "Summit Facility Services",
        industry: "Commercial HVAC & Plant Maintenance",
        narrative: "Multi-site facility operations managing 48 capital air handlers, chillers, and compressor skids with LOTO checklists.",
        targetStep: 1,
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
        description: "Create a new container (box, wooden crate, or pallet) with declared tare weight and maximum gross weight capacity limits.",
        keyAction: "Click 'New Container' to provision a crate or box with strict tare limits.",
        expectedOutcome: "Container created in 'open' status ready to receive packed parts.",
      },
      {
        stepNumber: 2,
        title: "Part Pack-List & Lot Traceability",
        description: "Scan or select finished parts, enter packed quantities, and associate manufacturing lot numbers with individual piece weights.",
        keyAction: "Click 'Pack Items' on an open container to add lot-verified parts.",
        expectedOutcome: "Container recalculates gross weight and remaining capacity in real time.",
      },
      {
        stepNumber: 3,
        title: "Weight Capacity & Overload Governance",
        description: "The system enforces maximum weight thresholds, preventing container overfilling and ensuring DOT/carrier freight compliance.",
        keyAction: "Verify that calculated gross weight remains under max capacity limits.",
        expectedOutcome: "Visual indicators validate load distribution safety.",
      },
      {
        stepNumber: 4,
        title: "Container Sealing & Shipping Staging",
        description: "Seal the finished container to lock the manifest, generate a tamper-evident barcode identifier, and mark it ready for freight palletization.",
        keyAction: "Click 'Seal Container' to transition from 'open' to 'sealed'.",
        expectedOutcome: "Container is locked and immediately available to the Outbound Shipping Bill of Lading builder.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Crate #PKG-2026-042",
        action: "Review the custom wooden crate packed with 48 aerospace avionics chassis bases.",
        expectedResult: "Observe tare (45 lbs), net (360 lbs), and gross (405 lbs) weight calculations and Dave Miller's seal sign-off.",
      },
      {
        title: "Explore Outbound Shipping Builder",
        action: "Navigate to Shipping to see sealed crates ready for pallet loading.",
        expectedResult: "Review how sealed containers flow onto the master Bill of Lading.",
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
      { code: "shipping", name: "Shipping & Load Builder", path: "/shipping", description: "Combines sealed packaging containers onto multi-stop Bills of Lading and carrier manifests." },
      { code: "quality", name: "Quality & Inspection", path: "/quality", description: "Ensures only First Article Inspection (FAI) approved parts are released for packaging." },
      { code: "shopfloor", name: "ShopFloor Execution", path: "/shopfloor", description: "Completed digital traveler operations feed directly into packaging queues." },
      { code: "inventory", name: "Inventory Ledger", path: "/inventory", description: "Deducts packed finished goods from WIP and updates stock allocation ledgers." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Pallet load building and gross-weight crate packing for aerospace enclosures and laser-cut assemblies.",
        targetStep: 4,
      },
      {
        scenarioSlug: "mile-high-signworks",
        name: "Mile High Signworks",
        industry: "Architectural Signage & Crane Rigging",
        narrative: "Protective foam crating and crate tagging for custom illuminated pylon signs and LED channel letters.",
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
        label: "Front Range Manufacturing Demo",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Read the public walkthrough of quoting, traveler execution, and pallet shipping.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
    ],
  },

  shipping: {
    moduleCode: "shipping",
    name: "Shipping & Outbound Logistics",
    badge: "OPERATIONS//SHIPPING",
    kicker: "LTL Bill of Lading Manifests, Multi-Stop Routing & Digital Proof of Delivery",
    whatItDoes:
      "Consolidates sealed packages and pallets into LTL freight Bills of Lading (BOL), manages driver check-in and trailer seals, tracks carrier PRO numbers, and records electronic proof of delivery signatures.",
    problemReplaced:
      "Replaces handwritten carbon-copy Bills of Lading, lost freight tracking numbers, unverified driver handoffs, and missing proof of delivery signatures that lead to freight claims and delayed customer invoicing.",
    whatYouAreLookingAt:
      "An outbound logistics dispatch board displaying active manifests, carrier types (LTL Freight, Dedicated Flatbed, Parcel), total gross weights, driver details, and delivery completion timestamps.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Manifest Creation & Carrier Assignment",
        description: "Group sealed containers onto an outbound Bill of Lading and assign the freight carrier (e.g. Old Dominion Freight Line).",
        keyAction: "Create new manifest and select carrier type.",
        expectedOutcome: "Manifest initialized with unique BOL barcode and carrier PRO tracking number.",
      },
      {
        stepNumber: 2,
        title: "Load Consolidation & Weight Verification",
        description: "Add sealed crates and pallets to the manifest; verify gross weight complies with trailer capacity limits.",
        keyAction: "Attach Crate #PKG-2026-042 (405.00 lbs) to the manifest.",
        expectedOutcome: "Total manifest package count and cumulative gross weight update automatically.",
      },
      {
        stepNumber: 3,
        title: "Driver Check-In & Freight Dispatch",
        description: "Verify driver identity, trailer plate, and security seal prior to releasing the truck from the dock.",
        keyAction: "Click 'Dispatch Manifest' to mark freight in transit.",
        expectedOutcome: "Manifest transitions to 'dispatched' status with dispatcher signature.",
      },
      {
        stepNumber: 4,
        title: "Proof of Delivery Capture",
        description: "Capture receiver signature and delivery timestamp at the customer receiving dock to close out the order.",
        keyAction: "Record delivery signature and timestamp.",
        expectedOutcome: "Manifest moves to 'delivered', closing the operational loop and enabling customer invoicing.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Manifest #SHP-2026-088",
        action: "Review the delivered Bill of Lading BOL-2026-088-FRM to Apex Aerospace Enclosures.",
        expectedResult: "Observe Old Dominion PRO #ODFL-982341109, gross weight 405 lbs, and R. Sterling's receiving signature.",
      },
      {
        title: "Explore Packaging Hand-Off",
        action: "Review sealed crates staged for shipping in the packaging workspace.",
        expectedResult: "Observe seamless transfer of sealed cartons onto freight manifests.",
      },
    ],
    businessOutcomes: [
      {
        title: "Zero Lost Freight Invoices",
        impact: "Digital BOLs and instant proof-of-delivery capture accelerate customer billing cycles by days.",
        metricBadge: "100% Proof of Delivery",
      },
      {
        title: "Carrier Chargeback Protection",
        impact: "Precise gross weight declarations protect against costly LTL freight re-weigh adjustments.",
        metricBadge: "Zero Weight Penalties",
      },
      {
        title: "Real-Time In-Transit Visibility",
        impact: "Customer service teams instantly see carrier PRO numbers and driver dispatch timestamps.",
        metricBadge: "Live Freight Tracking",
      },
    ],
    relatedModules: [
      { code: "packaging", name: "Packaging", path: "/packaging", description: "Feeds sealed, weight-verified containers directly into the shipping load builder." },
      { code: "jobs", name: "Production Jobs", path: "/jobs", description: "Closes out production orders upon carrier dispatch confirmation." },
      { code: "analytics", name: "Analytics", path: "/analytics", description: "Calculates on-time delivery percentages and freight cost per pound." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "LTL freight load consolidation, carrier PRO tracking, and aerospace customer dock delivery.",
        targetStep: 4,
      },
      {
        scenarioSlug: "mile-high-signworks",
        name: "Mile High Signworks",
        industry: "Architectural Signage & Crane Rigging",
        narrative: "Dedicated flatbed dispatch and on-site crane rigging delivery for commercial pylons.",
        targetStep: 3,
      },
    ],
    publicLinks: [
      {
        label: "Front Range Manufacturing Demo",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Explore the complete Front Range shipping and outbound logistics flow.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Learn about custom outbound logistics and carrier API integrations.",
        badgeText: "Services",
        isExternal: true,
      },
    ],
  },

  files: {
    moduleCode: "files",
    name: "File Storage & Document Vault",
    badge: "OPERATIONS//FILES",
    kicker: "Cryptographic Integrity, Entity Binding & Antivirus Quarantine Controls",
    whatItDoes:
      "Provides secure, isolated document storage for CAD drawings, Mill Test Reports (MTRs), AS9102 inspection sheets, and customer contracts with SHA-256 integrity checksums and clean status verification.",
    problemReplaced:
      "Replaces insecure shared network folders, unverified email file attachments, missing metallurgy certs, and lost engineering revisions that cause customer audit penalties.",
    whatYouAreLookingAt:
      "A centralized document vault showing uploaded files across jobs, purchase orders, inspections, and equipment with file sizes, MIME types, scan health statuses, and associated entity badges.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Secure Ingestion & Validation",
        description: "Files are uploaded directly into isolated tenant vaults with file extension and MIME type allowlist enforcement.",
        keyAction: "Upload CAD drawing or metallurgy cert PDF.",
        expectedOutcome: "File uploaded and assigned a unique storage key and SHA-256 hash.",
      },
      {
        stepNumber: 2,
        title: "Malware Scanning & Quarantine Gate",
        description: "Uploaded assets undergo automated security scanning before being released for operational use.",
        keyAction: "Verify file health status badge ('clean').",
        expectedOutcome: "Suspicious files are quarantined; verified files are approved for access.",
      },
      {
        stepNumber: 3,
        title: "Entity Binding & Contextual Linking",
        description: "Associate files directly to jobs, purchase orders, quality inspections, or equipment assets.",
        keyAction: "Bind Mill Test Report to Purchase Order #PO-2026-042.",
        expectedOutcome: "File becomes accessible directly within the linked operational module.",
      },
      {
        stepNumber: 4,
        title: "Audit Retrieval & Access Log Verification",
        description: "Review access audit records to verify authorized personnel viewing and downloading critical engineering documents.",
        keyAction: "Inspect document access timestamps and authorized user IDs.",
        expectedOutcome: "Complete compliance log for AS9100 / ISO document control audits.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Mill Test Report #file_front_range_mtr",
        action: "Review the certified metallurgy report for 5052-H32 aluminum lot #LOT-2026-AL-088.",
        expectedResult: "Observe clean status, SHA-256 integrity hash, and PO entity binding.",
      },
      {
        title: "Inspect Drawing Vault Record",
        action: "Examine the CAD drawing attached to Job #JOB-2026-104.",
        expectedResult: "Verify revision B alignment and virus scan clearance.",
      },
    ],
    businessOutcomes: [
      {
        title: "Guaranteed Document Integrity",
        impact: "Cryptographic SHA-256 checksums guarantee drawing files and test certs are never tampered with or corrupted.",
        metricBadge: "100% Checksum Verified",
      },
      {
        title: "Instant Auditor Retrieval",
        impact: "Retrieve any mill test report or inspection sheet for a customer audit in under 10 seconds.",
        metricBadge: "<10s Audit Retrieval",
      },
    ],
    relatedModules: [
      { code: "jobs", name: "Production Jobs", path: "/jobs", description: "Attaches customer drawings and CAD files to active job records." },
      { code: "purchasing", name: "Purchasing", path: "/purchasing", description: "Stores vendor mill test certs and shipping packing slips." },
      { code: "quality", name: "Quality", path: "/quality", description: "Binds AS9102 inspection sheets to FAI and NCR records." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Drawing packets, raw material mill test reports, and FAI inspection sheets bound to aerospace orders.",
        targetStep: 2,
      },
    ],
    publicLinks: [
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Explore enterprise file vault architecture and security controls.",
        badgeText: "Services",
        isExternal: true,
      },
      {
        label: "Front Range Demo Walkthrough",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Read how drawing files and mill certs bind into production jobs.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
    ],
  },

  analytics: {
    moduleCode: "analytics",
    name: "Analytics Pulse & Capacity Signals",
    badge: "OPERATIONS//ANALYTICS",
    kicker: "Real-Time Plant KPIs, Work Center Capacity Rebalancing & OEE Telemetry",
    whatItDoes:
      "Aggregates live plant metrics—WIP value, on-time delivery rates, first-pass yield, and machine uptime—while generating automated AI capacity rebalance suggestions with confidence ratings.",
    problemReplaced:
      "Replaces static end-of-month financial reports, delayed scrap tallies, and gut-feel scheduling decisions that fail to prevent machine overloads and delivery delays.",
    whatYouAreLookingAt:
      "An executive operations dashboard showing real-time WIP value ($142,500), 98.7% on-time delivery, 99.2% first-pass yield, station queue distribution, and approved capacity rebalancing suggestions.",
    workflowWalkthrough: [
      {
        stepNumber: 1,
        title: "Live Operational Pulse Monitoring",
        description: "Review top-line plant health indicators across active WIP, on-time delivery rates, and machine uptime.",
        keyAction: "Inspect plant summary KPI cards.",
        expectedOutcome: "Immediate visibility into operational throughput and delivery health.",
      },
      {
        stepNumber: 2,
        title: "Station Capacity & Bottleneck Analysis",
        description: "Examine queue depth and labor hour load across Laser Cutting, Press Brake, Welding, and Finishing work centers.",
        keyAction: "Evaluate work center utilization charts.",
        expectedOutcome: "Identify upstream or downstream bottlenecks before lines stall.",
      },
      {
        stepNumber: 3,
        title: "Automated Capacity Rebalance Recommendations",
        description: "The system generates predictive rebalancing suggestions with constraints, trade-offs, and confidence scores.",
        keyAction: "Review Suggestion #SUG-2026-001 (Route Secondary Forming to Brake Cell #2).",
        expectedOutcome: "Plant directors authorize rebalancing with supervisory sign-off.",
      },
      {
        stepNumber: 4,
        title: "Execution & Closed-Loop Throughput Verification",
        description: "Verify that executed capacity rebalances successfully clear station backlogs without creating downstream choke points.",
        keyAction: "Compare before-and-after station throughput and on-time percentages.",
        expectedOutcome: "Continuous feedback loop stabilizes plant production velocity.",
      },
    ],
    suggestedActions: [
      {
        title: "Inspect Rebalance Suggestion #SUG-2026-001",
        action: "Review Sarah Lin's approved capacity rebalance recommendation.",
        expectedResult: "Observe 94% confidence score, constraint evaluations, and trade-off analysis.",
      },
      {
        title: "Review Plant-Wide WIP Summary",
        action: "Examine active WIP value ($142,500) and First-Pass Yield (99.2%).",
        expectedResult: "Evaluate live executive KPI rollups.",
      },
    ],
    businessOutcomes: [
      {
        title: "Proactive Bottleneck Elimination",
        impact: "Predictive capacity rebalancing prevents machine overloads before orders miss customer deadlines.",
        metricBadge: "98.7% On-Time",
      },
      {
        title: "Maximizing Plant Throughput",
        impact: "Continuous utilization balancing increases overall plant revenue throughput by up to 22%.",
        metricBadge: "+22% Throughput",
      },
    ],
    relatedModules: [
      { code: "jobs", name: "Production Jobs", path: "/jobs", description: "Feeds active job progress and due dates into WIP calculations." },
      { code: "shopfloor", name: "ShopFloor", path: "/shopfloor", description: "Supplies actual labor minutes and completed piece counts." },
      { code: "quality", name: "Quality", path: "/quality", description: "Streams first-pass yield and scrap cost metrics." },
      { code: "maintenance", name: "Equipment Maintenance", path: "/maintenance", description: "Feeds downtime intervals into Overall Equipment Effectiveness (OEE)." },
    ],
    relevantDemoScenarios: [
      {
        scenarioSlug: "front-range-manufacturing",
        name: "Front Range Precision Manufacturing",
        industry: "Precision Sheet Metal & CNC Machining",
        narrative: "Real-time plant KPIs and automated press brake capacity rebalancing under high-mix laser load.",
        targetStep: 1,
      },
    ],
    publicLinks: [
      {
        label: "Front Range Manufacturing Demo",
        href: "https://yorkstead.com/demos/front-range-manufacturing",
        description: "Explore how Front Range uses real-time analytics to drive manufacturing efficiency.",
        badgeText: "Demo Walkthrough",
        isExternal: true,
      },
      {
        label: "Manufacturing Software Services",
        href: "https://yorkstead.com/services/manufacturing-software",
        description: "Custom analytics dashboards and production forecasting engines.",
        badgeText: "Services",
        isExternal: true,
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
