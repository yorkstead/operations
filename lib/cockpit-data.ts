export interface QuickLinkItem {
  id: string;
  title: string;
  category: "Production" | "Commercial" | "Plant Ops" | "Platform";
  description: string;
  href: string;
  iconName: string;
  tag: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline";
  isExternal?: boolean;
}

export const QUICK_LINKS: QuickLinkItem[] = [
  // Production Core
  {
    id: "shopfloor-terminal",
    title: "Shopfloor Terminal",
    category: "Production",
    description: "Digital travelers, QR station scanning, and real-time step execution.",
    href: "/shopfloor",
    iconName: "Hammer",
    tag: "Execution",
    badge: "Active Station",
    badgeVariant: "default",
  },
  {
    id: "job-packets",
    title: "Job Packet Intelligence",
    category: "Production",
    description: "CAD drawings, BOM verification, OCR drawing packets, and revisions.",
    href: "/job-packets",
    iconName: "FileSpreadsheet",
    tag: "Engineering",
  },
  {
    id: "jobs-routing",
    title: "Jobs & Work Orders",
    category: "Production",
    description: "Active work orders, traveler dispatch, machine scheduling, and status.",
    href: "/jobs",
    iconName: "Layers",
    tag: "Routing",
  },
  {
    id: "inventory-vault",
    title: "Inventory & Stock",
    category: "Production",
    description: "Material lots, minimum stock thresholds, bin tracking, and reservations.",
    href: "/inventory",
    iconName: "Package",
    tag: "Stock",
  },

  // Commercial & Client
  {
    id: "client-engagements",
    title: "Client Engagements",
    category: "Commercial",
    description: "Milestone checklists, 6-stage lifecycle, deliverables, and R2 file vault.",
    href: "/engagements",
    iconName: "Users",
    tag: "Delivery",
    badge: "4 Active",
    badgeVariant: "outline",
  },
  {
    id: "quoteflow-estimator",
    title: "QuoteFlow Estimator",
    category: "Commercial",
    description: "Consulting cost models, margin floor governance, and proposal generator.",
    href: "/quotes",
    iconName: "Calculator",
    tag: "Scoping",
  },
  {
    id: "audit-briefings",
    title: "Workflow Audit Engine",
    category: "Commercial",
    description: "Diagnostic discovery audits, efficiency assessments, and client reports.",
    href: "/audit",
    iconName: "FileCheck2",
    tag: "Audits",
  },
  {
    id: "master-directory",
    title: "Directory & Contacts",
    category: "Commercial",
    description: "Client stakeholders, industrial vendor contacts, and tenant roster.",
    href: "/directory",
    iconName: "BookOpen",
    tag: "Directory",
  },

  // Plant Ops & Quality
  {
    id: "quality-ncr",
    title: "Quality & NCR Desk",
    category: "Plant Ops",
    description: "First-article inspections, non-conformance reports, and CAPA logs.",
    href: "/quality",
    iconName: "ShieldCheck",
    tag: "QA / QC",
  },
  {
    id: "maintenance-telemetry",
    title: "Plant Maintenance",
    category: "Plant Ops",
    description: "Equipment telemetry, planned downtime windows, and work orders.",
    href: "/maintenance",
    iconName: "Wrench",
    tag: "Preventative",
  },
  {
    id: "shipping-dispatch",
    title: "Shipping & Logistics",
    category: "Plant Ops",
    description: "Package staging, BOL manifests, carrier dispatch, and proof-of-delivery.",
    href: "/shipping",
    iconName: "Truck",
    tag: "Fulfillment",
  },
  {
    id: "purchasing-po",
    title: "Purchasing & POs",
    category: "Plant Ops",
    description: "Vendor purchase orders, receipt matching, and material lead times.",
    href: "/purchasing",
    iconName: "Sliders",
    tag: "Sourcing",
  },

  // Platform & Knowledge
  {
    id: "knowhow-sops",
    title: "KnowHow SOP Base",
    category: "Platform",
    description: "Standard operating procedures, machine setup manuals, and safety rules.",
    href: "/knowledge",
    iconName: "BookOpen",
    tag: "SOPs",
  },
  {
    id: "cloud-devops",
    title: "Cloud Infrastructure",
    category: "Platform",
    description: "Cloudflare edge DNS, Cloud Run compute, and Neon PostgreSQL telemetry.",
    href: "/infrastructure",
    iconName: "Cloud",
    tag: "DevOps",
    badge: "Healthy",
    badgeVariant: "default",
  },
  {
    id: "activity-stream",
    title: "Activity Log & Audit",
    category: "Platform",
    description: "Security-sensitive events, tenant writes, and background job telemetry.",
    href: "/activity",
    iconName: "Activity",
    tag: "Security",
  },
  {
    id: "demo-sandboxes",
    title: "Deterministic Demo Hub",
    category: "Platform",
    description: "Isolated multi-scenario sandboxes for live client sales presentations.",
    href: "/demo",
    iconName: "Sparkles",
    tag: "Sales Mode",
  },
  {
    id: "file-vault",
    title: "Private File Vault",
    category: "Platform",
    description: "Authorized S3/R2 presigned upload/download object storage.",
    href: "/files",
    iconName: "FolderLock",
    tag: "Storage",
  },
];

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: "Client Milestone" | "Sprint Deadline" | "Audit & Review" | "Maintenance Window";
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
    title: "Front Range MFG: First-Article Digital Traveler Inspection",
    date: getRelativeDateStr(0),
    time: "10:30 AM",
    category: "Client Milestone",
    clientName: "Front Range MFG",
    status: "in_progress",
    notes: "Review CNC station routing QR scans and machine telemetry logs.",
  },
  {
    id: "cal_2",
    title: "Spacemail & Resend Deliverability Quarterly Audit",
    date: getRelativeDateStr(0),
    time: "02:00 PM",
    category: "Audit & Review",
    clientName: "Yorkstead Systems",
    status: "upcoming",
    notes: "Validate DMARC, DKIM, SPF alignment and neutral port failover.",
  },
  {
    id: "cal_3",
    title: "Mile High Signworks: CAD Vector Approval & Crane Dispatch Review",
    date: getRelativeDateStr(2),
    time: "09:00 AM",
    category: "Client Milestone",
    clientName: "Mile High Signworks",
    status: "upcoming",
    notes: "Architectural vector approval stage transition signoff.",
  },
  {
    id: "cal_4",
    title: "Cloudflare R2 Object Vault Migration Checkpoint",
    date: getRelativeDateStr(4),
    time: "11:00 AM",
    category: "Sprint Deadline",
    clientName: "Yorkstead Core",
    status: "upcoming",
    notes: "Verify zero-cross-tenant boundary and presigned expiration headers.",
  },
  {
    id: "cal_5",
    title: "Summit Facility Services: Multi-Site Checklist Sync",
    date: getRelativeDateStr(7),
    time: "01:30 PM",
    category: "Client Milestone",
    clientName: "Summit Facility",
    status: "upcoming",
    notes: "Review mobile checklist telemetry and offline sync queues.",
  },
  {
    id: "cal_6",
    title: "Plant Equipment: Scheduled CNC Spindle Maintenance",
    date: getRelativeDateStr(10),
    time: "08:00 AM",
    category: "Maintenance Window",
    clientName: "Shopfloor Operations",
    status: "upcoming",
    notes: "Planned machine pause and preventative grease flush.",
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
