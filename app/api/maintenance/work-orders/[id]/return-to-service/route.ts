import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { maintenanceRepository } from "@/modules/maintenance/infrastructure/maintenance-repository";
import { maintenanceService } from "@/modules/maintenance/application/maintenance-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const returnToServiceSchema = z.object({
  authorizedNotes: z.string().min(1),
  partsUsed: z.array(
    z.object({
      itemCode: z.string().min(1),
      description: z.string().min(1),
      quantity: z.number().positive(),
    })
  ).optional(),
  laborMinutes: z.number().int().nonnegative().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = returnToServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid return to service payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const wo = maintenanceService.authorizeReturnToService(sessionContext, id, parsed.data);
      return NextResponse.json({ workOrder: wo });
    }

    const wo = await maintenanceRepository.authorizeReturnToService(sessionContext, id, parsed.data);
    return NextResponse.json({ workOrder: wo });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.work-orders.[id].return-to-service" });
  }
}
