import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { fileRepository } from "@/modules/core/infrastructure/file-repository";
import { fileService } from "@/modules/core/application/file-service";
import { getObjectStorage, isObjectStorageConfigured } from "@/lib/infrastructure/storage";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const res = await fileService.getAuthorizedDownloadUrl(sessionContext, id);
      return NextResponse.json(res);
    }
    const file = await fileRepository.getFile(sessionContext, id);
    if (file.status !== "clean") {
      return NextResponse.json(
        { error: "File is not available for download while security review is pending or blocked." },
        { status: 423 }
      );
    }
    if (!isObjectStorageConfigured()) return NextResponse.json({ error: "Private file storage is not configured." }, { status: 503 });
    const object = await getObjectStorage().getObject(file.storageKey);
    if (!object) return NextResponse.json({ error: "File object not found." }, { status: 404 });
    return new NextResponse(object.body, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.filename.replace(/["\r\n]/g, "_")}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.files.[id].download" });
  }
}
