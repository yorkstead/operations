import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { identityRepository } from "../infrastructure/identity-repository";
import { SessionContext } from "../domain/types";

const demoOrganizations = {
  org_front_range_mfg: { id: "org_front_range_mfg", name: "Front Range Precision Manufacturing", slug: "front-range-manufacturing" },
  demo_front_range_manufacturing: { id: "demo_front_range_manufacturing", name: "Front Range Precision Manufacturing", slug: "front-range-manufacturing" },
  demo_summit_facility_services: { id: "demo_summit_facility_services", name: "Summit Facility Services", slug: "summit-facility-services" },
  demo_mile_high_signworks: { id: "demo_mile_high_signworks", name: "Mile High Signworks", slug: "mile-high-signworks" },
  demo_peak_mobile_detail: { id: "demo_peak_mobile_detail", name: "Peak Mobile Detail", slug: "peak-mobile-detail" },
} as const;

export function resolveDemoSession(demoOrganizationId: string | undefined): SessionContext | null {
  if (!demoOrganizationId || !(demoOrganizationId in demoOrganizations)) return null;
  const selected = demoOrganizations[demoOrganizationId as keyof typeof demoOrganizations];
  const now = new Date().toISOString();
  const organization = { ...selected, status: "active" as const, isDemo: true, createdAt: now, updatedAt: now };
  const user = { id: "usr_demo_visitor", email: "demo@yorkstead.com", name: "Demo Visitor", status: "active" as const, isGlobalOwner: false, createdAt: now, updatedAt: now };
  const membership = { id: `demo_membership_${selected.id}`, organizationId: selected.id, userId: user.id, role: "demo_visitor" as const, createdAt: now, updatedAt: now };
  return { user, activeOrganization: organization, currentMembership: membership, allMemberships: [{ membership, organization }] };
}

export interface ResolvedSessionResult {
  sessionContext: SessionContext | null;
  error?: "unauthenticated" | "no_memberships" | "inactive_organization" | "forbidden";
}

export async function resolveServerSession(): Promise<ResolvedSessionResult> {
  const reqHeaders = await headers();
  const reqCookies = await cookies();

  // 1. Check for Active Demo Session (Isolated Sandbox Mode)
  const demoOrgCookie = reqCookies.get("yorkstead_demo_org")?.value;
  const demoContext = resolveDemoSession(demoOrgCookie);
  if (demoContext) return { sessionContext: demoContext };

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
