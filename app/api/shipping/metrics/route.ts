import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shippingRepository } from "@/modules/shipping/infrastructure/shipping-repository";
import { shippingService } from "@/modules/shipping/application/shipping-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const metrics = shippingService.getShippingMetrics(sessionContext);
      return NextResponse.json({ metrics });
    }
    const metrics = await shippingRepository.getMetrics(sessionContext);
    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shipping.metrics" });
  }
}
