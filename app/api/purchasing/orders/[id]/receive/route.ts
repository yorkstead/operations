import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { purchasingRepository } from "@/modules/purchasing/infrastructure/purchasing-repository";
import { purchasingService } from "@/modules/purchasing/application/purchasing-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const receiveReceiptSchema = z.object({
  packingSlipNumber: z.string().min(1),
  itemsReceived: z.array(
    z.object({
      itemCode: z.string().min(1),
      quantityReceived: z.number().int().positive(),
      lotNumber: z.string().optional(),
    })
  ).min(1),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = receiveReceiptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid receipt payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const res = purchasingService.recordReceipt(sessionContext, id, parsed.data);
      return NextResponse.json(res);
    }

    const res = await purchasingRepository.recordReceipt(sessionContext, id, parsed.data);
    return NextResponse.json(res);
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.purchasing.orders.[id].receive" });
  }
}
