export interface QuickLinkItem {
  id: string;
  title: string;
  category:
    | "Dev & Sprints"
    | "Cloud & Platform"
    | "Software Modules"
    | "Client Demos";
  description: string;
  href: string;
  iconName: string;
  tag: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
  isExternal?: boolean;
}

export const QUICK_LINKS: QuickLinkItem[] = [
  // 1. Dev & Sprints
  {
    id: "projects-command-center",
    title: "Projects & Sprints",
    category: "Dev & Sprints",
    description:
      "Active engineering sprints, milestone checklists, staging URLs, and capital tracking.",
    href: "/projects",
    iconName: "FolderKanban",
    tag: "Sprints",
    badge: "Command Center",
    badgeVariant: "default",
  },
  {
    id: "client-engagements",
    title: "Client Software Delivery",
    category: "Dev & Sprints",
    description:
      "6-stage software delivery lifecycle, milestone tasks, deliverables, and SOW checklists.",
    href: "/engagements",
    iconName: "Users",
    tag: "Delivery",
    badge: "4 Active",
    badgeVariant: "outline",
  },
  {
    id: "quoteflow-estimator",
    title: "QuoteFlow & Scoping",
    category: "Dev & Sprints",
    description:
      "Software consulting cost models, margin floors, and client proposal generator.",
    href: "/quotes",
    iconName: "Calculator",
    tag: "Scoping",
  },
  {
    id: "workflow-audit-engine",
    title: "Architecture Audit Engine",
    category: "Dev & Sprints",
    description:
      "Client technical discovery, diagnostic briefings, and systems bottleneck assessments.",
    href: "/audit",
    iconName: "FileCheck2",
    tag: "Architecture",
  },
  {
    id: "knowhow-sops",
    title: "Engineering SOPs & Docs",
    category: "Dev & Sprints",
    description:
      "Software architecture guidelines, module contracts, API standards, and runbooks.",
    href: "/knowledge",
    iconName: "BookOpen",
    tag: "Engineering",
  },
  {
    id: "master-directory",
    title: "Directory & Stakeholders",
    category: "Dev & Sprints",
    description:
      "Client technical contacts, engineering stakeholders, and tenant roster.",
    href: "/directory",
    iconName: "Users",
    tag: "Contacts",
  },

  // 2. Cloud & Platform
  {
    id: "cloud-infrastructure",
    title: "Cloud Ops & DevOps",
    category: "Cloud & Platform",
    description:
      "Google Cloud Run, Neon Postgres, Cloudflare Edge DNS, and deployment telemetry.",
    href: "/infrastructure",
    iconName: "Cloud",
    tag: "DevOps",
    badge: "Healthy",
    badgeVariant: "default",
  },
  {
    id: "file-vault",
    title: "Object Storage & Vault",
    category: "Cloud & Platform",
    description:
      "Cloudflare R2/S3 storage, presigned upload/download URLs, and drawing artifacts.",
    href: "/files",
    iconName: "FolderLock",
    tag: "Storage",
  },
  {
    id: "activity-security-log",
    title: "Security & Event Stream",
    category: "Cloud & Platform",
    description:
      "Operational event outbox, tenant access logs, and background worker telemetry.",
    href: "/activity",
    iconName: "Activity",
    tag: "Security",
  },
  {
    id: "analytics-telemetry",
    title: "Analytics & Telemetry",
    category: "Cloud & Platform",
    description:
      "App route metrics, event throughput, transaction volume, and latency.",
    href: "/analytics",
    iconName: "Activity",
    tag: "Telemetry",
  },
  {
    id: "org-multi-tenant",
    title: "Multi-Tenant Config",
    category: "Cloud & Platform",
    description:
      "Tenant 0 super-admin settings, tenant capabilities, and organization profile.",
    href: "/settings/organization",
    iconName: "Sliders",
    tag: "Auth / Tenant",
  },
  {
    id: "passkey-auth",
    title: "Passkey & WebAuthn",
    category: "Cloud & Platform",
    description:
      "FIDO2 passkey credentials, session identity, and hardware security keys.",
    href: "/account/passkeys",
    iconName: "ShieldCheck",
    tag: "Identity",
  },

  // 3. Software Modules (In Active Dev)
  {
    id: "shopfloor-module",
    title: "ShopFloor Execution Engine",
    category: "Software Modules",
    description:
      "Digital traveler state machines, QR scanning endpoints, and station dispatches.",
    href: "/shopfloor",
    iconName: "Hammer",
    tag: "Workflow Engine",
  },
  {
    id: "job-packets-module",
    title: "Job Packet Intelligence",
    category: "Software Modules",
    description:
      "CAD vector parsing, OCR drawing ingestion, and BOM schema extraction.",
    href: "/job-packets",
    iconName: "FileSpreadsheet",
    tag: "Data Ingestion",
  },
  {
    id: "jobs-routing-module",
    title: "Work Order & Routing Service",
    category: "Software Modules",
    description:
      "Machine scheduling algorithms, job dispatch, and operational status.",
    href: "/jobs",
    iconName: "Layers",
    tag: "Scheduling Engine",
  },
  {
    id: "inventory-module",
    title: "Inventory & Material Ledger",
    category: "Software Modules",
    description:
      "Material transaction ledger, reorder triggers, and balance state machines.",
    href: "/inventory",
    iconName: "Package",
    tag: "Ledger Service",
  },
  {
    id: "quality-module",
    title: "Quality & NCR Desk",
    category: "Software Modules",
    description:
      "First-article inspection workflows, defect state machines, and CAPA logs.",
    href: "/quality",
    iconName: "ShieldCheck",
    tag: "Quality Engine",
  },
  {
    id: "maintenance-module",
    title: "Maintenance Telemetry",
    category: "Software Modules",
    description:
      "Equipment telemetry listeners, downtime intervals, and preventative queues.",
    href: "/maintenance",
    iconName: "Wrench",
    tag: "Telemetry Service",
  },
  {
    id: "shipping-module",
    title: "Shipping & BOL Manifests",
    category: "Software Modules",
    description:
      "BOL generator, staging state machines, and carrier dispatch APIs.",
    href: "/shipping",
    iconName: "Truck",
    tag: "Logistics Engine",
  },
  {
    id: "purchasing-module",
    title: "Purchasing & PO Engine",
    category: "Software Modules",
    description:
      "Vendor PO automation, receipt matching, and material lead time estimators.",
    href: "/purchasing",
    iconName: "Sliders",
    tag: "Procurement",
  },

  // 4. Live Client Demos
  {
    id: "demo-hub",
    title: "Deterministic Demo Hub",
    category: "Client Demos",
    description:
      "Isolated multi-scenario sandboxes for live client sales presentations.",
    href: "/demo",
    iconName: "Sparkles",
    tag: "Sales Mode",
    badge: "3 Sandboxes",
    badgeVariant: "default",
  },
  {
    id: "demo-front-range",
    title: "Front Range Precision Demo",
    category: "Client Demos",
    description:
      "CNC machining, digital travelers, and QR first-article inspections sandbox.",
    href: "/demo?scenario=front-range-manufacturing",
    iconName: "Hammer",
    tag: "CNC / Traveler",
  },
  {
    id: "demo-summit-facility",
    title: "Summit Facility Services Demo",
    category: "Client Demos",
    description:
      "Multi-site facility inspection, mobile checklist, and equipment telemetry sandbox.",
    href: "/demo?scenario=summit-facility-services",
    iconName: "Wrench",
    tag: "Facility Telemetry",
  },
  {
    id: "demo-mile-high",
    title: "Mile High Signworks Demo",
    category: "Client Demos",
    description:
      "Architectural CAD vector approvals, CNC routing, and field crane dispatch sandbox.",
    href: "/demo?scenario=mile-high-signworks",
    iconName: "Truck",
    tag: "CAD / Dispatch",
  },
];

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category:
    | "Client Milestone"
    | "Sprint Deadline"
    | "Audit & Review"
    | "Maintenance Window";
  clientName?: string;
  status: "upcoming" | "completed" | "in_progress" | "critical";
  notes?: string;
}

