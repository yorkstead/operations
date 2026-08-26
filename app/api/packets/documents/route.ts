import { apiErrorResponse } from "@/lib/api-error-response";
import { NextRequest, NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { packetIntelligenceRepository } from "@/modules/packet-intelligence/infrastructure/packet-intelligence-repository";
import { packetIntelligenceService } from "@/modules/packet-intelligence/application/packet-intelligence-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ingestDocSchema = z.object({
  jobId: z.string().min(1),
  jobNumber: z.string().min(1),
  fileName: z.string().min(1),
  fileSizeBytes: z.number().int().positive(),
  mimeType: z.string().min(1),
  documentType: z.enum([
    "engineering_drawing",
    "purchase_order",
    "specification_sheet",
    "material_cert",
    "inspection_report",
    "cad_archive",
  ]).optional(),
  fileStorageKey: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId") || undefined;
  const documentType = searchParams.get("documentType") || undefined;
  const status = searchParams.get("status") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const documents = packetIntelligenceService.listDocuments(sessionContext, { jobId });
      return NextResponse.json({ documents });
    }
    const documents = await packetIntelligenceRepository.listDocuments(sessionContext, { jobId, documentType, status, limit, offset });
    return NextResponse.json({ documents });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packets.documents" });
  }
}

export async function POST(req: NextRequest) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = ingestDocSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid document payload", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const document = packetIntelligenceService.ingestDocument(sessionContext, parsed.data);
      return NextResponse.json({ document }, { status: 201 });
    }

    const document = await packetIntelligenceRepository.ingestDocument(sessionContext, parsed.data);
    return NextResponse.json({ document }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.packets.documents" });
  }
}
