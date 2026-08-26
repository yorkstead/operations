import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { packagingRepository } from "@/modules/packaging/infrastructure/packaging-repository";
import { packagingService } from "@/modules/packaging/application/packaging-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const packItemSchema = z.object({
  jobId: z.string().optional(),
  jobNumber: z.string().optional(),
  partDescription: z.string().min(1),
  quantity: z.number().int().positive(),
  unitWeightLbs: z.number().positive(),
  lotNumber: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = packItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid pack item payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const pkg = packagingService.packItem(sessionContext, id, parsed.data);
      return NextResponse.json({ package: pkg });
    }

    const pkg = await packagingRepository.packItem(sessionContext, id, parsed.data);
    return NextResponse.json({ package: pkg });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packaging.containers.[id].pack" });
  }
}
