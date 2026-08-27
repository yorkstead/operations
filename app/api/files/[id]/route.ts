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
      const files = fileService.listFiles(sessionContext);
      const file = files.find((f) => f.id === id);
      if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
      return NextResponse.json({ file });
    }
    const file = await fileRepository.getFile(sessionContext, id);
    return NextResponse.json({ file });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.files.[id]" });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      return NextResponse.json({ success: true });
    }
    const file = await fileRepository.getFile(sessionContext, id);
    if (!isObjectStorageConfigured()) return NextResponse.json({ error: "Private file storage is not configured." }, { status: 503 });
    await getObjectStorage().deleteObject(file.storageKey);
    await fileRepository.deleteFile(sessionContext, id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.files.[id]" });
  }
}
