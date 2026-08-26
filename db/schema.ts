import { pgTable, text, timestamp, integer, boolean, jsonb, index, uniqueIndex, real, numeric, bigint } from "drizzle-orm/pg-core";

// 1. Better Auth Tables
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  issuer: text("issuer"),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// 2. Organization & Tenancy Tables
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").default("active").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const memberships = pgTable("memberships", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("user_org_idx").on(table.userId, table.organizationId),
  index("memberships_org_idx").on(table.organizationId),
]);

// 3. Jobs Aggregate Tables
export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  jobNumber: text("job_number").notNull(),
  title: text("title").notNull(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  currentStatus: text("current_status").notNull(),
  priority: text("priority").default("standard").notNull(),
  currentRevision: text("current_revision").default("A").notNull(),
  targetDueDate: text("target_due_date").notNull(),
  estimatedLaborHours: integer("estimated_labor_hours").default(10).notNull(),
  notes: text("notes"),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("job_number_org_idx").on(table.organizationId, table.jobNumber),
  index("jobs_org_idx").on(table.organizationId),
  index("jobs_status_idx").on(table.organizationId, table.currentStatus),
]);

export const jobTimelineEvents = pgTable("job_timeline_events", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  actorName: text("actor_name").notNull(),
  reason: text("reason").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => [
  index("job_timeline_job_idx").on(table.jobId),
  index("job_timeline_org_idx").on(table.organizationId),
]);

export const jobRevisions = pgTable("job_revisions", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  revision: text("revision").notNull(),
  changeSummary: text("change_summary").notNull(),
  changedByUserId: text("changed_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("job_revisions_job_idx").on(table.jobId),
  index("job_revisions_org_idx").on(table.organizationId),
]);

// 4. Shopfloor Aggregate Tables
export const workCenters = pgTable("work_centers", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").default("available").notNull(),
  hourlyCostRate: real("hourly_cost_rate").default(85.0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("work_center_org_code_idx").on(table.organizationId, table.code),
  index("work_centers_org_idx").on(table.organizationId),
]);

export const shopfloorTravelers = pgTable("shopfloor_travelers", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  travelerNumber: text("traveler_number").notNull(),
  qrCodeData: text("qr_code_data").notNull(),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  jobNumber: text("job_number").notNull(),
  partDescription: text("part_description").notNull(),
  customerName: text("customer_name").notNull(),
  totalQuantity: integer("total_quantity").notNull(),
  currentStepIndex: integer("current_step_index").default(0).notNull(),
  status: text("status").default("queued").notNull(),
  priority: text("priority").default("standard").notNull(),
  targetDueDate: text("target_due_date").notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("traveler_number_org_idx").on(table.organizationId, table.travelerNumber),
  index("travelers_org_idx").on(table.organizationId),
  index("travelers_job_idx").on(table.jobId),
  index("travelers_status_idx").on(table.organizationId, table.status),
]);

