export type WorkCenterStatus = "available" | "running" | "maintenance" | "offline";

export type OperationStatus =
  | "pending"
  | "in_setup"
  | "running"
  | "paused"
  | "completed"
  | "blocked";

export interface WorkCenter {
  id: string;
  organizationId: string;
  code: string; // e.g. "WC-LASER-01"
  name: string;
  type: string;
  status: WorkCenterStatus;
  hourlyCostRate: number;
}

export interface TravelerOperation {
  id: string;
  sequence: number; // 10, 20, 30
  workCenterCode: string;
  workCenterName: string;
  operationName: string;
  requiredQuantity: number;
  completedQuantity: number;
  scrappedQuantity: number;
  status: OperationStatus;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  blockerReason?: string;
  startedAt?: string;
  completedAt?: string;
  actualLaborMinutes: number;
}

export interface DigitalTraveler {
  id: string;
  organizationId: string;
  travelerNumber: string; // e.g. "TRV-2026-104"
  qrCodeData: string;
  jobId: string;
  jobNumber: string;
  partDescription: string;
  customerName: string;
  totalQuantity: number;
  operations: TravelerOperation[];
  currentStepIndex: number;
  status: "queued" | "active" | "completed" | "on_hold";
  priority: "standard" | "rush" | "critical";
  targetDueDate: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}
