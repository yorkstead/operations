import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { quotingRepository } from "@/modules/quoting/infrastructure/quoting-repository";
import { quoteService } from "@/modules/quoting/application/quote-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createQuoteSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  customerContactEmail: z.string().email(),
  title: z.string().min(1),
  lineItems: z.array(
    z.object({
      partDescription: z.string().min(1),
      drawingNumber: z.string().optional(),
      revision: z.string().optional(),
      quantity: z.number().int().positive(),
      materialCostCents: z.number().int().nonnegative(),
      laborCostCents: z.number().int().nonnegative(),
      machineCostCents: z.number().int().nonnegative(),
      outsourcingCostCents: z.number().int().nonnegative().optional(),
      freightCostCents: z.number().int().nonnegative().optional(),
      overheadCostCents: z.number().int().nonnegative().optional(),
      targetMarginPercent: z.number().min(0).max(99),
    })
  ).min(1),
  expiresAt: z.string().optional(),
  minMarginThresholdPercent: z.number().optional(),
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
      const quotes = quoteService.listQuotes(sessionContext);
      return NextResponse.json({ quotes });
    }
    const quotes = await quotingRepository.listQuotes(sessionContext, { status, limit, offset });
    return NextResponse.json({ quotes });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quoting.quotes" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createQuoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid quote payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const quote = quoteService.createQuote(sessionContext, parsed.data);
      return NextResponse.json({ quote }, { status: 201 });
    }

    const quote = await quotingRepository.createQuote(sessionContext, parsed.data);
    return NextResponse.json({ quote }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quoting.quotes" });
  }
}
