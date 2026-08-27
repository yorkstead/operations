import { jobQueueMessageSchema, type JobQueue, type JobQueueConsumer, type JobQueueMessage, type LeasedJobMessage } from "./queue";

export interface CloudflareQueueConfig { accountId: string; queueId: string; apiToken: string; apiBaseUrl?: string }
interface CloudflareEnvelope<T> { success: boolean; result?: T; errors?: Array<{ code?: number; message?: string }> }

export class CloudflareJobQueue implements JobQueue, JobQueueConsumer {
  private readonly baseUrl: string;
  constructor(private readonly config: CloudflareQueueConfig) {
    this.baseUrl = `${config.apiBaseUrl ?? "https://api.cloudflare.com/client/v4"}/accounts/${encodeURIComponent(config.accountId)}/queues/${encodeURIComponent(config.queueId)}/messages`;
  }

  async enqueueJob(message: JobQueueMessage, options?: { delaySeconds?: number }): Promise<void> {
    const validated = jobQueueMessageSchema.parse(message);
    await this.request("", { body: JSON.stringify(validated), content_type: "text", ...(options?.delaySeconds ? { delay_seconds: options.delaySeconds } : {}) });
  }

  async pull(options?: { batchSize?: number; visibilityTimeoutMs?: number }): Promise<LeasedJobMessage[]> {
    const response = await this.request<{ messages?: Array<{ id?: string; lease_id?: string; attempts?: number; body?: string }> }>("/pull", {
      batch_size: Math.max(1, Math.min(100, options?.batchSize ?? 10)),
      visibility_timeout_ms: Math.max(1_000, Math.min(43_200_000, options?.visibilityTimeoutMs ?? 900_000)),
    });
    const leased: LeasedJobMessage[] = [];
    for (const item of response.messages ?? []) {
      if (!item.id || !item.lease_id) throw new Error("Queue returned a message without required lease metadata.");
      let body: unknown;
      try { body = typeof item.body === "string" ? JSON.parse(item.body) : null; } catch { body = null; }
      const decoded = jobQueueMessageSchema.safeParse(body);
      leased.push(decoded.success
        ? { messageId: item.id, leaseId: item.lease_id, attempts: item.attempts ?? 1, message: decoded.data }
        : { messageId: item.id, leaseId: item.lease_id, attempts: item.attempts ?? 1, message: null, validationError: "INVALID_MESSAGE" });
    }
    return leased;
  }

  async acknowledge(leaseIds: string[]): Promise<void> {
    if (leaseIds.length) await this.request("/ack", { acks: leaseIds.map((lease_id) => ({ lease_id })), retries: [] });
  }

  async retry(messages: Array<{ leaseId: string; delaySeconds?: number }>): Promise<void> {
    if (messages.length) await this.request("/ack", { acks: [], retries: messages.map(({ leaseId, delaySeconds }) => ({ lease_id: leaseId, ...(delaySeconds ? { delay_seconds: delaySeconds } : {}) })) });
  }

  private async request<T = unknown>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { method: "POST", headers: { authorization: `Bearer ${this.config.apiToken}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20_000) });
    const envelope = await response.json().catch(() => null) as CloudflareEnvelope<T> | null;
    if (!response.ok || !envelope?.success) {
      const code = envelope?.errors?.[0]?.code;
      throw new Error(`Queue provider request failed${code ? ` (${code})` : ""}.`);
    }
    return (envelope.result ?? {}) as T;
  }
}
