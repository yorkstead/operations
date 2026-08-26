import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { cookies } from "next/headers";
import { z } from "zod";

const selectOrgSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export async function POST(request: Request) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = selectOrgSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const targetOrgId = parsed.data.organizationId;
    const hasMembership = sessionContext.allMemberships.some((m) => m.organization.id === targetOrgId);

    if (!hasMembership) {
      return NextResponse.json({ error: "Forbidden: User is not a member of target organization" }, { status: 403 });
    }

    const cookieStore = await cookies();
    cookieStore.set("yorkstead_active_org", targetOrgId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ ok: true, activeOrganizationId: targetOrgId });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.organizations.select" });
  }
}
