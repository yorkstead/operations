import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { purchasingRepository } from "@/modules/purchasing/infrastructure/purchasing-repository";
import { purchasingService } from "@/modules/purchasing/application/purchasing-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createPOSchema = z.object({
  vendorId: z.string().min(1),
  vendorName: z.string().min(1),
  vendorEmail: z.string().email(),
  expectedDeliveryDate: z.string().min(1),
  lineItems: z.array(
    z.object({
      itemCode: z.string().min(1),
      description: z.string().min(1),
      quantityOrdered: z.number().int().positive(),
      uom: z.string().optional(),
      unitCostCents: z.number().int().positive(),
      linkedJobId: z.string().optional(),
      linkedJobNumber: z.string().optional(),
    })
  ).min(1),
  shippingCostCents: z.number().int().nonnegative().optional(),
  taxCostCents: z.number().int().nonnegative().optional(),
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
      const orders = purchasingService.listPurchaseOrders(sessionContext);
      return NextResponse.json({ purchaseOrders: orders });
    }
    const orders = await purchasingRepository.listPurchaseOrders(sessionContext, { status, limit, offset });
    return NextResponse.json({ purchaseOrders: orders });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.purchasing.orders" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createPOSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid PO payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const po = purchasingService.createPurchaseOrder(sessionContext, parsed.data);
      return NextResponse.json({ purchaseOrder: po }, { status: 201 });
    }

    const po = await purchasingRepository.createPurchaseOrder(sessionContext, parsed.data);
    return NextResponse.json({ purchaseOrder: po }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.purchasing.orders" });
  }
}
