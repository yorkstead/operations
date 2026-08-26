import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { packetIntelligenceRepository } from "@/modules/packet-intelligence/infrastructure/packet-intelligence-repository";
import { packetIntelligenceService } from "@/modules/packet-intelligence/application/packet-intelligence-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId") || "job_104";
  const department = (searchParams.get("department") || "shopfloor") as "shopfloor" | "quality" | "purchasing" | "shipping";

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const packet = packetIntelligenceService.assembleDepartmentPacket(sessionContext, jobId, department);
      return NextResponse.json({ packet });
    }

    const packet = await packetIntelligenceRepository.assembleDepartmentPacket(sessionContext, jobId, department);
    return NextResponse.json({ packet });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packets.department" });
  }
}