export const travelerOperations = pgTable("traveler_operations", {
  id: text("id").primaryKey(),
  travelerId: text("traveler_id").notNull().references(() => shopfloorTravelers.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  workCenterCode: text("work_center_code").notNull(),
  workCenterName: text("work_center_name").notNull(),
  operationName: text("operation_name").notNull(),
  requiredQuantity: integer("required_quantity").notNull(),
  completedQuantity: integer("completed_quantity").default(0).notNull(),
  scrappedQuantity: integer("scrapped_quantity").default(0).notNull(),
  status: text("status").default("pending").notNull(),
  assignedOperatorId: text("assigned_operator_id"),
  assignedOperatorName: text("assigned_operator_name"),
  blockerReason: text("blocker_reason"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  actualLaborMinutes: integer("actual_labor_minutes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("traveler_ops_traveler_idx").on(table.travelerId),
  index("traveler_ops_org_idx").on(table.organizationId),
]);

export const travelerBlockers = pgTable("traveler_blockers", {
  id: text("id").primaryKey(),
  travelerId: text("traveler_id").notNull().references(() => shopfloorTravelers.id, { onDelete: "cascade" }),
  operationId: text("operation_id").notNull().references(() => travelerOperations.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  reportedByUserId: text("reported_by_user_id").notNull(),
  reportedByName: text("reported_by_name").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("active").notNull(),
  resolvedByUserId: text("resolved_by_user_id"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("traveler_blockers_traveler_idx").on(table.travelerId),
  index("traveler_blockers_org_idx").on(table.organizationId),
]);

// 5. Inventory Aggregate Tables (Migration 0003)
export const inventoryItems = pgTable("inventory_items", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  itemCode: text("item_code").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  defaultLocationId: text("default_location_id"),
  reorderPoint: numeric("reorder_point", { precision: 14, scale: 4 }).default("0.0000").notNull(),
  reorderQuantity: numeric("reorder_quantity", { precision: 14, scale: 4 }).default("0.0000").notNull(),
  standardCostCents: integer("standard_cost_cents").default(0).notNull(),
  lotTrackingRequired: boolean("lot_tracking_required").default(false).notNull(),
  status: text("status").default("active").notNull(), // 'active' | 'archived'
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("inventory_items_org_code_idx").on(table.organizationId, table.itemCode),
  index("inventory_items_org_idx").on(table.organizationId),
  index("inventory_items_category_idx").on(table.organizationId, table.category),
]);

export const inventoryLocations = pgTable("inventory_locations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  locationCode: text("location_code").notNull(),
  name: text("name").notNull(),
  type: text("type").default("bin").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("inventory_locations_org_code_idx").on(table.organizationId, table.locationCode),
  index("inventory_locations_org_idx").on(table.organizationId),
]);

export const inventoryLots = pgTable("inventory_lots", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  lotNumber: text("lot_number").notNull(),
  manufactureDate: timestamp("manufacture_date"),
  expirationDate: timestamp("expiration_date"),
  supplierReference: text("supplier_reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("inventory_lots_org_item_lot_idx").on(table.organizationId, table.itemId, table.lotNumber),
  index("inventory_lots_org_idx").on(table.organizationId),
  index("inventory_lots_item_idx").on(table.itemId),
]);

export const inventoryItemBalances = pgTable("inventory_item_balances", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  locationId: text("location_id").notNull().references(() => inventoryLocations.id, { onDelete: "cascade" }),
  lotId: text("lot_id").references(() => inventoryLots.id, { onDelete: "set null" }),
  onHandQuantity: numeric("on_hand_quantity", { precision: 14, scale: 4 }).default("0.0000").notNull(),
  allocatedQuantity: numeric("allocated_quantity", { precision: 14, scale: 4 }).default("0.0000").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("inv_balances_item_idx").on(table.organizationId, table.itemId),
  index("inv_balances_loc_idx").on(table.organizationId, table.locationId),
]);

export const inventoryMovements = pgTable("inventory_movements", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  movementType: text("movement_type").notNull(), // 'receive' | 'issue_to_job' | 'return_from_job' | 'transfer' | 'scrap' | 'cycle_count_adjustment'
  itemId: text("item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  lotId: text("lot_id").references(() => inventoryLots.id, { onDelete: "set null" }),
  fromLocationId: text("from_location_id").references(() => inventoryLocations.id, { onDelete: "set null" }),
  toLocationId: text("to_location_id").references(() => inventoryLocations.id, { onDelete: "set null" }),
  quantity: numeric("quantity", { precision: 14, scale: 4 }).notNull(),
  unitCostCents: integer("unit_cost_cents").default(0).notNull(),
  jobId: text("job_id").references(() => jobs.id, { onDelete: "set null" }),
  travelerId: text("traveler_id").references(() => shopfloorTravelers.id, { onDelete: "set null" }),
  originalMovementId: text("original_movement_id"),
  actorUserId: text("actor_user_id").notNull(),
  reason: text("reason"),
  idempotencyKey: text("idempotency_key"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("inv_movements_idemp_idx").on(table.organizationId, table.idempotencyKey),
  index("inv_movements_org_idx").on(table.organizationId),
  index("inv_movements_item_idx").on(table.organizationId, table.itemId),
  index("inv_movements_job_idx").on(table.jobId),
  index("inv_movements_traveler_idx").on(table.travelerId),
  index("inv_movements_occurred_idx").on(table.organizationId, table.occurredAt),
]);

export const inventoryCycleCounts = pgTable("inventory_cycle_counts", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull().references(() => inventoryItems.id, { onDelete: "cascade" }),
  locationId: text("location_id").notNull().references(() => inventoryLocations.id, { onDelete: "cascade" }),
  lotId: text("lot_id").references(() => inventoryLots.id, { onDelete: "set null" }),
  expectedQuantity: numeric("expected_quantity", { precision: 14, scale: 4 }).notNull(),
  observedQuantity: numeric("observed_quantity", { precision: 14, scale: 4 }).notNull(),
  varianceQuantity: numeric("variance_quantity", { precision: 14, scale: 4 }).notNull(),
  reason: text("reason").notNull(),
  countedByUserId: text("counted_by_user_id").notNull(),
  approvedByUserId: text("approved_by_user_id"),
  resultingMovementId: text("resulting_movement_id").references(() => inventoryMovements.id, { onDelete: "set null" }),
  countedAt: timestamp("counted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("inv_cycle_counts_org_idx").on(table.organizationId),
  index("inv_cycle_counts_item_idx").on(table.organizationId, table.itemId),
]);

// 6. Quality & Non-Conformance Domain (Migration 0004)
export const qualityInspectionRecords = pgTable("quality_inspection_records", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  inspectionType: text("inspection_type").notNull(), // 'first_article' | 'in_process' | 'final_acceptance' | 'receiving_dock'
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "restrict" }),
  jobNumber: text("job_number").notNull(),
  partDescription: text("part_description").notNull(),
  travelerOperationId: text("traveler_operation_id"),
  inspectorUserId: text("inspector_user_id").notNull(),
  inspectorName: text("inspector_name").notNull(),
  status: text("status").notNull(), // 'passed' | 'failed' | 'passed_with_concession'
  sampleSize: integer("sample_size").notNull(),
  passedQuantity: integer("passed_quantity").notNull(),
  failedQuantity: integer("failed_quantity").notNull(),
  checklist: jsonb("checklist").notNull(),
  ncrId: text("ncr_id"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("quality_insp_org_idx").on(table.organizationId),
  index("quality_insp_job_idx").on(table.organizationId, table.jobId),
]);

export const qualityNonConformanceReports = pgTable("quality_non_conformance_reports", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  ncrNumber: text("ncr_number").notNull(),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "restrict" }),
  jobNumber: text("job_number").notNull(),
  partDescription: text("part_description").notNull(),
  operationName: text("operation_name").notNull(),
  defectDescription: text("defect_description").notNull(),
  defectCategory: text("defect_category").notNull(),
  severity: text("severity").notNull(), // 'minor' | 'major' | 'critical'
  status: text("status").default("open").notNull(), // 'open' | 'under_containment' | 'dispositioned' | 'closed'
  defectQuantity: integer("defect_quantity").notNull(),
  containmentActions: jsonb("containment_actions").notNull(),
  rootCauseAnalysis: text("root_cause_analysis"),
  disposition: text("disposition").default("pending_review").notNull(), // 'use_as_is' | 'rework' | 'scrap_and_remake' | 'return_to_vendor' | 'pending_review'
  dispositionNotes: text("disposition_notes"),
  scrapCostCents: integer("scrap_cost_cents").default(0).notNull(),
  reworkLaborMinutes: integer("rework_labor_minutes").default(0).notNull(),
  remakeCostCents: integer("remake_cost_cents").default(0).notNull(),
  createdByUserId: text("created_by_user_id").notNull(),
  createdByName: text("created_by_name").notNull(),
  approvedByUserId: text("approved_by_user_id"),
  approvedByName: text("approved_by_name"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("quality_ncr_org_number_idx").on(table.organizationId, table.ncrNumber),
  index("quality_ncr_org_idx").on(table.organizationId),
  index("quality_ncr_status_idx").on(table.organizationId, table.status),
]);

