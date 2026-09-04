import { describe, expect, test } from "bun:test";
import { isOwnerRoute, ownerLoginPath, safePostLoginPath } from "@/lib/owner-routes";

describe("owner-only Operations routes", () => {
  test("protects Cockpit, Projects, Engagements, and owner modules with passkey boundary", () => {
    const expectedOwnerRoutes = [
      "/cockpit",
      "/projects",
      "/engagements",
      "/engagements/eng_123",
      "/knowledge",
      "/directory",
      "/infrastructure",
      "/audit",
      "/files",
      "/activity",
    ];

    for (const path of expectedOwnerRoutes) {
      expect(isOwnerRoute(path)).toBe(true);
    }
  });

  test("leaves customer modules, landing page, and demo sandboxes outside the owner-only route set", () => {
    const expectedCustomerRoutes = [
      "/",
      "/jobs",
      "/shopfloor",
      "/inventory",
      "/job-packets",
      "/maintenance",
      "/packaging",
      "/shipping",
      "/quotes",
      "/purchasing",
      "/quality",
      "/analytics",
      "/demo",
    ];

    for (const path of expectedCustomerRoutes) {
      expect(isOwnerRoute(path)).toBe(false);
    }
  });

  test("keeps owner return paths and rejects open redirects or unrelated destinations", () => {
    expect(safePostLoginPath("/cockpit")).toBe("/cockpit");
    expect(safePostLoginPath("/projects")).toBe("/projects");
    expect(safePostLoginPath("/engagements/eng_123")).toBe("/engagements/eng_123");
    expect(safePostLoginPath("/knowledge")).toBe("/knowledge");
    expect(safePostLoginPath("/infrastructure")).toBe("/infrastructure");
    expect(safePostLoginPath("/audit")).toBe("/audit");
    expect(safePostLoginPath("/directory")).toBe("/directory");
    expect(safePostLoginPath("/files")).toBe("/files");
    expect(safePostLoginPath("/activity")).toBe("/activity");
    expect(safePostLoginPath("//example.com")).toBe("/jobs");
    expect(safePostLoginPath("/demo")).toBe("/jobs");
    expect(ownerLoginPath("/cockpit")).toBe("/login?next=%2Fcockpit");
    expect(ownerLoginPath("/engagements/eng_123")).toBe("/login?next=%2Fengagements%2Feng_123");
    expect(ownerLoginPath("/knowledge")).toBe("/login?next=%2Fknowledge");
  });
});
