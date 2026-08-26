import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shippingRepository } from "@/modules/shipping/infrastructure/shipping-repository";
import { shippingService } from "@/modules/shipping/application/shipping-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const dispatchSchema = z.object({
  driverName: z.string().optional(),
  trailerOrPlateNumber: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = dispatchSchema.safeParse(body);
    const data = parsed.success ? parsed.data : {};

    if (sessionContext.activeOrganization.isDemo) {
      const manifest = shippingService.dispatchShipment(sessionContext, id, data);
      return NextResponse.json({ manifest });
    }

    const manifest = await shippingRepository.dispatchShipment(sessionContext, id, data);
    return NextResponse.json({ manifest });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shipping.manifests.[id].dispatch" });
  }
}
