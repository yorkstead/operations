export const ALL_CAPABILITIES = [
  // Organization Administration
  "org:manage_profile",
  "org:manage_members",
  "org:manage_roles",
  "org:manage_billing",
  "org:view_audit_logs",

  // Workflow Audit
  "audit:create",
  "audit:edit",
  "audit:delete",
  "audit:export_briefing",

  // Shopfloor & Traveler Execution
  "shopfloor:view_travelers",
  "shopfloor:execute_station",
  "shopfloor:reassign_job",

  // Inventory & Materials
  "inventory:view_stock",
  "inventory:adjust_count",
  "inventory:receive_material",

  // Quality & Maintenance
  "quality:record_inspection",
  "quality:scrap_rework",
  "quality:manage_schedules",

  // File Vault & Document Intelligence
  "files:upload",

  // Jobs & Packet Routing
  "jobs:update_status",

  // Quoting & Estimating
  "quoting:create_quote",
  "quoting:approve_margin",
  "quoting:convert_to_job",

  // Packaging & Shipping
  "shipping:create_manifest",
  "shipping:complete_shipment",

  // Purchasing spend authority
  "purchasing:approve_po",
] as const;

export type Capability = typeof ALL_CAPABILITIES[number];

export const ROLE_CAPABILITIES_MAP: Record<string, Capability[]> = {
  owner: [
    "org:manage_profile",
    "org:manage_members",
    "org:manage_roles",
    "org:manage_billing",
    "org:view_audit_logs",
    "audit:create",
    "audit:edit",
    "audit:delete",
    "audit:export_briefing",
    "files:upload",
    "jobs:update_status",
    "shopfloor:view_travelers",
    "shopfloor:execute_station",
    "shopfloor:reassign_job",
    "inventory:view_stock",
    "inventory:adjust_count",
    "inventory:receive_material",
    "quality:record_inspection",
    "quality:scrap_rework",
    "quality:manage_schedules",
    "quoting:create_quote",
    "quoting:approve_margin",
    "quoting:convert_to_job",
    "shipping:create_manifest",
    "shipping:complete_shipment",
    "purchasing:approve_po",
  ],
  admin: [
    "org:manage_profile",
    "org:manage_members",
    "org:manage_roles",
    "org:view_audit_logs",
    "audit:create",
    "audit:edit",
    "audit:export_briefing",
    "files:upload",
    "jobs:update_status",
    "shopfloor:view_travelers",
    "shopfloor:execute_station",
    "shopfloor:reassign_job",
    "inventory:view_stock",
    "inventory:adjust_count",
    "inventory:receive_material",
    "quality:record_inspection",
    "quality:scrap_rework",
    "quality:manage_schedules",
    "quoting:create_quote",
    "quoting:approve_margin",
    "quoting:convert_to_job",
    "shipping:create_manifest",
    "shipping:complete_shipment",
    "purchasing:approve_po",
  ],
  manager: [
    "org:view_audit_logs",
    "audit:create",
    "audit:edit",
    "audit:export_briefing",
    "files:upload",
    "jobs:update_status",
    "shopfloor:view_travelers",
    "shopfloor:execute_station",
    "shopfloor:reassign_job",
    "inventory:view_stock",
    "inventory:adjust_count",
    "inventory:receive_material",
    "quality:record_inspection",
    "quality:scrap_rework",
    "quoting:create_quote",
    "quoting:approve_margin",
    "quoting:convert_to_job",
    "shipping:create_manifest",
    "shipping:complete_shipment",
    "purchasing:approve_po",
  ],
  operator: [
    "shopfloor:view_travelers",
    "shopfloor:execute_station",
    "inventory:view_stock",
    "quality:record_inspection",
    "shipping:create_manifest",
  ],
  viewer: [
    "audit:export_briefing",
    "shopfloor:view_travelers",
    "inventory:view_stock",
  ],
  demo_visitor: [
    "audit:create",
    "audit:edit",
    "audit:export_briefing",
    "shopfloor:view_travelers",
    "shopfloor:execute_station",
    "inventory:view_stock",
    "quality:record_inspection",
    "quoting:create_quote",
  ],
};