// 7. Maintenance & Equipment Domain (Migration 0005)
export const equipmentAssets = pgTable("equipment_assets", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  assetTag: text("asset_tag").notNull(),
  name: text("name").notNull(),
  manufacturer: text("manufacturer").notNull(),
  modelNumber: text("model_number").notNull(),
  serialNumber: text("serial_number").notNull(),
  workCenterCode: text("work_center_code").notNull(),
  locationCode: text("location_code").notNull(),
  criticality: text("criticality").default("medium").notNull(),
  status: text("status").default("operational").notNull(),
  qrCodeData: text("qr_code_data").notNull(),
  lastServiceDate: text("last_service_date").notNull(),
  nextScheduledPmDate: text("next_scheduled_pm_date").notNull(),
  totalRunHours: integer("total_run_hours").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("equipment_assets_org_tag_idx").on(table.organizationId, table.assetTag),
  index("equipment_assets_org_idx").on(table.organizationId),
]);

export const maintenanceDowntimeIntervals = pgTable("maintenance_downtime_intervals", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  equipmentId: text("equipment_id").notNull().references(() => equipmentAssets.id, { onDelete: "cascade" }),
  assetTag: text("asset_tag").notNull(),
  category: text("category").notNull(),
  reason: text("reason").notNull(),
  impactSummary: text("impact_summary").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  durationMinutes: integer("duration_minutes"),
  reportedByUserId: text("reported_by_user_id").notNull(),
  reportedByName: text("reported_by_name").notNull(),
  resolvedByUserId: text("resolved_by_user_id"),
  resolvedByName: text("resolved_by_name"),
  workOrderId: text("work_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("maint_downtime_org_idx").on(table.organizationId),
  index("maint_downtime_equip_idx").on(table.organizationId, table.equipmentId),
]);

