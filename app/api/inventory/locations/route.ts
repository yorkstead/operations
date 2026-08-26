import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { inventoryRepository } from "@/modules/inventory/infrastructure/inventory-repository";
import { inventoryService } from "@/modules/inventory/application/inventory-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createLocationSchema = z.object({
  locationCode: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  type: z.string().optional(),
});

export async function GET() {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const locations = inventoryService.listLocations(sessionContext);
      return NextResponse.json({ locations });
    }
    const locations = await inventoryRepository.listLocations(sessionContext);
    return NextResponse.json({ locations });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.inventory.locations" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createLocationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid location payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const location = inventoryService.createLocation(sessionContext, parsed.data);
      return NextResponse.json({ location }, { status: 201 });
    }

    const location = await inventoryRepository.createLocation(sessionContext, parsed.data);
    return NextResponse.json({ location }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.inventory.locations" });
  }
}
