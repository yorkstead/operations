import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs, jobTimelineEvents, jobRevisions, auditEvents } from "@/db/schema";
import { Job, JobStatus, JobPriority } from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";

export interface CreateJobRepositoryParams {
  jobNumber: string;
  title: string;
  customerId: string;
  customerName: string;
  priority?: JobPriority;
  targetDueDate: string;
  estimatedLaborHours?: number;
  notes?: string;
}

export class JobRepository {
  async createJob(session: SessionContext, params: CreateJobRepositoryParams): Promise<Job> {
    const db = getDb();
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newJob: Job = {
      id,
      organizationId: session.activeOrganization.id,
      jobNumber: params.jobNumber,
      title: params.title.trim(),
      customerId: params.customerId,
      customerName: params.customerName.trim(),
      currentStatus: "intake_review",
      priority: params.priority || "standard",
      currentRevision: "A",
      targetDueDate: params.targetDueDate,
      estimatedLaborHours: params.estimatedLaborHours ?? 10,
      notes: params.notes?.trim(),
      revisions: [
        {
          revision: "A",
          changeSummary: "Initial job packet intake release.",
          changedByUserId: session.user.id,
          createdAt: now,
        },
      ],
      timeline: [
        {
          id: `time_${Date.now()}`,
          fromStatus: "draft",
          toStatus: "intake_review",
          actorUserId: session.user.id,
          actorName: session.user.name,
          reason: "Job intake created.",
          timestamp: now,
        },
      ],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(jobs).values({
      id: newJob.id,
      organizationId: newJob.organizationId,
      jobNumber: newJob.jobNumber,
      title: newJob.title,
      customerId: newJob.customerId,
      customerName: newJob.customerName,
      currentStatus: newJob.currentStatus,
      priority: newJob.priority,
      currentRevision: newJob.currentRevision,
      targetDueDate: newJob.targetDueDate,
      estimatedLaborHours: newJob.estimatedLaborHours,
      notes: newJob.notes,
      version: newJob.version,
    });

    await db.insert(jobRevisions).values({
      id: `rev_${Date.now()}`,
      jobId: newJob.id,
      organizationId: newJob.organizationId,
      revision: "A",
      changeSummary: "Initial job packet intake release.",
      changedByUserId: session.user.id,
    });

    await db.insert(jobTimelineEvents).values({
      id: `time_${Date.now()}`,
      jobId: newJob.id,
      organizationId: newJob.organizationId,
      fromStatus: "draft",
      toStatus: "intake_review",
      actorUserId: session.user.id,
      actorName: session.user.name,
      reason: "Job intake created.",
    });

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: newJob.id,
      action: "job.created",
      summary: `Created job work order ${newJob.jobNumber} (${newJob.title}) for customer ${newJob.customerName}.`,
      metadata: {
        jobNumber: newJob.jobNumber,
        customerName: newJob.customerName,
        priority: newJob.priority,
      },
    });

    return newJob;
  }

  async getJob(session: SessionContext, jobId: string): Promise<Job | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.organizationId, session.activeOrganization.id)))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];

    const revRows = await db
      .select()
      .from(jobRevisions)
      .where(and(eq(jobRevisions.jobId, jobId), eq(jobRevisions.organizationId, session.activeOrganization.id)))
      .orderBy(desc(jobRevisions.createdAt));

    const timeRows = await db
      .select()
      .from(jobTimelineEvents)
      .where(and(eq(jobTimelineEvents.jobId, jobId), eq(jobTimelineEvents.organizationId, session.activeOrganization.id)))
      .orderBy(desc(jobTimelineEvents.timestamp));

    return {
      id: row.id,
      organizationId: row.organizationId,
      jobNumber: row.jobNumber,
      title: row.title,
      customerId: row.customerId,
      customerName: row.customerName,
      currentStatus: row.currentStatus as JobStatus,
      priority: row.priority as JobPriority,
      currentRevision: row.currentRevision,
      targetDueDate: row.targetDueDate,
      estimatedLaborHours: row.estimatedLaborHours,
      notes: row.notes ?? undefined,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      revisions: revRows.map((r) => ({
        revision: r.revision,
        changeSummary: r.changeSummary,
        changedByUserId: r.changedByUserId,
        createdAt: r.createdAt.toISOString(),
      })),
      timeline: timeRows.map((t) => ({
        id: t.id,
        fromStatus: t.fromStatus as JobStatus,
        toStatus: t.toStatus as JobStatus,
        actorUserId: t.actorUserId,
        actorName: t.actorName,
        reason: t.reason,
        timestamp: t.timestamp.toISOString(),
      })),
    };
  }

  async listJobs(session: SessionContext, statusFilter?: JobStatus): Promise<Job[]> {
    const db = getDb();
    const conditions = [eq(jobs.organizationId, session.activeOrganization.id)];
    if (statusFilter) {
      conditions.push(eq(jobs.currentStatus, statusFilter));
    }

    const rows = await db
      .select()
      .from(jobs)
      .where(and(...conditions))
      .orderBy(desc(jobs.createdAt));

    return rows.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      jobNumber: row.jobNumber,
      title: row.title,
      customerId: row.customerId,
      customerName: row.customerName,
      currentStatus: row.currentStatus as JobStatus,
      priority: row.priority as JobPriority,
      currentRevision: row.currentRevision,
      targetDueDate: row.targetDueDate,
      estimatedLaborHours: row.estimatedLaborHours,
      notes: row.notes ?? undefined,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      revisions: [],
      timeline: [],
    }));
  }

  async transitionJobStatus(
    session: SessionContext,
    jobId: string,
    targetStatus: JobStatus,
    reason?: string,
    expectedVersion?: number
  ): Promise<Job> {
    const db = getDb();
    const existing = await this.getJob(session, jobId);
    if (!existing) {
      throw new Error("Job not found in active organization.");
    }

    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      throw new Error(
        `Stale Update Conflict: Job modified by another operator (Current v${existing.version}, expected v${expectedVersion}).`
      );
    }

    const newVersion = existing.version + 1;
    const now = new Date();

    await db
      .update(jobs)
      .set({
        currentStatus: targetStatus,
        version: newVersion,
        updatedAt: now,
      })
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.organizationId, session.activeOrganization.id),
          eq(jobs.version, existing.version)
        )
      );

    const timelineId = `time_${Date.now()}`;
    await db.insert(jobTimelineEvents).values({
      id: timelineId,
      jobId,
      organizationId: session.activeOrganization.id,
      fromStatus: existing.currentStatus,
      toStatus: targetStatus,
      actorUserId: session.user.id,
      actorName: session.user.name,
      reason: reason || `Status advanced to ${targetStatus}.`,
    });

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: jobId,
      action: "job.transitioned",
      summary: `Job ${existing.jobNumber} transitioned from '${existing.currentStatus}' to '${targetStatus}'.`,
      metadata: {
        fromStatus: existing.currentStatus,
        toStatus: targetStatus,
        version: newVersion,
      },
    });

    return {
      ...existing,
      currentStatus: targetStatus,
      version: newVersion,
      updatedAt: now.toISOString(),
    };
  }
}

export const jobRepository = new JobRepository();
