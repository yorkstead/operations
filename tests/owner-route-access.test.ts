import { describe, expect, test } from "bun:test";
import { isOwnerRoute, ownerLoginPath, safePostLoginPath } from "@/lib/owner-routes";

describe("owner-only Operations routes", () => {
  test("protects Cockpit, Projects, Engagements, and nested engagement workspaces", () => {
    expect(isOwnerRoute("/")).toBe(true);
    expect(isOwnerRoute("/projects")).toBe(true);
    expect(isOwnerRoute("/engagements")).toBe(true);
    expect(isOwnerRoute("/engagements/eng_123")).toBe(true);
  });

  test("leaves demo and operational modules outside the owner-only route set", () => {
    for (const path of ["/demo", "/jobs", "/shopfloor", "/inventory", "/analytics"]) {
      expect(isOwnerRoute(path)).toBe(false);
    }
  });

  test("keeps owner return paths and rejects open redirects or unrelated destinations", () => {
    expect(safePostLoginPath("/projects")).toBe("/projects");
    expect(safePostLoginPath("/engagements/eng_123")).toBe("/engagements/eng_123");
    expect(safePostLoginPath("//example.com")).toBe("/jobs");
    expect(safePostLoginPath("/demo")).toBe("/jobs");
    expect(ownerLoginPath("/engagements/eng_123")).toBe("/login?next=%2Fengagements%2Feng_123");
  });
});
