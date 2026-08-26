import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { inventoryRepository } from "@/modules/inventory/infrastructure/inventory-repository";
import { inventoryService } from "@/modules/inventory/application/inventory-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const cycleCountSchema = z.object({
  itemId: z.string().min(1),
  locationId: z.string().min(1),
  lotId: z.string().optional(),
  observedQuantity: z.string().min(1),
  reason: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = cycleCountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cycle count payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const result = inventoryService.recordCycleCount(sessionContext, parsed.data);
      return NextResponse.json(result, { status: 201 });
    }

    const result = await inventoryRepository.recordCycleCount(sessionContext, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.inventory.cycle-counts" });
  }
}
