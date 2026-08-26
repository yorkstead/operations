import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { packagingRepository } from "@/modules/packaging/infrastructure/packaging-repository";
import { packagingService } from "@/modules/packaging/application/packaging-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const metrics = packagingService.getPackagingMetrics(sessionContext);
      return NextResponse.json({ metrics });
    }
    const metrics = await packagingRepository.getMetrics(sessionContext);
    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packaging.metrics" });
  }
}