export const maintenanceWorkOrders = pgTable("maintenance_work_orders", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  workOrderNumber: text("work_order_number").notNull(),
  equipmentId: text("equipment_id").notNull().references(() => equipmentAssets.id, { onDelete: "cascade" }),
  assetTag: text("asset_tag").notNull(),
  type: text("type").notNull(),
  status: text("status").default("open").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").default("standard").notNull(),
  assignedTechnicianId: text("assigned_technician_id"),
  assignedTechnicianName: text("assigned_technician_name"),
  replacementPartsUsed: jsonb("replacement_parts_used").notNull(),
  actualLaborMinutes: integer("actual_labor_minutes").default(0).notNull(),
  returnToServiceAuthorizedByUserId: text("return_to_service_authorized_by_user_id"),
  returnToServiceAuthorizedByName: text("return_to_service_authorized_by_name"),
  returnToServiceNotes: text("return_to_service_notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("maint_wo_org_number_idx").on(table.organizationId, table.workOrderNumber),
  index("maint_wo_org_idx").on(table.organizationId),
]);

// 8. Purchasing & Material Sourcing Domain (Migration 0006)
export const purchasingVendors = pgTable("purchasing_vendors", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  vendorCode: text("vendor_code").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  paymentTerms: text("payment_terms").default("net_30").notNull(),
  currency: text("currency").default("USD").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("purchasing_vendors_org_code_idx").on(table.organizationId, table.vendorCode),
  index("purchasing_vendors_org_idx").on(table.organizationId),
]);

