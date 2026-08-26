import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shopfloorRepository } from "@/modules/shopfloor/infrastructure/shopfloor-repository";
import { shopfloorService } from "@/modules/shopfloor/application/shopfloor-service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const traveler = shopfloorService.getTravelerByQr(sessionContext, id);
      return NextResponse.json({ traveler });
    }

    const traveler = await shopfloorRepository.getTraveler(sessionContext, id);
    if (!traveler) {
      return NextResponse.json({ error: "Traveler not found in active organization" }, { status: 404 });
    }
    return NextResponse.json({ traveler });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shopfloor.travelers.[id]" });
  }
}
