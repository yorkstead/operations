export type EquipmentCriticality =
  | "low"
  | "medium"
  | "high"
  | "critical_single_point_of_failure";

export type EquipmentStatus =
  | "operational"
  | "degraded"
  | "down_unplanned"
  | "down_planned_pm"
  | "under_repair";

export interface Equipment {
  id: string;
  organizationId: string;
  assetTag: string; // e.g. "EQ-LASER-01"
  name: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  workCenterCode: string;
  locationCode: string;
  criticality: EquipmentCriticality;
  status: EquipmentStatus;
  qrCodeData: string;
  lastServiceDate: string;
  nextScheduledPmDate: string;
  totalRunHours: number;
}

export type DowntimeCategory =
  | "unplanned_breakdown"
  | "planned_preventive"
  | "tooling_failure"
  | "operator_error"
  | "waiting_for_parts";

export interface DowntimeInterval {
  id: string;
  organizationId: string;
  equipmentId: string;
  assetTag: string;
  category: DowntimeCategory;
  reason: string;
  impactSummary: string;
  startedAt: string;
  resolvedAt?: string;
  durationMinutes?: number;
  reportedByUserId: string;
  reportedByName: string;
  resolvedByUserId?: string;
  resolvedByName?: string;
  workOrderId?: string;
}

export type MaintenanceWorkOrderType =
  | "corrective_emergency"
  | "preventive_scheduled"
  | "facility_improvement";

export type MaintenanceWorkOrderStatus =
  | "open"
  | "in_progress"
  | "waiting_parts"
  | "completed_pending_signoff"
  | "closed_returned_to_service";

export interface MaintenancePartUsage {
  itemCode: string;
  description: string;
  quantity: number;
}

export interface MaintenanceWorkOrder {
  id: string;
  workOrderNumber: string; // e.g. "MNT-2026-018"
  organizationId: string;
  equipmentId: string;
  assetTag: string;
  type: MaintenanceWorkOrderType;
  status: MaintenanceWorkOrderStatus;
  title: string;
  description: string;
  priority: "standard" | "urgent" | "emergency";
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  replacementPartsUsed: MaintenancePartUsage[];
  actualLaborMinutes: number;
  returnToServiceAuthorizedByUserId?: string;
  returnToServiceAuthorizedByName?: string;
  returnToServiceNotes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MaintenanceMetricsSummary {
  totalAssets: number;
  operationalUptimePercentage: number;
  activeDowntimeEventsCount: number;
  overduePreventiveSchedulesCount: number;
  meanTimeToRepairMinutes: number;
}
