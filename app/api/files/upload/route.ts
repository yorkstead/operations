import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { fileRepository } from "@/modules/core/infrastructure/file-repository";
import { getObjectStorage, isObjectStorageConfigured } from "@/lib/infrastructure/storage";
import { z } from "zod";
import { sha256Hex } from "@/lib/infrastructure/storage/file-integrity";
import { MAX_FILE_SIZE_BYTES } from "@/modules/core/domain/ports/file-storage-port";

const completionSchema = z.object({ fileId: z.string().min(1) });

export async function POST(request: Request) {
  if (!isObjectStorageConfigured()) {
    return NextResponse.json({ error: "Private file storage is not configured." }, { status: 503 });
  }
  try {
    const { sessionContext } = await resolveServerSession();
    if (!sessionContext || sessionContext.activeOrganization.isDemo) {
      return NextResponse.json({ error: "Unauthorized upload completion." }, { status: 401 });
    }
    const parsed = completionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid upload completion payload." }, { status: 400 });
    const file = await fileRepository.getFile(sessionContext, parsed.data.fileId);
    if (file.status !== "pending_scan") return NextResponse.json({ error: "Upload record is no longer pending." }, { status: 409 });
    const metadata = await getObjectStorage().getObjectMetadata(file.storageKey);
    if (!metadata) return NextResponse.json({ error: "Uploaded object was not found." }, { status: 404 });
    if (metadata.contentLength !== file.sizeBytes || metadata.contentLength > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Uploaded object size does not match the authorized upload." }, { status: 400 });
    }
    const storedObject = await getObjectStorage().getObject(file.storageKey);
    if (!storedObject || !file.checksumSha256) {
      return NextResponse.json({ error: "Uploaded object integrity could not be verified." }, { status: 400 });
    }
    const integrity = await sha256Hex(storedObject.body, MAX_FILE_SIZE_BYTES);
    if (integrity.sizeBytes !== file.sizeBytes || integrity.checksumSha256 !== file.checksumSha256.toLowerCase()) {
      return NextResponse.json({ error: "Uploaded object failed integrity verification." }, { status: 400 });
    }
    await fileRepository.completeUpload({
      organizationId: file.organizationId,
      fileId: file.id,
      storageKey: metadata.key,
      sizeBytes: metadata.contentLength ?? -1,
      mimeType: metadata.contentType ?? "",
    });
    return NextResponse.json({ completed: true });
  } catch {
    return NextResponse.json({ error: "Private upload completion failed." }, { status: 400 });
  }
}
