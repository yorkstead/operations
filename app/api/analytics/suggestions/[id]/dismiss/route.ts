import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { analyticsRepository } from "@/modules/analytics/infrastructure/analytics-repository";
import { analyticsService } from "@/modules/analytics/application/analytics-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const dismissSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = dismissSchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;

    if (sessionContext.activeOrganization.isDemo) {
      const suggestion = analyticsService.dismissPlanningSuggestion(sessionContext, id, reason || "Dismissed by user");
      return NextResponse.json({ suggestion });
    }

    const suggestion = await analyticsRepository.dismissPlanningSuggestion(sessionContext, id, reason);
    return NextResponse.json({ suggestion });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.analytics.suggestions.[id].dismiss" });
  }
}
