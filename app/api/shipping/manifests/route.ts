import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shippingRepository } from "@/modules/shipping/infrastructure/shipping-repository";
import { shippingService } from "@/modules/shipping/application/shipping-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createManifestSchema = z.object({
  carrierType: z.enum(["dedicated_flatbed", "ltl_freight", "parcel_express", "customer_will_call", "hotshot_courier"]),
  carrierName: z.string().min(1),
  trackingOrProNumber: z.string().optional(),
  stops: z.array(
    z.object({
      stopSequence: z.number().int().positive(),
      destinationCustomerName: z.string().min(1),
      destinationAddress: z.string().min(1),
      packageNumbers: z.array(z.string()),
      contactPerson: z.string().optional(),
      contactPhone: z.string().optional(),
      deliveryNotes: z.string().optional(),
    })
  ).min(1),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const manifests = shippingService.listManifests(sessionContext);
      return NextResponse.json({ manifests });
    }
    const manifests = await shippingRepository.listManifests(sessionContext, { status, limit, offset });
    return NextResponse.json({ manifests });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shipping.manifests" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createManifestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid manifest payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const manifest = shippingService.createManifest(sessionContext, parsed.data);
      return NextResponse.json({ manifest }, { status: 201 });
    }

    const manifest = await shippingRepository.createManifest(sessionContext, parsed.data);
    return NextResponse.json({ manifest }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shipping.manifests" });
  }
}
