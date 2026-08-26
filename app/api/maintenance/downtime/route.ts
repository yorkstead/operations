import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { maintenanceRepository } from "@/modules/maintenance/infrastructure/maintenance-repository";
import { maintenanceService } from "@/modules/maintenance/application/maintenance-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reportDowntimeSchema = z.object({
  equipmentId: z.string().min(1),
  category: z.enum(["unplanned_breakdown", "planned_preventive", "tooling_failure", "operator_error", "waiting_for_parts"]),
  reason: z.string().min(1),
  impactSummary: z.string().min(1),
});

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const intervals = await maintenanceRepository.listDowntime(sessionContext);
    return NextResponse.json({ intervals });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.downtime" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = reportDowntimeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid downtime payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const interval = maintenanceService.reportDowntime(sessionContext, parsed.data);
      return NextResponse.json({ interval }, { status: 201 });
    }

    const interval = await maintenanceRepository.reportDowntime(sessionContext, parsed.data);
    return NextResponse.json({ interval }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.downtime" });
  }
}
