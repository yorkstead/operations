import { serverEnv } from "@/lib/infrastructure/env/server";
import { createJobQueue } from "@/lib/infrastructure/queue/factory";
import { backgroundJobRepository } from "../infrastructure/background-job-repository";
import { logger } from "@/lib/infrastructure/observability/logger";

export async function dispatchBackgroundJob(jobId: string): Promise<boolean> {
  const reference = await backgroundJobRepository.getDispatchReference(jobId);
  if (!reference) return false;
  try {
    await createJobQueue(serverEnv).enqueueJob({ version: 1, ...reference, enqueuedAt: new Date().toISOString() });
    logger.info("job.queued", "Background job queued", { jobId: reference.jobId, jobType: reference.type, queueProvider: serverEnv.QUEUE_PROVIDER });
    return true;
  } catch (error) {
    logger.error("external_api.failure", "Background job dispatch failed", error, { jobId: reference.jobId, jobType: reference.type, queueProvider: serverEnv.QUEUE_PROVIDER });
    return false;
  }
}
