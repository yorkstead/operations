import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { packagingRepository } from "@/modules/packaging/infrastructure/packaging-repository";
import { packagingService } from "@/modules/packaging/application/packaging-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createContainerSchema = z.object({
  containerType: z.enum(["box", "crate", "pallet", "bundle", "tote"]),
  specificationId: z.string().optional(),
  maxCapacityLbs: z.number().positive().optional(),
  tareWeightLbs: z.number().nonnegative().optional(),
  dimensionsInches: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const packages = packagingService.listPackages(sessionContext);
      return NextResponse.json({ packages });
    }
    const packages = await packagingRepository.listPackages(sessionContext, { status, limit, offset });
    return NextResponse.json({ packages });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packaging.containers" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createContainerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid container payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const pkg = packagingService.createPackagingUnit(sessionContext, parsed.data);
      return NextResponse.json({ package: pkg }, { status: 201 });
    }

    const pkg = await packagingRepository.createPackagingUnit(sessionContext, parsed.data);
    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packaging.containers" });
  }
}
