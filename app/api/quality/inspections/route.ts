import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { qualityRepository } from "@/modules/quality/infrastructure/quality-repository";
import { qualityService } from "@/modules/quality/application/quality-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createInspectionSchema = z.object({
  inspectionType: z.enum(["first_article", "in_process", "final_acceptance", "receiving_dock"]),
  jobId: z.string().min(1),
  jobNumber: z.string().min(1),
  partDescription: z.string().min(1),
  travelerOperationId: z.string().optional(),
  sampleSize: z.number().int().positive(),
  passedQuantity: z.number().int().nonnegative(),
  failedQuantity: z.number().int().nonnegative(),
  checklist: z.array(
    z.object({
      id: z.string(),
      characteristic: z.string().min(1),
      targetSpec: z.string().min(1),
      measuredValue: z.string().optional(),
      result: z.enum(["pass", "fail", "untested"]),
      notes: z.string().optional(),
    })
  ),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const inspections = qualityService.listInspections(sessionContext, jobId);
      return NextResponse.json({ inspections });
    }
    const inspections = await qualityRepository.listInspections(sessionContext, jobId, { limit, offset });
    return NextResponse.json({ inspections });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quality.inspections" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createInspectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid inspection payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const inspection = qualityService.recordInspection(sessionContext, parsed.data);
      return NextResponse.json({ inspection }, { status: 201 });
    }

    const inspection = await qualityRepository.recordInspection(sessionContext, parsed.data);
    return NextResponse.json({ inspection }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quality.inspections" });
  }
}
