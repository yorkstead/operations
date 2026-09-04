import { NextRequest, NextResponse } from "next/server";
import { listVaultNotes, getVaultNoteDetail } from "@/modules/knowledge/infrastructure/obsidian-vault";
import { apiErrorResponse } from "@/lib/api-error-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const query = searchParams.get("q") || undefined;

    if (slug) {
      const note = getVaultNoteDetail(slug);
      if (!note) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      return NextResponse.json({ note });
    }

    const summary = listVaultNotes(query, category, tag);
    return NextResponse.json(summary);
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.knowledge.vault" });
  }
}
