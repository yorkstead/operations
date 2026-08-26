import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { inventoryRepository } from "@/modules/inventory/infrastructure/inventory-repository";
import { inventoryService } from "@/modules/inventory/application/inventory-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createItemSchema = z.object({
  itemCode: z.string().min(1).max(50),
  description: z.string().min(1).max(255),
  category: z.enum(["raw_material", "hardware", "consumable", "subassembly", "finished_goods"]),
  unitOfMeasure: z.enum(["EA", "SHEET", "FT", "LBS", "BOX"]),
  defaultLocationId: z.string().optional(),
  reorderPoint: z.string().optional(),
  reorderQuantity: z.string().optional(),
  standardCostCents: z.number().int().nonnegative().optional(),
  lotTrackingRequired: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("q") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const result = inventoryService.listStock(sessionContext, { category, searchQuery, limit, offset });
      return NextResponse.json(result);
    }
    const result = await inventoryRepository.listItems(sessionContext, { category, searchQuery, limit, offset });
    return NextResponse.json(result);
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.inventory.items" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid item payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const item = inventoryService.createItem(sessionContext, parsed.data);
      return NextResponse.json({ item }, { status: 201 });
    }

    const item = await inventoryRepository.createItem(sessionContext, parsed.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.inventory.items" });
  }
}