export function getRelativeDateStr(dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal_1",
    title:
      "Front Range MFG: First-Article Digital Traveler Review & Staging Cutover",
    date: getRelativeDateStr(0),
    time: "10:30 AM",
    category: "Client Milestone",
    clientName: "Front Range MFG",
    status: "in_progress",
    notes:
      "Review CNC station routing QR scans, traveler dispatches, and staging sandbox.",
  },
  {
    id: "cal_2",
    title: "Spacemail & Resend Deliverability Quarterly DevOps Audit",
    date: getRelativeDateStr(0),
    time: "02:00 PM",
    category: "Audit & Review",
    clientName: "Yorkstead Systems",
    status: "upcoming",
    notes: "Validate DMARC, DKIM, SPF alignment and neutral port failover.",
  },
  {
    id: "cal_3",
    title: "Mile High Signworks: CAD Vector Approval & Stage Transition Sprint",
    date: getRelativeDateStr(2),
    time: "09:00 AM",
    category: "Client Milestone",
    clientName: "Mile High Signworks",
    status: "upcoming",
    notes:
      "Architectural vector approval stage transition signoff and crane dispatch review.",
  },
  {
    id: "cal_4",
    title: "Cloudflare R2 Object Vault Migration Sprint Checkpoint",
    date: getRelativeDateStr(4),
    time: "11:00 AM",
    category: "Sprint Deadline",
    clientName: "Yorkstead Core",
    status: "upcoming",
    notes:
      "Verify zero-cross-tenant boundary and presigned expiration headers.",
  },
  {
    id: "cal_5",
    title: "Summit Facility Services: Multi-Site Checklist Sync & Acceptance",
    date: getRelativeDateStr(7),
    time: "01:30 PM",
    category: "Client Milestone",
    clientName: "Summit Facility",
    status: "upcoming",
    notes:
      "Review mobile checklist telemetry, offline sync queues, and staging demo.",
  },
  {
    id: "cal_6",
    title:
      "Cloud Infrastructure: Database Connection Pool & Index Optimization",
    date: getRelativeDateStr(10),
    time: "08:00 AM",
    category: "Maintenance Window",
    clientName: "Neon Postgres / Vercel",
    status: "upcoming",
    notes:
      "Scheduled database connection pool maintenance and query index verification.",
  },
  {
    id: "cal_7",
    title: "Platform Security & Tenant Isolation Red-Team Verification",
    date: getRelativeDateStr(-2),
    time: "03:00 PM",
    category: "Audit & Review",
    clientName: "Yorkstead Security",
    status: "completed",
    notes: "Synthetic sandbox isolation audit verified with zero leaks.",
  },
];

