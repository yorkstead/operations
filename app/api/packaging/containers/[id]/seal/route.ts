import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { packagingRepository } from "@/modules/packaging/infrastructure/packaging-repository";
import { packagingService } from "@/modules/packaging/application/packaging-service";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const pkg = packagingService.sealPackagingUnit(sessionContext, id);
      return NextResponse.json({ package: pkg });
    }
    const pkg = await packagingRepository.sealPackagingUnit(sessionContext, id);
    return NextResponse.json({ package: pkg });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packaging.containers.[id].seal" });
  }
}
