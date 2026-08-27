import { describe, expect, test } from "bun:test";
import { GET } from "@/app/api/health/live/route";

describe("container liveness", () => {
  test("reports process health without calling external dependencies", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(body.status).toBe("LIVE");
    expect(body.service).toBe("yorkstead-operations");
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
