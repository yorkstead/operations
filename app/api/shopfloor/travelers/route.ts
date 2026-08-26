import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { shopfloorRepository } from "@/modules/shopfloor/infrastructure/shopfloor-repository";
import { shopfloorService } from "@/modules/shopfloor/application/shopfloor-service";
import { z } from "zod";

const createTravelerSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  jobNumber: z.string().min(1, "Job Number is required"),
  partDescription: z.string().min(1, "Part description is required"),
  customerName: z.string().min(1, "Customer name is required"),
  totalQuantity: z.number().int().min(1, "Quantity must be at least 1"),
  priority: z.enum(["standard", "rush", "critical"]).optional().default("standard"),
  targetDueDate: z.string().min(1, "Target due date is required"),
  operations: z.array(
    z.object({
      sequence: z.number().int().min(1),
      workCenterCode: z.string().min(1),
      workCenterName: z.string().min(1),
      operationName: z.string().min(1),
      requiredQuantity: z.number().int().optional(),
    })
  ).min(1, "At least one operation step is required"),
});

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const travelers = shopfloorService.listTravelers(sessionContext);
      return NextResponse.json({ travelers });
    }

    const travelers = await shopfloorRepository.listTravelers(sessionContext);
    return NextResponse.json({ travelers });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shopfloor.travelers" });
  }
}

export async function POST(request: Request) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createTravelerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const traveler = shopfloorService.createTraveler(sessionContext, parsed.data);
      return NextResponse.json({ traveler }, { status: 201 });
    }

    const traveler = await shopfloorRepository.createTraveler(sessionContext, parsed.data);
    return NextResponse.json({ traveler }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.shopfloor.travelers" });
  }
}
