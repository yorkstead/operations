import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { qualityRepository } from "@/modules/quality/infrastructure/quality-repository";
import { qualityService } from "@/modules/quality/application/quality-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const metrics = qualityService.getQualityMetrics(sessionContext);
      return NextResponse.json({ metrics });
    }
    const metrics = await qualityRepository.getMetrics(sessionContext);
    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quality.metrics" });
  }
}
