import { and, desc, eq, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { backgroundJobs } from "@/db/schema";
import type { SessionContext } from "@/modules/core/domain/types";
import type { BackgroundJobStatus, BackgroundJobType, PacketExtractionPayload, PublicBackgroundJob } from "../domain/types";

type JobRow = typeof backgroundJobs.$inferSelect;

export interface ClaimedBackgroundJob extends JobRow {
  type: BackgroundJobType;
  status: "running";
  payload: PacketExtractionPayload;
}

const publicError = (value: unknown): PublicBackgroundJob["error"] => {
  if (!value || typeof value !== "object") return null;
  const error = value as Record<string, unknown>;
  return {
    code: typeof error.code === "string" ? error.code : "JOB_FAILED",
    message: "Processing could not be completed. Retry the job or contact support with the job ID.",
  };
};

export function toPublicBackgroundJob(row: JobRow): PublicBackgroundJob {
  return {
    id: row.id,
    type: row.type as BackgroundJobType,
    status: row.status as BackgroundJobStatus,
    progress: row.progress,
    result: row.result ?? null,
    error: publicError(row.error),
    attempts: row.attempts,
    createdAt: row.createdAt.toISOString(),
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

export class BackgroundJobRepository {
  async createPacketExtraction(
    session: SessionContext,
    payload: PacketExtractionPayload,
  ): Promise<PublicBackgroundJob> {
    const db = getDb();
    const idempotencyKey = `packet:${payload.documentId}`;
    const id = `bgjob_${crypto.randomUUID()}`;
    const [created] = await db.insert(backgroundJobs).values({
      id,
      organizationId: session.activeOrganization.id,
      type: "packet.extract",
      payload,
      resourceType: "packet_document",
      resourceId: payload.documentId,
      idempotencyKey,
      createdByUserId: session.user.id,
      createdByName: session.user.name,
    }).onConflictDoNothing().returning();

    if (created) return toPublicBackgroundJob(created);

    const [existing] = await db.select().from(backgroundJobs).where(and(
      eq(backgroundJobs.organizationId, session.activeOrganization.id),
      eq(backgroundJobs.type, "packet.extract"),
      eq(backgroundJobs.idempotencyKey, idempotencyKey),
    )).limit(1);
    if (!existing) throw new Error("Background job could not be created.");
    return toPublicBackgroundJob(existing);
  }

  async getForSession(session: SessionContext, id: string): Promise<PublicBackgroundJob | null> {
    const [row] = await getDb().select().from(backgroundJobs).where(and(
      eq(backgroundJobs.id, id),
      eq(backgroundJobs.organizationId, session.activeOrganization.id),
    )).limit(1);
    return row ? toPublicBackgroundJob(row) : null;
  }

  async findLatestForResource(session: SessionContext, resourceType: string, resourceId: string) {
    const [row] = await getDb().select().from(backgroundJobs).where(and(
      eq(backgroundJobs.organizationId, session.activeOrganization.id),
      eq(backgroundJobs.resourceType, resourceType),
      eq(backgroundJobs.resourceId, resourceId),
    )).orderBy(desc(backgroundJobs.createdAt)).limit(1);
    return row ? toPublicBackgroundJob(row) : null;
  }

  async retry(session: SessionContext, id: string): Promise<PublicBackgroundJob | null> {
    const [row] = await getDb().update(backgroundJobs).set({
      status: "queued",
      progress: 0,
      error: null,
      result: null,
      availableAt: new Date(),
      completedAt: null,
      updatedAt: new Date(),
    }).where(and(
      eq(backgroundJobs.id, id),
      eq(backgroundJobs.organizationId, session.activeOrganization.id),
      eq(backgroundJobs.status, "failed"),
    )).returning();
    return row ? toPublicBackgroundJob(row) : null;
  }

  async cancel(session: SessionContext, id: string): Promise<PublicBackgroundJob | null> {
    const [row] = await getDb().update(backgroundJobs).set({
      status: "cancelled",
      completedAt: new Date(),
      updatedAt: new Date(),
    }).where(and(
      eq(backgroundJobs.id, id),
      eq(backgroundJobs.organizationId, session.activeOrganization.id),
      eq(backgroundJobs.status, "queued"),
    )).returning();
    return row ? toPublicBackgroundJob(row) : null;
  }

  async recoverStaleJobs(staleBefore: Date): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(backgroundJobs).where(and(
      eq(backgroundJobs.status, "running"), lte(backgroundJobs.startedAt, staleBefore),
    ));
    for (const row of rows) {
      const exhausted = row.attempts >= row.maxAttempts;
      await db.update(backgroundJobs).set({
        status: exhausted ? "failed" : "queued",
        progress: exhausted ? row.progress : 0,
        availableAt: new Date(),
        error: { code: exhausted ? "WORKER_TERMINATED" : "STALE_WORKER_RECOVERED" },
        completedAt: exhausted ? new Date() : null,
        updatedAt: new Date(),
      }).where(and(eq(backgroundJobs.id, row.id), eq(backgroundJobs.status, "running")));
    }
    return rows.length;
  }

  async claimNext(): Promise<ClaimedBackgroundJob | null> {
    return getDb().transaction(async (tx) => {
      const [candidate] = await tx.select().from(backgroundJobs).where(and(
        eq(backgroundJobs.status, "queued"), lte(backgroundJobs.availableAt, new Date()),
      )).orderBy(backgroundJobs.availableAt, backgroundJobs.createdAt).limit(1).for("update", { skipLocked: true });
      if (!candidate) return null;
      const [row] = await tx.update(backgroundJobs).set({
        status: "running", progress: 5, attempts: candidate.attempts + 1,
        startedAt: new Date(), updatedAt: new Date(), error: null,
      }).where(eq(backgroundJobs.id, candidate.id)).returning();
      return this.normalizeClaim(row);
    });
  }

  async updateProgress(id: string, progress: number): Promise<void> {
    await getDb().update(backgroundJobs).set({ progress, updatedAt: new Date() }).where(and(
      eq(backgroundJobs.id, id), eq(backgroundJobs.status, "running"),
    ));
  }

  async complete(id: string, result: unknown): Promise<void> {
    await getDb().update(backgroundJobs).set({
      status: "completed", progress: 100, result, error: null,
      completedAt: new Date(), updatedAt: new Date(),
    }).where(and(eq(backgroundJobs.id, id), eq(backgroundJobs.status, "running")));
  }

  async fail(job: ClaimedBackgroundJob, code: string): Promise<void> {
    const retry = job.attempts < job.maxAttempts;
    const delaySeconds = Math.min(300, 15 * 2 ** Math.max(0, job.attempts - 1));
    await getDb().update(backgroundJobs).set({
      status: retry ? "queued" : "failed",
      progress: retry ? 0 : job.progress,
      error: { code },
      availableAt: retry ? new Date(Date.now() + delaySeconds * 1000) : job.availableAt,
      completedAt: retry ? null : new Date(),
      updatedAt: new Date(),
    }).where(eq(backgroundJobs.id, job.id));
  }

  private normalizeClaim(row: JobRow): ClaimedBackgroundJob {
    return {
      ...row,
      createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt),
      availableAt: new Date(row.availableAt), startedAt: row.startedAt ? new Date(row.startedAt) : null,
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      type: row.type as BackgroundJobType,
      status: "running",
      payload: row.payload as PacketExtractionPayload,
    };
  }
}

export const backgroundJobRepository = new BackgroundJobRepository();
