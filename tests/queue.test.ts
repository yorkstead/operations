import { afterEach, describe, expect, it } from "bun:test";
import { CloudflareJobQueue } from "../lib/infrastructure/queue/cloudflare-queue";
import { jobQueueMessageSchema } from "../lib/infrastructure/queue/queue";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

describe("provider-neutral job queue", () => {
  const message = { version: 1 as const, jobId: "bgjob_1", type: "packet.extract" as const, resourceId: "doc_1", enqueuedAt: "2026-08-27T00:00:00.000Z" };

  it("rejects unknown fields and oversized payload-style messages", () => {
    expect(jobQueueMessageSchema.safeParse({ ...message, payload: { documentBytes: "huge" } }).success).toBe(false);
  });

  it("publishes a text-encoded identifier-only message with bearer authentication", async () => {
    let request: RequestInit | undefined;
    globalThis.fetch = (async (_input, init) => {
      request = init;
      return Response.json({ success: true, result: {} });
    }) as typeof fetch;
    const queue = new CloudflareJobQueue({ accountId: "account", queueId: "queue", apiToken: "secret", apiBaseUrl: "https://api.example.test" });
    await queue.enqueueJob(message);
    expect(request?.headers).toEqual({ authorization: "Bearer secret", "content-type": "application/json" });
    const envelope = JSON.parse(String(request?.body));
    expect(envelope.content_type).toBe("text");
    expect(JSON.parse(envelope.body)).toEqual(message);
  });

  it("validates pulled messages and acknowledges leases", async () => {
    const bodies: unknown[] = [];
    globalThis.fetch = (async (input, init) => {
      bodies.push(JSON.parse(String(init?.body)));
      if (String(input).endsWith("/pull")) return Response.json({ success: true, result: { messages: [{ id: "msg_1", lease_id: "lease_1", attempts: 1, body: JSON.stringify(message) }] } });
      return Response.json({ success: true, result: { ackCount: 1 } });
    }) as typeof fetch;
    const queue = new CloudflareJobQueue({ accountId: "account", queueId: "queue", apiToken: "secret", apiBaseUrl: "https://api.example.test" });
    const [leased] = await queue.pull();
    expect(leased.message).toEqual(message);
    await queue.acknowledge([leased.leaseId]);
    expect(bodies[1]).toEqual({ acks: [{ lease_id: "lease_1" }], retries: [] });
  });

  it("isolates malformed messages so valid messages in the batch can continue", async () => {
    globalThis.fetch = (async () => Response.json({ success: true, result: { messages: [
      { id: "bad", lease_id: "lease_bad", attempts: 2, body: "not-json" },
      { id: "good", lease_id: "lease_good", attempts: 1, body: JSON.stringify(message) },
    ] } })) as unknown as typeof fetch;
    const queue = new CloudflareJobQueue({ accountId: "account", queueId: "queue", apiToken: "secret", apiBaseUrl: "https://api.example.test" });
    const pulled = await queue.pull();
    expect(pulled[0].validationError).toBe("INVALID_MESSAGE");
    expect(pulled[0].message).toBeNull();
    expect(pulled[1].message).toEqual(message);
  });
});