// ---------------------------------------------------------------------------
// Running Projects Registry
// ---------------------------------------------------------------------------
// `status` drives the card health color:
//   Active    → green   (all good)
//   In Review → amber   (needs attention)
//   Paused    → sky     (on hold)
//   Blocked   → rose    (something broken / needs action)
//
// `note` is optional — shown as a small alert line when set.
//
// `service` on each link drives the icon shown next to the label so you can
// recognize GitHub vs Vercel vs Cloudflare at a glance without reading.
//
// Update `href` values below when real project URLs are confirmed.
// ---------------------------------------------------------------------------

export type ProjectStatus = "Active" | "Paused" | "Blocked" | "In Review";

/** Named service — maps to an icon in the component */
export type ProjectService =
  | "github"
  | "vercel"
  | "netlify"
  | "cloudflare"
  | "cloud-run"
  | "neon"
  | "internal";

export interface ProjectLink {
  label: string;
  href: string;
  isExternal: boolean;
  service: ProjectService;
}

export interface RunningProject {
  id: string;
  codename: string;
  title: string;
  description: string;
  status: ProjectStatus;
  /** Short phase label e.g. "Sprint 3" or "Live" */
  stageBadge: string;
  /** Tailwind bg-* for the left accent stripe */
  accentClass: string;
  /** Optional one-line alert shown when status != Active */
  note?: string;
  links: ProjectLink[];
}

