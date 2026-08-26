import { describe, expect, it, spyOn } from "bun:test";
import { apiErrorResponse } from "../lib/api-error-response";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function routeFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? routeFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}

describe("safe API error responses", () => {
  it("does not expose database details and emits a correlation id", async () => {
    const log = spyOn(console, "error").mockImplementation(() => undefined);
    const response = apiErrorResponse(new Error('relation "memberships" does not exist; password=secret'), { action: "test.db" });
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error).toBe("The request could not be completed.");
    expect(body.error).not.toContain("memberships");
    expect(body.correlationId).toBe(response.headers.get("x-correlation-id"));
    expect(String(log.mock.calls[0]?.[0])).toContain("password=[REDACTED]");
    expect(String(log.mock.calls[0]?.[0])).not.toContain("password=secret");
    log.mockRestore();
  });

  it("does not return caught exception variables directly from API routes", () => {
    for (const file of routeFiles(join(process.cwd(), "app", "api"))) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/NextResponse\.json\(\{ error: (?:msg|message) \}/);
    }
  });

  it("does not reveal whether another tenant resource exists", async () => {
    const response = apiErrorResponse(new Error("Forbidden: record belongs to org_secret"), { action: "test.idor" });
    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.error).toBe("You do not have permission to perform this action.");
    expect(JSON.stringify(body)).not.toContain("org_secret");
  });

  it("preserves a safe negative-stock conflict contract", async () => {
    const response = apiErrorResponse(new Error("Negative Stock Policy Violation: balance=2 requested=8"), { action: "test.inventory" });
    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.code).toBe("NEGATIVE_STOCK");
    expect(body.error).not.toContain("balance=2");
  });
});
