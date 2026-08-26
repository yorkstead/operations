import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { purchasingRepository } from "@/modules/purchasing/infrastructure/purchasing-repository";
import { purchasingService } from "@/modules/purchasing/application/purchasing-service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const po = purchasingService.getPurchaseOrder(sessionContext, id);
      return NextResponse.json({ purchaseOrder: po });
    }
    const po = await purchasingRepository.getPurchaseOrder(sessionContext, id);
    return NextResponse.json({ purchaseOrder: po });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.purchasing.orders.[id]" });
  }
}
