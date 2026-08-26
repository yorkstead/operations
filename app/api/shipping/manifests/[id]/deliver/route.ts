import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shippingRepository } from "@/modules/shipping/infrastructure/shipping-repository";
import { shippingService } from "@/modules/shipping/application/shipping-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const deliverSchema = z.object({
  stopSequence: z.number().int().positive().optional(),
  signedBy: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = deliverSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid delivery payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const manifest = shippingService.confirmDelivery(
        sessionContext,
        id,
        parsed.data.stopSequence || 1,
        parsed.data.signedBy
      );
      return NextResponse.json({ manifest });
    }

    const manifest = await shippingRepository.confirmDelivery(
      sessionContext,
      id,
      parsed.data.stopSequence || 1,
      parsed.data.signedBy
    );
    return NextResponse.json({ manifest });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shipping.manifests.[id].deliver" });
  }
}
