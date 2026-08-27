import { z } from "zod";

export const jobQueueMessageSchema = z.object({
  version: z.literal(1),
  jobId: z.string().min(1).max(100),
  type: z.enum(["packet.extract"]),
  resourceId: z.string().min(1).max(200),
  objectKey: z.string().min(1).max(1024).optional(),
  enqueuedAt: z.string().datetime(),
}).strict();

export type JobQueueMessage = z.infer<typeof jobQueueMessageSchema>;

export interface JobQueue {
  enqueueJob(message: JobQueueMessage, options?: { delaySeconds?: number }): Promise<void>;
}

export interface LeasedJobMessage {
  messageId: string;
  leaseId: string;
  attempts: number;
  message: JobQueueMessage | null;
  validationError?: "INVALID_MESSAGE";
}

export interface JobQueueConsumer {
  pull(options?: { batchSize?: number; visibilityTimeoutMs?: number }): Promise<LeasedJobMessage[]>;
  acknowledge(leaseIds: string[]): Promise<void>;
  retry(messages: Array<{ leaseId: string; delaySeconds?: number }>): Promise<void>;
}

export class NoopJobQueue implements JobQueue {
  async enqueueJob(message: JobQueueMessage): Promise<void> {
    jobQueueMessageSchema.parse(message);
  }
}
