import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { head } from "@vercel/blob";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { fileRepository } from "@/modules/core/infrastructure/file-repository";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/modules/core/domain/ports/file-storage-port";
import { env } from "@/lib/env";

type UploadPayload = { fileId: string; organizationId: string };

export async function POST(request: Request) {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Private file storage is not configured." }, { status: 503 });
  }

  const body = (await request.json()) as HandleUploadBody;
  try {
    const response = await handleUpload({
      body,
      request,
      token: env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { sessionContext } = await resolveServerSession();
        if (!sessionContext || sessionContext.activeOrganization.isDemo) throw new Error("Unauthorized upload request.");
        const parsed = JSON.parse(clientPayload || "{}") as { fileId?: string };
        if (!parsed.fileId) throw new Error("Missing upload record.");
        const file = await fileRepository.getFile(sessionContext, parsed.fileId);
        if (file.status !== "pending_scan" || file.storageKey !== pathname) throw new Error("Upload target is not authorized.");
        return {
          allowedContentTypes: ALLOWED_MIME_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE_BYTES,
          addRandomSuffix: false,
          allowOverwrite: false,
          validUntil: Date.now() + 15 * 60 * 1000,
          tokenPayload: JSON.stringify({ fileId: file.id, organizationId: file.organizationId } satisfies UploadPayload),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload || "{}") as Partial<UploadPayload>;
        if (!payload.fileId || !payload.organizationId) throw new Error("Invalid upload completion payload.");
        const metadata = await head(blob.url, { token: env.BLOB_READ_WRITE_TOKEN });
        await fileRepository.completeUpload({
          organizationId: payload.organizationId,
          fileId: payload.fileId,
          storageKey: metadata.pathname,
          sizeBytes: metadata.size,
          mimeType: metadata.contentType,
        });
      },
    });
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Private upload authorization or completion failed." }, { status: 400 });
  }
}
