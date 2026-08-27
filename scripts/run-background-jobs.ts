import { serverEnv } from "../lib/infrastructure/env/server";
import { createJobQueueConsumer } from "../lib/infrastructure/queue/factory";
import { runAvailableJobs, runQueuedMessages } from "../modules/jobs/application/job-runner";

const maxArg = process.argv.find((argument) => argument.startsWith("--max="));
const maxJobs = Math.max(1, Math.min(100, Number(maxArg?.split("=")[1] ?? 10) || 10));
const consumer = createJobQueueConsumer(serverEnv);
const queued = consumer ? await runQueuedMessages(consumer, maxJobs) : 0;
const recovered = await runAvailableJobs(Math.max(0, maxJobs - queued));
console.info(JSON.stringify({ event: "background_worker.finished", provider: serverEnv.QUEUE_PROVIDER, queued, recovered, processed: queued + recovered }));
