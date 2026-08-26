import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { quotingRepository } from "@/modules/quoting/infrastructure/quoting-repository";
import { quoteService } from "@/modules/quoting/application/quote-service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const quote = quoteService.getQuote(sessionContext, id);
      return NextResponse.json({ quote });
    }
    const quote = await quotingRepository.getQuote(sessionContext, id);
    return NextResponse.json({ quote });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quoting.quotes.[id]" });
  }
}
