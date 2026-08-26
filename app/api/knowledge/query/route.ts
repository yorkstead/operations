import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { knowledgeRepository } from "@/modules/knowledge/infrastructure/knowledge-repository";
import { knowledgeService } from "@/modules/knowledge/application/knowledge-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  query: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = querySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query payload" }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const result = knowledgeService.searchAndAnswerQuery(sessionContext, parsed.data.query);
      return NextResponse.json(result);
    }

    const result = await knowledgeRepository.searchAndAnswerQuery(sessionContext, parsed.data.query);
    return NextResponse.json(result);
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.knowledge.query" });
  }
}
