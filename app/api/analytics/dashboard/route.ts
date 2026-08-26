import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { analyticsRepository } from "@/modules/analytics/infrastructure/analytics-repository";
import { analyticsService } from "@/modules/analytics/application/analytics-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const summary = analyticsService.getExecutiveDashboardMetrics(sessionContext);
      return NextResponse.json(summary);
    }

    const summary = await analyticsRepository.getExecutiveDashboardMetrics(sessionContext);
    return NextResponse.json(summary);
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.analytics.dashboard" });
  }
}