export const purchasingPurchaseOrders = pgTable("purchasing_purchase_orders", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  poNumber: text("po_number").notNull(),
  vendorId: text("vendor_id").notNull(),
  vendorName: text("vendor_name").notNull(),
  vendorEmail: text("vendor_email").notNull(),
  status: text("status").default("draft").notNull(),
  subtotalCostCents: integer("subtotal_cost_cents").default(0).notNull(),
  shippingCostCents: integer("shipping_cost_cents").default(0).notNull(),
  taxCostCents: integer("tax_cost_cents").default(0).notNull(),
  totalCostCents: integer("total_cost_cents").default(0).notNull(),
  approvalThresholdCents: integer("approval_threshold_cents").default(500000).notNull(),
  requiresManagerApproval: boolean("requires_manager_approval").default(false).notNull(),
  approvedByUserId: text("approved_by_user_id"),
  approvedByName: text("approved_by_name"),
  approvedAt: timestamp("approved_at"),
  expectedDeliveryDate: text("expected_delivery_date").notNull(),
  issuedAt: timestamp("issued_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("purchasing_po_org_number_idx").on(table.organizationId, table.poNumber),
  index("purchasing_po_org_idx").on(table.organizationId),
]);

export const purchasingPoLineItems = pgTable("purchasing_po_line_items", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  poId: text("po_id").notNull().references(() => purchasingPurchaseOrders.id, { onDelete: "cascade" }),
  lineNumber: integer("line_number").notNull(),
  itemCode: text("item_code").notNull(),
  description: text("description").notNull(),
  quantityOrdered: integer("quantity_ordered").notNull(),
  quantityReceived: integer("quantity_received").default(0).notNull(),
  uom: text("uom").default("EA").notNull(),
  unitCostCents: integer("unit_cost_cents").default(0).notNull(),
  totalCostCents: integer("total_cost_cents").default(0).notNull(),
  linkedJobId: text("linked_job_id"),
  linkedJobNumber: text("linked_job_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("purchasing_po_lines_po_idx").on(table.poId),
  index("purchasing_po_lines_org_idx").on(table.organizationId),
]);

export const purchasingReceivingReceipts = pgTable("purchasing_receiving_receipts", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  poId: text("po_id").notNull().references(() => purchasingPurchaseOrders.id, { onDelete: "cascade" }),
  poNumber: text("po_number").notNull(),
  packingSlipNumber: text("packing_slip_number").notNull(),
  receivedDate: text("received_date").notNull(),
  receivedByUserId: text("received_by_user_id").notNull(),
  receivedByName: text("received_by_name").notNull(),
  itemsReceived: jsonb("items_received").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("purchasing_receipts_org_idx").on(table.organizationId),
]);

export const purchasingMaterialShortages = pgTable("purchasing_material_shortages", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  jobId: text("job_id"),
  jobNumber: text("job_number"),
  itemCode: text("item_code").notNull(),
  description: text("description").notNull(),
  requiredQuantity: integer("required_quantity").notNull(),
  onHandQuantity: integer("on_hand_quantity").default(0).notNull(),
  shortageQuantity: integer("shortage_quantity").notNull(),
  uom: text("uom").default("EA").notNull(),
  neededByDate: text("needed_by_date").notNull(),
  urgency: text("urgency").default("standard").notNull(),
  status: text("status").default("pending_rfq").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("purchasing_shortages_org_idx").on(table.organizationId),
]);

