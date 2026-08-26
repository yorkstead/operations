import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { knowledgeRepository } from "@/modules/knowledge/infrastructure/knowledge-repository";
import { knowledgeService } from "@/modules/knowledge/application/knowledge-service";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const article = knowledgeService.publishArticleRevision(sessionContext, id);
      return NextResponse.json({ article });
    }
    const article = await knowledgeRepository.publishArticleRevision(sessionContext, id);
    return NextResponse.json({ article });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.knowledge.articles.[id].publish" });
  }
}
