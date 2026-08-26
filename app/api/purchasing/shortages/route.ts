import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { purchasingRepository } from "@/modules/purchasing/infrastructure/purchasing-repository";
import { purchasingService } from "@/modules/purchasing/application/purchasing-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const shortages = purchasingService.listShortages(sessionContext);
      return NextResponse.json({ shortages });
    }
    const shortages = await purchasingRepository.listShortages(sessionContext);
    return NextResponse.json({ shortages });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.purchasing.shortages" });
  }
}
