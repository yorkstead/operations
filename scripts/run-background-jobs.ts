import { serverEnv } from "../lib/infrastructure/env/server";
import { createJobQueueConsumer } from "../lib/infrastructure/queue/factory";
import { runAvailableJobs, runQueuedMessages } from "../modules/jobs/application/job-runner";
import { applicationMetadata } from "../lib/infrastructure/observability/app-metadata";
import { logger } from "../lib/infrastructure/observability/logger";

const maxArg = process.argv.find((argument) => argument.startsWith("--max="));
const maxJobs = Math.max(1, Math.min(100, Number(maxArg?.split("=")[1] ?? 10) || 10));
logger.info("application.startup", "Background worker started", { service: applicationMetadata.service, version: applicationMetadata.version, runtimeRole: "worker" });
try {
  const consumer = createJobQueueConsumer(serverEnv);
  const queued = consumer ? await runQueuedMessages(consumer, maxJobs) : 0;
  const recovered = await runAvailableJobs(Math.max(0, maxJobs - queued));
  logger.info("background_worker.finished", "Background worker finished", { queueProvider: serverEnv.QUEUE_PROVIDER, queued, recovered, processed: queued + recovered });
} finally {
  logger.info("application.shutdown", "Background worker stopped", { service: applicationMetadata.service, version: applicationMetadata.version, runtimeRole: "worker" });
}
