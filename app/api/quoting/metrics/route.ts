import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { quotingRepository } from "@/modules/quoting/infrastructure/quoting-repository";
import { quoteService } from "@/modules/quoting/application/quote-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const metrics = quoteService.getQuoteMetrics(sessionContext);
      return NextResponse.json({ metrics });
    }
    const metrics = await quotingRepository.getMetrics(sessionContext);
    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quoting.metrics" });
  }
}
