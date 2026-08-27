import type { ServerEnv } from "../env/server";
import { CloudflareJobQueue } from "./cloudflare-queue";
import { NoopJobQueue, type JobQueue, type JobQueueConsumer } from "./queue";

export function createJobQueue(env: ServerEnv): JobQueue {
  return env.QUEUE_PROVIDER === "cloudflare" ? createCloudflareQueue(env) : new NoopJobQueue();
}

export function createJobQueueConsumer(env: ServerEnv): JobQueueConsumer | null {
  return env.QUEUE_PROVIDER === "cloudflare" ? createCloudflareQueue(env) : null;
}

function createCloudflareQueue(env: ServerEnv): CloudflareJobQueue {
  if (!env.QUEUE_ACCOUNT_ID || !env.QUEUE_ID || !env.QUEUE_API_TOKEN) throw new Error("Cloudflare queue configuration is incomplete.");
  return new CloudflareJobQueue({ accountId: env.QUEUE_ACCOUNT_ID, queueId: env.QUEUE_ID, apiToken: env.QUEUE_API_TOKEN });
}
