import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { maintenanceRepository } from "@/modules/maintenance/infrastructure/maintenance-repository";
import { maintenanceService } from "@/modules/maintenance/application/maintenance-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createEquipmentSchema = z.object({
  assetTag: z.string().min(1),
  name: z.string().min(1),
  manufacturer: z.string().min(1),
  modelNumber: z.string().min(1),
  serialNumber: z.string().min(1),
  workCenterCode: z.string().min(1),
  locationCode: z.string().min(1),
  criticality: z.enum(["low", "medium", "high", "critical_single_point_of_failure"]),
  lastServiceDate: z.string().optional(),
  nextScheduledPmDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const workCenterCode = searchParams.get("workCenterCode") || undefined;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const equipment = maintenanceService.listEquipment(sessionContext);
      return NextResponse.json({ equipment });
    }
    const equipment = await maintenanceRepository.listEquipment(sessionContext, { status, workCenterCode });
    return NextResponse.json({ equipment });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.equipment" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createEquipmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid equipment payload", details: parsed.error.format() }, { status: 400 });
    }

    const eq = await maintenanceRepository.createEquipment(sessionContext, parsed.data);
    return NextResponse.json({ equipment: eq }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.maintenance.equipment" });
  }
}
