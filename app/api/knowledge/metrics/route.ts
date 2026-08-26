import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { knowledgeRepository } from "@/modules/knowledge/infrastructure/knowledge-repository";
import { knowledgeService } from "@/modules/knowledge/application/knowledge-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const metrics = knowledgeService.getMetrics(sessionContext);
      return NextResponse.json({ metrics });
    }
    const metrics = await knowledgeRepository.getMetrics(sessionContext);
    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.knowledge.metrics" });
  }
}
