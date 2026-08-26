import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { fileRepository } from "@/modules/core/infrastructure/file-repository";
import { fileService } from "@/modules/core/application/file-service";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/modules/core/domain/ports/file-storage-port";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const prepareUploadSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const entityType = searchParams.get("entityType") || undefined;
  const entityId = searchParams.get("entityId") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const files = fileService.listFiles(sessionContext);
      return NextResponse.json({ files });
    }
    const files = await fileRepository.listFiles(sessionContext, { status, entityType, entityId, limit, offset });
    return NextResponse.json({ files });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.files" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = prepareUploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid upload payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const result = await fileService.prepareUpload(sessionContext, parsed.data);
      return NextResponse.json(result, { status: 201 });
    }

    if (!env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Private file storage is not configured." }, { status: 503 });
    }
    if (!ALLOWED_MIME_TYPES.includes(parsed.data.mimeType) || parsed.data.sizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File type or size is not permitted." }, { status: 400 });
    }
    const safeFilename = parsed.data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = `tenants/${sessionContext.activeOrganization.id}/vault/${randomUUID()}/${safeFilename}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const fileRecord = await fileRepository.saveFileRecord(sessionContext, {
      ...parsed.data,
      storageKey,
    });

    return NextResponse.json({ fileRecord, uploadUrl: "/api/files/upload", expiresAt }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.files" });
  }
}
