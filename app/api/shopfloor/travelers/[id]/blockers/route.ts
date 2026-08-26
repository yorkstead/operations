import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api-error-response";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shopfloorRepository } from "@/modules/shopfloor/infrastructure/shopfloor-repository";
import { shopfloorService } from "@/modules/shopfloor/application/shopfloor-service";
import { z } from "zod";

const reportBlockerSchema = z.object({
  operationId: z.string().min(1, "Operation ID is required"),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(300),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = reportBlockerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const updated = shopfloorService.reportBlocker(sessionContext, id, parsed.data.operationId, parsed.data.reason);
      return NextResponse.json({ traveler: updated });
    }

    const updated = await shopfloorRepository.reportBlocker(sessionContext, id, parsed.data.operationId, parsed.data.reason);
    return NextResponse.json({ traveler: updated });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shopfloor.travelers.blockers" });
  }
}
