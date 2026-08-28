import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { resolveDemoSession } from "@/modules/core/application/server-session";

describe("deployment request security", () => {
  test("rejects cross-site mutations and permits same-origin mutations", () => {
    const rejected = proxy(new NextRequest("https://ops.yorkstead.com/api/files", {
      method: "POST",
      headers: { origin: "https://attacker.example", "sec-fetch-site": "cross-site" },
    }));
    expect(rejected.status).toBe(403);

    const allowed = proxy(new NextRequest("https://ops.yorkstead.com/api/files", {
      method: "POST",
      headers: { origin: "https://ops.yorkstead.com", "sec-fetch-site": "same-origin" },
    }));
    expect(allowed.status).toBe(200);
  });

  test("keeps non-browser service requests compatible when Origin is absent", () => {
    const response = proxy(new NextRequest("https://ops.yorkstead.com/api/background-jobs/job_1/retry", { method: "POST" }));
    expect(response.status).toBe(200);
  });

  test("creates only allowlisted, least-privilege demo sessions", () => {
    expect(resolveDemoSession("untrusted_org")).toBeNull();
    const session = resolveDemoSession("org_front_range_mfg");
    expect(session?.activeOrganization.isDemo).toBe(true);
    expect(session?.user.isGlobalOwner).toBe(false);
    expect(session?.currentMembership.role).toBe("demo_visitor");
  });
});
