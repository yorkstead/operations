import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shippingRepository } from "@/modules/shipping/infrastructure/shipping-repository";
import { shippingService } from "@/modules/shipping/application/shipping-service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const manifest = shippingService.getManifest(sessionContext, id);
      return NextResponse.json({ manifest });
    }
    const manifest = await shippingRepository.getManifest(sessionContext, id);
    return NextResponse.json({ manifest });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shipping.manifests.[id]" });
  }
}
