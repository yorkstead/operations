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
  costModelType: z.enum(["discovery_audit", "custom_software_milestone", "monthly_sla_retainer", "manufacturing_custom"]).optional(),
  estimatedEngineeringHours: z.number().optional(),
  hourlyRateCents: z.number().optional(),
  cloudComputePassThroughCents: z.number().optional(),
  includedIntegrations: z.array(z.string()).optional(),
  deliverableSummary: z.array(z.string()).optional(),
  targetMarginPercent: z.number().min(0).max(99).optional(),
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
  ).optional(),
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
    const quotes = quoteService.listQuotes(sessionContext);
    if (quotes.length > 0) {
      return NextResponse.json({ quotes });
    }
    const repoQuotes = await quotingRepository.listQuotes(sessionContext, { status, limit, offset });
    return NextResponse.json({ quotes: repoQuotes });
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

    if (parsed.data.costModelType && parsed.data.costModelType !== "manufacturing_custom") {
      const quote = quoteService.createConsultingProposal(sessionContext, {
        customerId: parsed.data.customerId,
        customerName: parsed.data.customerName,
        customerContactEmail: parsed.data.customerContactEmail,
        title: parsed.data.title,
        costModelType: parsed.data.costModelType,
        estimatedEngineeringHours: parsed.data.estimatedEngineeringHours || 40,
        hourlyRateCents: parsed.data.hourlyRateCents || 17500,
        cloudComputePassThroughCents: parsed.data.cloudComputePassThroughCents || 0,
        includedIntegrations: parsed.data.includedIntegrations || [],
        deliverableSummary: parsed.data.deliverableSummary || ["Discovery & Requirements", "Core Implementation", "Staging & Go-Live"],
        targetMarginPercent: parsed.data.targetMarginPercent || 40,
      });
      return NextResponse.json({ quote }, { status: 201 });
    }

    if (parsed.data.lineItems && parsed.data.lineItems.length > 0) {
      const quote = quoteService.createQuote(sessionContext, {
        customerId: parsed.data.customerId,
        customerName: parsed.data.customerName,
        customerContactEmail: parsed.data.customerContactEmail,
        title: parsed.data.title,
        lineItems: parsed.data.lineItems,
      });
      return NextResponse.json({ quote }, { status: 201 });
    }

    return NextResponse.json({ error: "Either consulting parameters or lineItems must be provided" }, { status: 400 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.quoting.quotes" });
  }
}
