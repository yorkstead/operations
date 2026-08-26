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
      const item = inventoryService.getItem(sessionContext, id);
      return NextResponse.json({ item });
    }
    const item = await inventoryRepository.getItem(sessionContext, id);
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: `Item '${id}' not found in active organization.` }, { status: 404 });
  }
}
