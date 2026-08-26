import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { identityService } from "./identity-service";
import { identityRepository } from "../infrastructure/identity-repository";
import { SessionContext } from "../domain/types";

export interface ResolvedSessionResult {
  sessionContext: SessionContext | null;
  error?: "unauthenticated" | "no_memberships" | "inactive_organization" | "forbidden";
}

export async function resolveServerSession(): Promise<ResolvedSessionResult> {
  const reqHeaders = await headers();
  const reqCookies = await cookies();

  // 1. Check for Active Demo Session (Isolated Sandbox Mode)
  const demoOrgCookie = reqCookies.get("yorkstead_demo_org")?.value;
  const isDemoHeader = reqHeaders.get("x-demo-mode") === "true";

  if (demoOrgCookie || isDemoHeader) {
    const demoOrgId = demoOrgCookie || "org_front_range_mfg";
    try {
      const demoContext = identityService.getSessionContext("usr_demo_operator");
      if (demoContext.activeOrganization.id !== demoOrgId) {
        try {
          const switched = identityService.switchActiveOrganization("usr_demo_operator", demoOrgId);
          return { sessionContext: switched };
        } catch {
          return { sessionContext: demoContext };
        }
      }
      return { sessionContext: demoContext };
    } catch {
      const bootstrap = identityService.bootstrapOwner({
        email: "demo@yorkstead.com",
        name: "Demo Operator",
        organizationName: "Front Range Precision Manufacturing",
        organizationSlug: "front-range-mfg",
      });
      const context = identityService.getSessionContext(bootstrap.user.id);
      return { sessionContext: context };
    }
  }

  // 2. Production Persistent Better Auth & Database Session Validation
  try {
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user) {
      return { sessionContext: null, error: "unauthenticated" };
    }

    const activeOrgCookie = reqCookies.get("yorkstead_active_org")?.value;

    try {
      // Resolve persistent session context and validate requested organization against database membership
      const context = await identityRepository.resolveSessionContext(session.user.id, activeOrgCookie);
      return { sessionContext: context };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("no active organization memberships")) {
        return { sessionContext: null, error: "no_memberships" };
      }
      if (message.includes("Forbidden") || message.includes("not an active member")) {
        return { sessionContext: null, error: "forbidden" };
      }
      return { sessionContext: null, error: "unauthenticated" };
    }
  } catch {
    return { sessionContext: null, error: "unauthenticated" };
  }
}