// 9. Shipping & Outbound Logistics Domain (Migration 0007)
export const shippingManifests = pgTable("shipping_manifests", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  manifestNumber: text("manifest_number").notNull(),
  carrierType: text("carrier_type").default("ltl_freight").notNull(),
  carrierName: text("carrier_name").notNull(),
  trackingOrProNumber: text("tracking_or_pro_number").notNull(),
  driverName: text("driver_name"),
  trailerOrPlateNumber: text("trailer_or_plate_number"),
  totalPackages: integer("total_packages").default(0).notNull(),
  totalGrossWeightLbs: numeric("total_gross_weight_lbs", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: text("status").default("draft_manifest").notNull(),
  billOfLadingBarcode: text("bill_of_lading_barcode").notNull(),
  dispatchedAt: timestamp("dispatched_at"),
  dispatchedByUserId: text("dispatched_by_user_id").references(() => users.id, { onDelete: "restrict" }),
  dispatchedByName: text("dispatched_by_name"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("shipping_manifest_org_number_idx").on(table.organizationId, table.manifestNumber),
  index("shipping_manifest_org_idx").on(table.organizationId),
]);

export const shippingStops = pgTable("shipping_stops", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  manifestId: text("manifest_id").notNull().references(() => shippingManifests.id, { onDelete: "cascade" }),
  stopSequence: integer("stop_sequence").default(1).notNull(),
  destinationCustomerName: text("destination_customer_name").notNull(),
  destinationAddress: text("destination_address").notNull(),
  packageNumbers: jsonb("package_numbers").notNull(),
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  deliveryNotes: text("delivery_notes"),
  status: text("status").default("pending").notNull(),
  signedBy: text("signed_by"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("shipping_stops_manifest_idx").on(table.manifestId),
  index("shipping_stops_org_idx").on(table.organizationId),
]);

export const shippingManifestPackages = pgTable("shipping_manifest_packages", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  manifestId: text("manifest_id").notNull().references(() => shippingManifests.id, { onDelete: "cascade" }),
  packageNumber: text("package_number").notNull(),
  grossWeightLbs: numeric("gross_weight_lbs", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("shipping_manifest_packages_manifest_idx").on(table.manifestId),
  index("shipping_manifest_packages_org_idx").on(table.organizationId),
]);

// 10. Packaging & Palletization Domain (Migration 0008)
export const packagingSpecifications = pgTable("packaging_specifications", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  containerType: text("container_type").default("box").notNull(),
  maxWeightCapacityLbs: numeric("max_weight_capacity_lbs", { precision: 10, scale: 2 }).default("50.00").notNull(),
  tareWeightLbs: numeric("tare_weight_lbs", { precision: 10, scale: 2 }).default("2.00").notNull(),
  dimensionsInches: jsonb("dimensions_inches").notNull(),
  requiresCushioning: boolean("requires_cushioning").default(false).notNull(),
  requiresBanding: boolean("requires_banding").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("packaging_specifications_org_idx").on(table.organizationId),
]);

export const packagingUnits = pgTable("packaging_units", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  packageNumber: text("package_number").notNull(),
  containerType: text("container_type").default("box").notNull(),
  specificationId: text("specification_id").references(() => packagingSpecifications.id, { onDelete: "set null" }),
  totalQuantity: integer("total_quantity").default(0).notNull(),
  netWeightLbs: numeric("net_weight_lbs", { precision: 10, scale: 2 }).default("0.00").notNull(),
  tareWeightLbs: numeric("tare_weight_lbs", { precision: 10, scale: 2 }).default("0.00").notNull(),
  grossWeightLbs: numeric("gross_weight_lbs", { precision: 10, scale: 2 }).default("0.00").notNull(),
  maxCapacityLbs: numeric("max_capacity_lbs", { precision: 10, scale: 2 }).default("50.00").notNull(),
  dimensionsInches: jsonb("dimensions_inches").notNull(),
  labelBarcode: text("label_barcode").notNull(),
  status: text("status").default("in_pack").notNull(),
  sealedAt: timestamp("sealed_at"),
  sealedByUserId: text("sealed_by_user_id").references(() => users.id, { onDelete: "restrict" }),
  sealedByName: text("sealed_by_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("packaging_units_org_number_idx").on(table.organizationId, table.packageNumber),
  index("packaging_units_org_idx").on(table.organizationId),
]);

