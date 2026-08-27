import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { packetIntelligenceRepository } from "@/modules/packet-intelligence/infrastructure/packet-intelligence-repository";
import { packetIntelligenceService } from "@/modules/packet-intelligence/application/packet-intelligence-service";
import { backgroundJobRepository } from "@/modules/jobs/infrastructure/background-job-repository";
import { z } from "zod";

export const dynamic = "force-dynamic";

const extractSchema = z.object({
  expectedRevision: z.string().optional(),
  expectedQuantity: z.number().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = extractSchema.safeParse(body);
    const options = parsed.success ? parsed.data : undefined;

    if (sessionContext.activeOrganization.isDemo) {
      const document = packetIntelligenceService.extractPacketData(sessionContext, id, options);
      return NextResponse.json({ document, job: {
        id: `demo_${id}`, type: "packet.extract", status: "completed", progress: 100,
        result: { documentId: id, extractionStatus: document.extractionStatus }, error: null,
        attempts: 1, createdAt: new Date().toISOString(), startedAt: null, completedAt: new Date().toISOString(),
      } });
    }

    await packetIntelligenceRepository.getDocument(sessionContext, id);
    const job = await backgroundJobRepository.createPacketExtraction(sessionContext, { documentId: id, ...options });
    return NextResponse.json({ job }, { status: job.status === "completed" ? 200 : 202 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packets.documents.[id].extract" });
  }
}
