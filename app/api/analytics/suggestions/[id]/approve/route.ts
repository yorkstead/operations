import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { analyticsRepository } from "@/modules/analytics/infrastructure/analytics-repository";
import { analyticsService } from "@/modules/analytics/application/analytics-service";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const suggestion = analyticsService.approvePlanningSuggestion(sessionContext, id);
      return NextResponse.json({ suggestion });
    }

    const suggestion = await analyticsRepository.approvePlanningSuggestion(sessionContext, id);
    return NextResponse.json({ suggestion });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.analytics.suggestions.[id].approve" });
  }
}
