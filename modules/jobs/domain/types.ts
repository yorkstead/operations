export type JobStatus =
  | "draft"
  | "intake_review"
  | "engineering_ready"
  | "released_to_shopfloor"
  | "in_progress"
  | "completed"
  | "closed"
  | "on_hold"
  | "cancelled";

export type JobPriority = "low" | "standard" | "rush" | "critical";

export interface JobRevision {
  revision: string; // e.g. "A", "B", "C"
  changeSummary: string;
  changedByUserId: string;
  createdAt: string;
}

export interface JobTimelineEvent {
  id: string;
  fromStatus: JobStatus;
  toStatus: JobStatus;
  actorUserId: string;
  actorName: string;
  reason?: string;
  timestamp: string;
}

export interface Job {
  id: string;
  organizationId: string;
  jobNumber: string; // e.g. "JOB-2026-101"
  title: string;
  customerId: string;
  customerName: string;
  currentStatus: JobStatus;
  priority: JobPriority;
  currentRevision: string;
  targetDueDate: string;
  releaseDate?: string;
  assignedManagerUserId?: string;
  estimatedLaborHours: number;
  notes?: string;
  revisions: JobRevision[];
  timeline: JobTimelineEvent[];
  version: number; // For optimistic concurrency control
  createdAt: string;
  updatedAt: string;
}

export const VALID_JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ["intake_review", "cancelled"],
  intake_review: ["engineering_ready", "draft", "on_hold", "cancelled"],
  engineering_ready: ["released_to_shopfloor", "intake_review", "on_hold", "cancelled"],
  released_to_shopfloor: ["in_progress", "on_hold", "cancelled"],
  in_progress: ["completed", "on_hold", "cancelled"],
  completed: ["closed", "in_progress"],
  on_hold: ["intake_review", "engineering_ready", "released_to_shopfloor", "in_progress", "cancelled"],
  cancelled: ["draft"], // guarded re-open
  closed: [], // Terminal state
};
