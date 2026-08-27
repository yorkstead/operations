import type { SessionContext } from "@/modules/core/domain/types";
import { packetIntelligenceRepository } from "@/modules/packet-intelligence/infrastructure/packet-intelligence-repository";
import { backgroundJobRepository, type ClaimedBackgroundJob } from "../infrastructure/background-job-repository";
import type { JobQueueConsumer } from "@/lib/infrastructure/queue/queue";

function workerSession(job: ClaimedBackgroundJob): SessionContext {
  const now = new Date().toISOString();
  const organization = { id: job.organizationId, name: "Worker organization", slug: job.organizationId, status: "active" as const, createdAt: now, updatedAt: now };
  const membership = { id: `worker_${job.id}`, organizationId: job.organizationId, userId: job.createdByUserId, role: "operator" as const, createdAt: now, updatedAt: now };
  return {
    user: { id: job.createdByUserId, email: "background-worker@invalid", name: job.createdByName, status: "active", isGlobalOwner: false, createdAt: now, updatedAt: now },
    activeOrganization: organization,
    currentMembership: membership,
    allMemberships: [{ membership, organization }],
  };
}

export async function runClaimedJob(job: ClaimedBackgroundJob): Promise<"completed" | "retry" | "failed"> {
  try {
    if (job.type !== "packet.extract") throw new Error("Unsupported background job type.");
    await packetIntelligenceRepository.setExtractionStatus(job.organizationId, job.payload.documentId, "extracting");
    await backgroundJobRepository.updateProgress(job.id, 25);
    const document = await packetIntelligenceRepository.extractPacketData(
      workerSession(job), job.payload.documentId,
      { expectedRevision: job.payload.expectedRevision, expectedQuantity: job.payload.expectedQuantity },
    );
    await backgroundJobRepository.updateProgress(job.id, 90);
    await backgroundJobRepository.complete(job.id, {
      documentId: document.id,
      extractionStatus: document.extractionStatus,
      inconsistencyCount: document.inconsistencies.length,
    });
    console.info(JSON.stringify({ event: "background_job.completed", jobId: job.id, type: job.type, attempts: job.attempts }));
    return "completed";
  } catch {
    await packetIntelligenceRepository.setExtractionStatus(job.organizationId, job.payload.documentId, "failed").catch(() => undefined);
    await backgroundJobRepository.fail(job, "PROCESSING_FAILED");
    console.error(JSON.stringify({ event: "background_job.failed", jobId: job.id, type: job.type, attempts: job.attempts }));
    return job.attempts < job.maxAttempts ? "retry" : "failed";
  }
}

export async function runQueuedMessages(consumer: JobQueueConsumer, maxJobs = 10): Promise<number> {
  const messages = await consumer.pull({ batchSize: maxJobs, visibilityTimeoutMs: 900_000 });
  for (const leased of messages) {
    if (!leased.message) {
      await consumer.retry([{ leaseId: leased.leaseId, delaySeconds: 300 }]);
      console.error(JSON.stringify({ event: "queue_message.invalid", messageId: leased.messageId, deliveryAttempts: leased.attempts }));
      continue;
    }
    const claimed = await backgroundJobRepository.claimById(leased.message.jobId, leased.message.type);
    if (!claimed) {
      await consumer.acknowledge([leased.leaseId]);
      console.info(JSON.stringify({ event: "queue_message.duplicate_or_terminal", messageId: leased.messageId, jobId: leased.message.jobId }));
      continue;
    }
    const outcome = await runClaimedJob(claimed);
    if (outcome === "retry") {
      const delaySeconds = Math.min(300, 15 * 2 ** Math.max(0, claimed.attempts - 1));
      await consumer.retry([{ leaseId: leased.leaseId, delaySeconds }]);
    } else {
      await consumer.acknowledge([leased.leaseId]);
    }
    console.info(JSON.stringify({ event: "queue_message.settled", messageId: leased.messageId, jobId: leased.message.jobId, outcome, deliveryAttempts: leased.attempts }));
  }
  return messages.length;
}

export async function runAvailableJobs(maxJobs = 10): Promise<number> {
  await backgroundJobRepository.recoverStaleJobs(new Date(Date.now() - 15 * 60 * 1000));
  let processed = 0;
  while (processed < maxJobs) {
    const job = await backgroundJobRepository.claimNext();
    if (!job) break;
    await runClaimedJob(job);
    processed += 1;
  }
  return processed;
}