export const packagedItems = pgTable("packaged_items", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  packageId: text("package_id").notNull().references(() => packagingUnits.id, { onDelete: "cascade" }),
  jobId: text("job_id").references(() => jobs.id, { onDelete: "set null" }),
  jobNumber: text("job_number"),
  partDescription: text("part_description").notNull(),
  quantityPacked: integer("quantity_packed").default(1).notNull(),
  unitWeightLbs: numeric("unit_weight_lbs", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lotNumber: text("lot_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("packaged_items_package_idx").on(table.packageId),
  index("packaged_items_org_idx").on(table.organizationId),
]);

// 11. QuoteFlow & Estimating Domain (Migration 0009)
export const quotingQuotes = pgTable("quoting_quotes", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  quoteNumber: text("quote_number").notNull(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerContactEmail: text("customer_contact_email").notNull(),
  title: text("title").notNull(),
  status: text("status").default("draft").notNull(),
  currentRevisionNumber: integer("current_revision_number").default(1).notNull(),
  minMarginThresholdPercent: integer("min_margin_threshold_percent").default(25).notNull(),
  requiresExecutiveApproval: boolean("requires_executive_approval").default(false).notNull(),
  approvedByUserId: text("approved_by_user_id").references(() => users.id, { onDelete: "restrict" }),
  approvedByName: text("approved_by_name"),
  approvedAt: timestamp("approved_at"),
  expiresAt: text("expires_at").notNull(),
  convertedJobId: text("converted_job_id").references(() => jobs.id, { onDelete: "set null" }),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("quoting_quotes_org_number_idx").on(table.organizationId, table.quoteNumber),
  index("quoting_quotes_org_idx").on(table.organizationId),
]);

export const quotingQuoteRevisions = pgTable("quoting_quote_revisions", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  quoteId: text("quote_id").notNull().references(() => quotingQuotes.id, { onDelete: "cascade" }),
  revisionNumber: integer("revision_number").default(1).notNull(),
  changeReason: text("change_reason").notNull(),
  subtotalCents: integer("subtotal_cents").default(0).notNull(),
  discountPercent: integer("discount_percent").default(0).notNull(),
  discountAmountCents: integer("discount_amount_cents").default(0).notNull(),
  taxPercent: integer("tax_percent").default(0).notNull(),
  taxAmountCents: integer("tax_amount_cents").default(0).notNull(),
  totalAmountCents: integer("total_amount_cents").default(0).notNull(),
  overallMarginPercent: numeric("overall_margin_percent", { precision: 5, scale: 2 }).default("0.00").notNull(),
  createdByUserId: text("created_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  createdByName: text("created_by_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("quoting_revs_quote_idx").on(table.quoteId),
  index("quoting_revs_org_idx").on(table.organizationId),
]);

export const quotingQuoteLineItems = pgTable("quoting_quote_line_items", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  revisionId: text("revision_id").notNull().references(() => quotingQuoteRevisions.id, { onDelete: "cascade" }),
  lineItemNumber: integer("line_item_number").notNull(),
  partDescription: text("part_description").notNull(),
  drawingNumber: text("drawing_number"),
  revision: text("revision"),
  quantity: integer("quantity").default(1).notNull(),
  costBreakdown: jsonb("cost_breakdown").notNull(),
  targetMarginPercent: integer("target_margin_percent").default(30).notNull(),
  unitPriceCents: integer("unit_price_cents").default(0).notNull(),
  totalPriceCents: integer("total_price_cents").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("quoting_lines_rev_idx").on(table.revisionId),
  index("quoting_lines_org_idx").on(table.organizationId),
]);

// 12. File Storage & Document Vault Domain (Migration 0010)
export const fileVaultRecords = pgTable("file_vault_records", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  uploadedByUserId: text("uploaded_by_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  uploadedByName: text("uploaded_by_name").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).default(0).notNull(),
  storageKey: text("storage_key").notNull(),
  checksumSha256: text("checksum_sha256"),
  status: text("status").default("clean").notNull(),
  quarantineReason: text("quarantine_reason"),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("file_vault_org_idx").on(table.organizationId),
  index("file_vault_entity_idx").on(table.organizationId, table.entityType, table.entityId),
  index("file_vault_status_idx").on(table.organizationId, table.status),
]);

