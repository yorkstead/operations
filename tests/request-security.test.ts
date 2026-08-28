import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { hasAllowlistedDemoSession, isPublicOperationsPage, proxy } from "@/proxy";
import { resolveDemoSession } from "@/modules/core/application/server-session";

describe("deployment request security", () => {
  test("rejects cross-site mutations and permits same-origin mutations", async () => {
    const rejected = await proxy(new NextRequest("https://ops.yorkstead.com/api/files", {
      method: "POST",
      headers: { origin: "https://attacker.example", "sec-fetch-site": "cross-site" },
    }));
    expect(rejected.status).toBe(403);

    const allowed = await proxy(new NextRequest("https://ops.yorkstead.com/api/files", {
      method: "POST",
      headers: { origin: "https://ops.yorkstead.com", "sec-fetch-site": "same-origin" },
    }));
    expect(allowed.status).toBe(200);
  });

  test("keeps non-browser service requests compatible when Origin is absent", async () => {
    const response = await proxy(new NextRequest("https://ops.yorkstead.com/api/background-jobs/job_1/retry", { method: "POST" }));
    expect(response.status).toBe(200);
  });

  test("creates only allowlisted, least-privilege demo sessions", () => {
    expect(resolveDemoSession("untrusted_org")).toBeNull();
    const session = resolveDemoSession("org_front_range_mfg");
    expect(session?.activeOrganization.isDemo).toBe(true);
    expect(session?.user.isGlobalOwner).toBe(false);
    expect(session?.currentMembership.role).toBe("demo_visitor");
  });

  test("keeps only login and demo pages public", () => {
    expect(isPublicOperationsPage("/login")).toBe(true);
    expect(isPublicOperationsPage("/demo")).toBe(true);
    expect(isPublicOperationsPage("/")).toBe(false);
    expect(isPublicOperationsPage("/settings/roles")).toBe(false);
  });

  test("accepts only allowlisted demo session cookies", () => {
    const allowed = new NextRequest("https://ops.yorkstead.com/inventory", {
      headers: { cookie: "yorkstead_demo_org=demo_front_range_manufacturing" },
    });
    const rejected = new NextRequest("https://ops.yorkstead.com/inventory", {
      headers: { cookie: "yorkstead_demo_org=untrusted_org" },
    });
    expect(hasAllowlistedDemoSession(allowed)).toBe(true);
    expect(hasAllowlistedDemoSession(rejected)).toBe(false);
  });
});
