import {
  Job,
  JobStatus,
  JobPriority,
  JobRevision,
  JobTimelineEvent,
  VALID_JOB_TRANSITIONS,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";

export class JobService {
  private jobs: Map<string, Job> = new Map();

  // 1. Job Intake & Creation
  createJob(
    session: SessionContext,
    params: {
      title: string;
      customerId: string;
      customerName: string;
      priority?: JobPriority;
      targetDueDate: string;
      estimatedLaborHours?: number;
      notes?: string;
    }
  ): Job {
    authorizationService.requireCapability(session, "quoting:create_quote");

    if (!params.title || !params.title.trim()) {
      throw new Error("Job title is required.");
    }
    if (!params.customerName || !params.customerName.trim()) {
      throw new Error("Customer name is required.");
    }

    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const jobNumber = `JOB-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const initialRevision: JobRevision = {
      revision: "A",
      changeSummary: "Initial job packet intake release.",
      changedByUserId: session.user.id,
      createdAt: now,
    };

    const initialTimeline: JobTimelineEvent = {
      id: `time_${Date.now()}`,
      fromStatus: "draft",
      toStatus: "intake_review",
      actorUserId: session.user.id,
      actorName: session.user.name,
      reason: "Job intake created.",
      timestamp: now,
    };

    const job: Job = {
      id,
      organizationId: session.activeOrganization.id,
      jobNumber,
      title: params.title.trim(),
      customerId: params.customerId,
      customerName: params.customerName.trim(),
      currentStatus: "intake_review",
      priority: params.priority || "standard",
      currentRevision: "A",
      targetDueDate: params.targetDueDate,
      estimatedLaborHours: params.estimatedLaborHours ?? 10,
      notes: params.notes?.trim(),
      revisions: [initialRevision],
      timeline: [initialTimeline],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(id, job);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: id,
      action: "job.created",
      summary: `Created job work order ${job.jobNumber} (${job.title}) for customer ${job.customerName}.`,
    });

    return job;
  }

  // 2. Guarded Workflow State Transitions
  transitionJobStatus(
    session: SessionContext,
    jobId: string,
    targetStatus: JobStatus,
    reason?: string,
    expectedVersion?: number
  ): Job {
    const job = this.jobs.get(jobId);
    if (!job || job.organizationId !== session.activeOrganization.id) {
      throw new Error(`Job not found in active organization.`);
    }

    // Optimistic Concurrency Check
    if (expectedVersion !== undefined && job.version !== expectedVersion) {
      throw new Error(
        `Stale Update Conflict: Job has been modified by another operator (Current v${job.version}, expected v${expectedVersion}).`
      );
    }

    // Authorization capability check based on transition target
    if (targetStatus === "released_to_shopfloor") {
      authorizationService.requireCapability(session, "shopfloor:reassign_job");
    } else if (targetStatus === "completed" || targetStatus === "closed") {
      authorizationService.requireCapability(session, "quality:record_inspection");
    }

    // State Machine Validation
    const allowedTargets = VALID_JOB_TRANSITIONS[job.currentStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
      throw new Error(
        `Invalid State Transition: Cannot transition job from '${job.currentStatus}' to '${targetStatus}'.`
      );
    }

    const now = new Date().toISOString();
    const timelineEvent: JobTimelineEvent = {
      id: `time_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromStatus: job.currentStatus,
      toStatus: targetStatus,
      actorUserId: session.user.id,
      actorName: session.user.name,
      reason: reason || `Status advanced to ${targetStatus}.`,
      timestamp: now,
    };

    job.currentStatus = targetStatus;
    if (targetStatus === "released_to_shopfloor" && !job.releaseDate) {
      job.releaseDate = now;
    }
    job.timeline.unshift(timelineEvent);
    job.version += 1;
    job.updatedAt = now;

    this.jobs.set(jobId, job);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: jobId,
      action: "job.transitioned",
      summary: `Job ${job.jobNumber} transitioned to '${targetStatus}'.`,
    });

    return job;
  }

  // 3. Revisions & Engineering Changes
  createRevision(
    session: SessionContext,
    jobId: string,
    revisionLabel: string,
    changeSummary: string,
    expectedVersion?: number
  ): Job {
    authorizationService.requireCapability(session, "shopfloor:reassign_job");

    const job = this.jobs.get(jobId);
    if (!job || job.organizationId !== session.activeOrganization.id) {
      throw new Error("Job not found.");
    }

    if (expectedVersion !== undefined && job.version !== expectedVersion) {
      throw new Error("Stale Update Conflict.");
    }

    const now = new Date().toISOString();
    const newRevision: JobRevision = {
      revision: revisionLabel.trim().toUpperCase(),
      changeSummary: changeSummary.trim(),
      changedByUserId: session.user.id,
      createdAt: now,
    };

    job.currentRevision = newRevision.revision;
    job.revisions.unshift(newRevision);
    job.version += 1;
    job.updatedAt = now;

    this.jobs.set(jobId, job);
    return job;
  }

  // 4. Querying
  getJob(session: SessionContext, jobId: string): Job {
    const job = this.jobs.get(jobId);
    if (!job || job.organizationId !== session.activeOrganization.id) {
      throw new Error("Job not found in active organization.");
    }
    return job;
  }

  listJobs(session: SessionContext, statusFilter?: JobStatus): Job[] {
    return Array.from(this.jobs.values()).filter((j) => {
      if (j.organizationId !== session.activeOrganization.id) return false;
      if (statusFilter && j.currentStatus !== statusFilter) return false;
      return true;
    });
  }
}

export const jobService = new JobService();
