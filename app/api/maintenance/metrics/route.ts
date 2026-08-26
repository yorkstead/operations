import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { maintenanceRepository } from "@/modules/maintenance/infrastructure/maintenance-repository";
import { maintenanceService } from "@/modules/maintenance/application/maintenance-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const metrics = maintenanceService.getMaintenanceMetrics(sessionContext);
      return NextResponse.json({ metrics });
    }
    const metrics = await maintenanceRepository.getMetrics(sessionContext);
    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.metrics" });
  }
}
