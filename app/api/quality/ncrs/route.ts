import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { qualityRepository } from "@/modules/quality/infrastructure/quality-repository";
import { qualityService } from "@/modules/quality/application/quality-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createNCRSchema = z.object({
  jobId: z.string().min(1),
  jobNumber: z.string().min(1),
  partDescription: z.string().min(1),
  operationName: z.string().min(1),
  defectDescription: z.string().min(1),
  defectCategory: z.string().min(1),
  severity: z.enum(["minor", "major", "critical"]),
  defectQuantity: z.number().int().positive(),
  containmentActions: z.array(z.string()).min(1),
  scrapCostCents: z.number().int().nonnegative().optional(),
  reworkLaborMinutes: z.number().int().nonnegative().optional(),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const severity = searchParams.get("severity") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const ncrs = qualityService.listNCRs(sessionContext);
      return NextResponse.json({ ncrs });
    }
    const ncrs = await qualityRepository.listNCRs(sessionContext, { status, severity, limit, offset });
    return NextResponse.json({ ncrs });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quality.ncrs" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createNCRSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid NCR payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const ncr = qualityService.createNCR(sessionContext, parsed.data);
      return NextResponse.json({ ncr }, { status: 201 });
    }

    const ncr = await qualityRepository.createNCR(sessionContext, parsed.data);
    return NextResponse.json({ ncr }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quality.ncrs" });
  }
}
