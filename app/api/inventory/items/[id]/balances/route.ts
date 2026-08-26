import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { inventoryRepository } from "@/modules/inventory/infrastructure/inventory-repository";
import { inventoryService } from "@/modules/inventory/application/inventory-service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  try {
    if (sessionContext.activeOrganization.isDemo) {
      const balances = inventoryService.getItemBalances(sessionContext, id);
      return NextResponse.json({ balances });
    }
    const balances = await inventoryRepository.getItemBalances(sessionContext, id);
    return NextResponse.json({ balances });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.inventory.items.[id].balances" });
  }
}
