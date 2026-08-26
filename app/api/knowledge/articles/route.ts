import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { knowledgeRepository } from "@/modules/knowledge/infrastructure/knowledge-repository";
import { knowledgeService } from "@/modules/knowledge/application/knowledge-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createArticleSchema = z.object({
  category: z.enum([
    "standard_operating_procedure",
    "equipment_troubleshooting",
    "safety_protocol",
    "quality_standard",
    "onboarding_training",
  ]),
  title: z.string().min(1),
  tags: z.array(z.string()).default([]),
  linkedEquipmentCodes: z.array(z.string()).optional(),
  linkedModuleCodes: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  content: z.string().min(1),
  structuredSteps: z.array(
    z.object({
      stepNumber: z.number().int().positive(),
      title: z.string().min(1),
      instruction: z.string().min(1),
      safetyWarning: z.string().optional(),
      mediaUrl: z.string().optional(),
    })
  ).min(1),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const articles = knowledgeService.listArticles(sessionContext);
      return NextResponse.json({ articles });
    }
    const articles = await knowledgeRepository.listArticles(sessionContext, { category, status, tag, limit, offset });
    return NextResponse.json({ articles });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.knowledge.articles" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid article payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const article = knowledgeService.createArticleDraft(sessionContext, parsed.data);
      return NextResponse.json({ article }, { status: 201 });
    }

    const article = await knowledgeRepository.createArticleDraft(sessionContext, parsed.data);
    return NextResponse.json({ article }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.knowledge.articles" });
  }
}
