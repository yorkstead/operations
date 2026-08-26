import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { inventoryRepository } from "@/modules/inventory/infrastructure/inventory-repository";
import { inventoryService } from "@/modules/inventory/application/inventory-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const movementSchema = z.object({
  movementType: z.enum(["receive", "issue_to_job", "return_from_job", "transfer", "scrap"]),
  itemId: z.string().min(1),
  lotId: z.string().optional(),
  fromLocationId: z.string().optional(),
  toLocationId: z.string().optional(),
  quantity: z.string().min(1),
  unitCostCents: z.number().int().nonnegative().optional(),
  jobId: z.string().optional(),
  travelerId: z.string().optional(),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const movements = inventoryService.listMovements(sessionContext, undefined, { limit, offset });
      return NextResponse.json({ movements });
    }
    const movements = await inventoryRepository.listMovements(sessionContext, undefined, { limit, offset });
    return NextResponse.json({ movements });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.inventory.movements" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const idempotencyKey = req.headers.get("idempotency-key") || undefined;

  try {
    const body = await req.json();
    const parsed = movementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid movement payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const movement = inventoryService.postMovement(sessionContext, {
        ...parsed.data,
        idempotencyKey,
      });
      return NextResponse.json({ movement }, { status: 201 });
    }

    const movement = await inventoryRepository.postMovement(sessionContext, {
      ...parsed.data,
      idempotencyKey,
    });

    return NextResponse.json({ movement }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.inventory.movements" });
  }
}
