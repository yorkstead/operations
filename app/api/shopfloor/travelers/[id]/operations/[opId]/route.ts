import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error-response";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shopfloorRepository } from "@/modules/shopfloor/infrastructure/shopfloor-repository";
import { shopfloorService } from "@/modules/shopfloor/application/shopfloor-service";
import { z } from "zod";

const operationActionSchema = z.object({
  action: z.enum(["start", "complete"]),
  completedQuantity: z.number().int().min(0).optional(),
  scrappedQuantity: z.number().int().min(0).optional().default(0),
  laborMinutes: z.number().int().min(1).optional().default(15),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; opId: string }> }
) {
  const { id, opId } = await params;
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = operationActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      if (parsed.data.action === "start") {
        const updated = shopfloorService.startOperation(sessionContext, id, opId);
        return NextResponse.json({ traveler: updated });
      } else {
        const updated = shopfloorService.completeOperation(sessionContext, id, opId, {
          completedQuantity: parsed.data.completedQuantity ?? 1,
          scrappedQuantity: parsed.data.scrappedQuantity,
          laborMinutes: parsed.data.laborMinutes,
        });
        return NextResponse.json({ traveler: updated });
      }
    }

    if (parsed.data.action === "start") {
      const updated = await shopfloorRepository.startOperation(sessionContext, id, opId);
      return NextResponse.json({ traveler: updated });
    } else {
      const updated = await shopfloorRepository.completeOperation(sessionContext, id, opId, {
        completedQuantity: parsed.data.completedQuantity ?? 1,
        scrappedQuantity: parsed.data.scrappedQuantity,
        laborMinutes: parsed.data.laborMinutes,
      });
      return NextResponse.json({ traveler: updated });
    }
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shopfloor.travelers.operation" });
  }
}
