import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { fileRepository } from "@/modules/core/infrastructure/file-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const metrics = await fileRepository.getMetrics(sessionContext);
    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.files.metrics" });
  }
}
