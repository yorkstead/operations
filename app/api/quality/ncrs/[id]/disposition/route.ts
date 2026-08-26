import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { qualityRepository } from "@/modules/quality/infrastructure/quality-repository";
import { qualityService } from "@/modules/quality/application/quality-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const dispositionSchema = z.object({
  disposition: z.enum(["use_as_is", "rework", "scrap_and_remake", "return_to_vendor"]),
  dispositionNotes: z.string().min(1),
  rootCauseAnalysis: z.string().optional(),
  finalScrapCostCents: z.number().int().nonnegative().optional(),
  reworkLaborMinutes: z.number().int().nonnegative().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = dispositionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid disposition payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const ncr = qualityService.applyDisposition(sessionContext, id, parsed.data);
      return NextResponse.json({ ncr });
    }

    const ncr = await qualityRepository.applyDisposition(sessionContext, id, parsed.data);
    return NextResponse.json({ ncr });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quality.ncrs.[id].disposition" });
  }
}
