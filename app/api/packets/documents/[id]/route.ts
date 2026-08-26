import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { packetIntelligenceRepository } from "@/modules/packet-intelligence/infrastructure/packet-intelligence-repository";
import { packetIntelligenceService } from "@/modules/packet-intelligence/application/packet-intelligence-service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const document = packetIntelligenceService.getDocument(sessionContext, id);
      return NextResponse.json({ document });
    }
    const document = await packetIntelligenceRepository.getDocument(sessionContext, id);
    return NextResponse.json({ document });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packets.documents.[id]" });
  }
}
