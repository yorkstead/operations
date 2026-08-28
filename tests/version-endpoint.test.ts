import { describe, expect, it } from "bun:test";
import { GET } from "../app/api/version/route";

describe("operations safe version identification", () => {
  it("returns safe service metadata without leaking environment secrets", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("X-Yorkstead-Service")).toBe("operations");

    const data = await response.json();
    expect(data.service).toBe("yorkstead-operations");
    expect(data.platform).toBe("google-cloud-run");
    expect(typeof data.commitSha).toBe("string");
    expect(typeof data.timestamp).toBe("string");

    // Ensure no secrets or sensitive keys are leaked
    const jsonString = JSON.stringify(data);
    expect(jsonString).not.toContain("password");
    expect(jsonString).not.toContain("secret");
    expect(jsonString).not.toContain("token");
  });
});
