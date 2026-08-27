import { describe, expect, test } from "bun:test";
import { GET } from "@/app/api/health/route";

describe("provider-neutral health endpoint", () => {
  test("returns only status, version, and timestamp without probing dependencies", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(Object.keys(body).sort()).toEqual(["status", "timestamp", "version"]);
    expect(body.status).toBe("ok");
    expect(typeof body.version).toBe("string");
    expect(body.version.length).toBeGreaterThan(0);
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
