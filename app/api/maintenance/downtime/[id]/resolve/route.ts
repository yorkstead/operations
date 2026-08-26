import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { maintenanceRepository } from "@/modules/maintenance/infrastructure/maintenance-repository";
import { maintenanceService } from "@/modules/maintenance/application/maintenance-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const resolveSchema = z.object({
  resolutionNotes: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid resolution payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const interval = maintenanceService.resolveDowntime(sessionContext, id, parsed.data.resolutionNotes);
      return NextResponse.json({ interval });
    }

    const interval = await maintenanceRepository.resolveDowntime(sessionContext, id, parsed.data.resolutionNotes);
    return NextResponse.json({ interval });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.downtime.[id].resolve" });
  }
}
