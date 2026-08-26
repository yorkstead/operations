import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { inventoryService } from "@/modules/inventory/application/inventory-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json({ error: "Missing barcode or QR scan code parameter" }, { status: 400 });
  }

  try {
    const item = await inventoryService.getItem(sessionContext, code);
    const balances = await inventoryService.getItemBalances(sessionContext, item.id);
    return NextResponse.json({ item, balances });
  } catch {
    return NextResponse.json({ error: `Scan code '${code}' not found in active organization.` }, { status: 404 });
  }
}
