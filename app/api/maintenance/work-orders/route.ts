import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { maintenanceRepository } from "@/modules/maintenance/infrastructure/maintenance-repository";
import { maintenanceService } from "@/modules/maintenance/application/maintenance-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createWorkOrderSchema = z.object({
  equipmentId: z.string().min(1),
  type: z.enum(["corrective_emergency", "preventive_scheduled", "facility_improvement"]),
  priority: z.enum(["standard", "urgent", "emergency"]),
  title: z.string().min(1),
  description: z.string().min(1),
  assignedTechnicianId: z.string().optional(),
  assignedTechnicianName: z.string().optional(),
});

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const workOrders = await maintenanceRepository.listWorkOrders(sessionContext);
    return NextResponse.json({ workOrders });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.work-orders" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createWorkOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid work order payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const wo = maintenanceService.createWorkOrder(sessionContext, parsed.data);
      return NextResponse.json({ workOrder: wo }, { status: 201 });
    }

    const wo = await maintenanceRepository.createWorkOrder(sessionContext, parsed.data);
    return NextResponse.json({ workOrder: wo }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.work-orders" });
  }
}
