import { serverEnv } from "@/lib/infrastructure/env/server";
import { createJobQueue } from "@/lib/infrastructure/queue/factory";
import { backgroundJobRepository } from "../infrastructure/background-job-repository";

export async function dispatchBackgroundJob(jobId: string): Promise<boolean> {
  const reference = await backgroundJobRepository.getDispatchReference(jobId);
  if (!reference) return false;
  try {
    await createJobQueue(serverEnv).enqueueJob({ version: 1, ...reference, enqueuedAt: new Date().toISOString() });
    console.info(JSON.stringify({ event: "background_job.dispatched", jobId: reference.jobId, type: reference.type, provider: serverEnv.QUEUE_PROVIDER }));
    return true;
  } catch {
    console.error(JSON.stringify({ event: "background_job.dispatch_failed", jobId: reference.jobId, type: reference.type, provider: serverEnv.QUEUE_PROVIDER }));
    return false;
  }
}
