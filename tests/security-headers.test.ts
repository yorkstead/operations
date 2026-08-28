import { describe, expect, it } from "bun:test";
import { applicationSecurityHeaders, contentSecurityPolicy } from "../lib/security-headers";

describe("operations application security headers", () => {
  it("locks production browser capabilities, frames, and resource classes", () => {
    const headers = applicationSecurityHeaders("production");
    const map = new Map(headers.map((h) => [h.key, h.value]));

    expect(map.get("X-Frame-Options")).toBe("DENY");
    expect(map.get("X-Content-Type-Options")).toBe("nosniff");
    expect(map.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(map.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(map.get("Strict-Transport-Security")).toContain("max-age=63072000");

    const csp = map.get("Content-Security-Policy");
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("keeps development environment tooling functional without weakening policy architecture", () => {
    const csp = contentSecurityPolicy("development");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("ws: wss:");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
});