// 13. Knowledge Base & Standard Procedures Domain (Migration 0011)
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  articleCode: text("article_code").notNull(),
  category: text("category").default("standard_operating_procedure").notNull(),
  title: text("title").notNull(),
  tags: jsonb("tags").notNull(),
  linkedEquipmentCodes: jsonb("linked_equipment_codes").notNull(),
  linkedModuleCodes: jsonb("linked_module_codes").notNull(),
  targetRoles: jsonb("target_roles").notNull(),
  status: text("status").default("draft").notNull(),
  currentRevisionNumber: integer("current_revision_number").default(1).notNull(),
  authorUserId: text("author_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  authorName: text("author_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("knowledge_articles_org_code_idx").on(table.organizationId, table.articleCode),
  index("knowledge_articles_org_idx").on(table.organizationId),
]);

export const knowledgeRevisions = pgTable("knowledge_revisions", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  articleId: text("article_id").notNull().references(() => knowledgeArticles.id, { onDelete: "cascade" }),
  revisionNumber: integer("revision_number").default(1).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  changeLog: text("change_log").notNull(),
  reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, { onDelete: "restrict" }),
  reviewedByName: text("reviewed_by_name"),
  approvedAt: timestamp("approved_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("knowledge_revs_article_idx").on(table.articleId),
  index("knowledge_revs_org_idx").on(table.organizationId),
]);

export const knowledgeSteps = pgTable("knowledge_steps", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  revisionId: text("revision_id").notNull().references(() => knowledgeRevisions.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  instruction: text("instruction").notNull(),
  safetyWarning: text("safety_warning"),
  mediaUrl: text("media_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("knowledge_steps_rev_idx").on(table.revisionId),
  index("knowledge_steps_org_idx").on(table.organizationId),
]);

// 14. Packet Intelligence & Engineering Drawings Domain (Migration 0012)
export const jobPacketDocuments = pgTable("job_packet_documents", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  jobNumber: text("job_number").notNull(),
  fileName: text("file_name").notNull(),
  fileStorageKey: text("file_storage_key").notNull(),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }).notNull(),
  mimeType: text("mime_type").notNull(),
  documentType: text("document_type").default("engineering_drawing").notNull(),
  extractionStatus: text("extraction_status").default("pending").notNull(),
  aiModelUsed: text("ai_model_used"),
  extractedEntities: jsonb("extracted_entities").notNull(),
  inconsistencies: jsonb("inconsistencies").notNull(),
  humanReviewerId: text("human_reviewer_id").references(() => users.id, { onDelete: "restrict" }),
  humanReviewerName: text("human_reviewer_name"),
  humanApprovedAt: timestamp("human_approved_at"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("packet_docs_org_idx").on(table.organizationId),
  index("packet_docs_job_idx").on(table.organizationId, table.jobId),
]);

// 15. Analytics & Operational Planning Domain (Migration 0013)
export const planningSuggestions = pgTable("planning_suggestions", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").default("workcenter_rebalance").notNull(),
  rationale: text("rationale").notNull(),
  constraints: jsonb("constraints").notNull(),
  tradeOffs: jsonb("trade_offs").notNull(),
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 4 }).default("0.9000").notNull(),
  status: text("status").default("pending").notNull(),
  approvedByUserId: text("approved_by_user_id").references(() => users.id, { onDelete: "restrict" }),
  approvedByName: text("approved_by_name"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("planning_sug_org_idx").on(table.organizationId),
]);

// 16. Immutable Audit Log Table
export const auditEvents = pgTable("audit_events", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  actorId: text("actor_id").notNull(),
  actorName: text("actor_name").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  summary: text("summary").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("audit_org_idx").on(table.organizationId),
  index("audit_entity_idx").on(table.organizationId, table.entityType, table.entityId),
]);

// 7. Application Migrations Ledger
export const applicationMigrations = pgTable("application_migrations", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  checksum: text("checksum").notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});