export const RUNNING_PROJECTS: RunningProject[] = [
  {
    id: "ellwood",
    codename: "Ellwood",
    title: "Project Ellwood",
    description: "Client software delivery engagement.",
    status: "Active",
    stageBadge: "Sprint 2",
    accentClass: "bg-primary",
    links: [
      {
        label: "Engagement",
        href: "/engagements",
        isExternal: false,
        service: "internal",
      },
      {
        label: "GitHub",
        href: "https://github.com/yorkstead/ellwood",
        isExternal: true,
        service: "github",
      },
      {
        label: "Vercel",
        href: "https://vercel.com/yorkstead-systems/ellwood",
        isExternal: true,
        service: "vercel",
      },
      {
        label: "Cloudflare",
        href: "https://dash.cloudflare.com",
        isExternal: true,
        service: "cloudflare",
      },
    ],
  },
  {
    id: "sic",
    codename: "Sic",
    title: "Project Sic",
    description: "Client software delivery engagement.",
    status: "Active",
    stageBadge: "Sprint 1",
    accentClass: "bg-sky-400",
    links: [
      {
        label: "Engagement",
        href: "/engagements",
        isExternal: false,
        service: "internal",
      },
      {
        label: "GitHub",
        href: "https://github.com/Yorkstead-Systems/sic",
        isExternal: true,
        service: "github",
      },
      {
        label: "Vercel",
        href: "https://vercel.com/yorkstead-systems/sic",
        isExternal: true,
        service: "vercel",
      },
      {
        label: "Cloudflare",
        href: "https://dash.cloudflare.com",
        isExternal: true,
        service: "cloudflare",
      },
    ],
  },
  {
    id: "barcodes",
    codename: "Barcodes",
    title: "Project Barcodes",
    description: "Client software delivery engagement.",
    status: "Active",
    stageBadge: "Staging",
    accentClass: "bg-amber-400",
    links: [
      {
        label: "Engagement",
        href: "/engagements",
        isExternal: false,
        service: "internal",
      },
      {
        label: "GitHub",
        href: "https://github.com/Yorkstead-Systems/barcodes",
        isExternal: true,
        service: "github",
      },
      {
        label: "Vercel",
        href: "https://vercel.com/yorkstead-systems/barcodes",
        isExternal: true,
        service: "vercel",
      },
      {
        label: "Cloudflare",
        href: "https://dash.cloudflare.com",
        isExternal: true,
        service: "cloudflare",
      },
    ],
  },
  {
    id: "jwld",
    codename: "Jwld",
    title: "Project Jwld",
    description: "Client software delivery engagement.",
    status: "Active",
    stageBadge: "Sprint 3",
    accentClass: "bg-emerald-400",
    links: [
      {
        label: "Engagement",
        href: "/engagements",
        isExternal: false,
        service: "internal",
      },
      {
        label: "GitHub",
        href: "https://github.com/Yorkstead-Systems/jwld",
        isExternal: true,
        service: "github",
      },
      {
        label: "Vercel",
        href: "https://vercel.com/yorkstead-systems/jwld",
        isExternal: true,
        service: "vercel",
      },
      {
        label: "Cloudflare",
        href: "https://dash.cloudflare.com",
        isExternal: true,
        service: "cloudflare",
      },
    ],
  },
  {
    id: "website",
    codename: "Website",
    title: "Yorkstead Website",
    description:
      "Public site — yorkstead.com. Deploys to Netlify; edge via Cloudflare.",
    status: "Active",
    stageBadge: "Live",
    accentClass: "bg-purple-400",
    links: [
      {
        label: "yorkstead.com",
        href: "https://yorkstead.com",
        isExternal: true,
        service: "netlify",
      },
      {
        label: "GitHub",
        href: "https://github.com/Yorkstead-Systems/yorkstead-website",
        isExternal: true,
        service: "github",
      },
      {
        label: "Netlify",
        href: "https://app.netlify.com/sites/yorkstead",
        isExternal: true,
        service: "netlify",
      },
      {
        label: "Cloudflare",
        href: "https://dash.cloudflare.com",
        isExternal: true,
        service: "cloudflare",
      },
    ],
  },
  {
    id: "operations",
    codename: "Operations",
    title: "Yorkstead Operations",
    description:
      "This platform — ops.yorkstead.com. Vercel + Neon + Cloud Run + Cloudflare.",
    status: "Active",
    stageBadge: "Live",
    accentClass: "bg-rose-400",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/Yorkstead-Systems/yorkstead-operations",
        isExternal: true,
        service: "github",
      },
      {
        label: "Vercel",
        href: "https://vercel.com/yorkstead-operations",
        isExternal: true,
        service: "vercel",
      },
      {
        label: "Cloudflare",
        href: "https://dash.cloudflare.com",
        isExternal: true,
        service: "cloudflare",
      },
      {
        label: "Cloud Run",
        href: "https://console.cloud.google.com/run",
        isExternal: true,
        service: "cloud-run",
      },
      {
        label: "Neon",
        href: "https://console.neon.tech",
        isExternal: true,
        service: "neon",
      },
    ],
  },
];
