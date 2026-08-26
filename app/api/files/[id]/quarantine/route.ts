import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { fileRepository } from "@/modules/core/infrastructure/file-repository";
import { fileService } from "@/modules/core/application/file-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const quarantineSchema = z.object({
  reason: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = quarantineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid quarantine payload" }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const file = fileService.quarantineFile(sessionContext, id, parsed.data.reason);
      return NextResponse.json({ file });
    }

    const file = await fileRepository.quarantineFile(sessionContext, id, parsed.data.reason);
    return NextResponse.json({ file });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.files.[id].quarantine" });
  }
}
