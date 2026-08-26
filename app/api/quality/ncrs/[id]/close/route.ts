import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { qualityRepository } from "@/modules/quality/infrastructure/quality-repository";
import { qualityService } from "@/modules/quality/application/quality-service";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const ncr = qualityService.closeNCR(sessionContext, id);
      return NextResponse.json({ ncr });
    }

    const ncr = await qualityRepository.closeNCR(sessionContext, id);
    return NextResponse.json({ ncr });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quality.ncrs.[id].close" });
  }
}
