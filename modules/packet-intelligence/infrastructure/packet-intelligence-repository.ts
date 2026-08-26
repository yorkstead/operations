import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { jobPacketDocuments, auditEvents, jobs } from "@/db/schema";
import {
  JobPacketDocument,
  DepartmentPacket,
  DocumentType,
  ExtractionStatus,
  ExtractedEntity,
  InconsistencyFlag,
} from "../domain/types";
import { SessionContext } from "@/modules/core/domain/types";

export class PacketIntelligenceRepository {
  async ensureSeededData(session: SessionContext): Promise<void> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const existing = await db
      .select({ id: jobPacketDocuments.id })
      .from(jobPacketDocuments)
      .where(eq(jobPacketDocuments.organizationId, orgId))
      .limit(1);

    if (existing.length === 0) {
      // Find or create default job
      let targetJobId = "job_default_dwg";
      let targetJobNum = "JOB-2026-104";

      const jobRows = await db
        .select({ id: jobs.id, jobNumber: jobs.jobNumber })
        .from(jobs)
        .where(eq(jobs.organizationId, orgId))
        .limit(1);

      if (jobRows.length > 0) {
        targetJobId = jobRows[0].id;
        targetJobNum = jobRows[0].jobNumber;
      } else {
        await db.insert(jobs).values({
          id: targetJobId,
          organizationId: orgId,
          jobNumber: targetJobNum,
          title: "Precision Mounting Flange",
          customerId: "cust_apex",
          customerName: "Apex Aerospace Components",
          currentStatus: "in_progress",
          priority: "high",
          currentRevision: "A",
          targetDueDate: new Date().toISOString(),
          estimatedLaborHours: 12,
        });
      }

      await db.insert(jobPacketDocuments).values({
        id: `doc_${Date.now()}_default`,
        organizationId: orgId,
        jobId: targetJobId,
        jobNumber: targetJobNum,
        fileName: "DWG-2026-104-REV-B.pdf",
        fileStorageKey: `tenants/${orgId}/vault/DWG-2026-104-REV-B.pdf`,
        fileSizeBytes: 2450000,
        mimeType: "application/pdf",
        documentType: "engineering_drawing",
        extractionStatus: "flagged_inconsistency",
        aiModelUsed: "synthetic-packet-parser-v2.1",
        extractedEntities: [
          { key: "part_number", label: "Part Number", rawValue: "DWG-2026-104", normalizedValue: "DWG-2026-104", confidenceScore: 0.98, approved: true },
          { key: "revision", label: "Drawing Revision", rawValue: "REV B", normalizedValue: "B", confidenceScore: 0.96, approved: false },
          { key: "material", label: "Material Spec", rawValue: "304 Stainless Steel 1/4in Sheet", normalizedValue: "SS-304-0.25", confidenceScore: 0.94, approved: true },
          { key: "quantity", label: "PO Quantity", rawValue: "150 pcs", normalizedValue: 150, confidenceScore: 0.99, approved: true },
        ],
        inconsistencies: [
          {
            field: "revision",
            severity: "critical_mismatch",
            message: "Drawing revision is 'REV B' but customer PO references baseline 'REV A'.",
            expectedValue: "A",
            detectedValue: "B",
          },
        ],
      });
    }
  }

  // 1. List Documents
  async listDocuments(
    session: SessionContext,
    options?: { jobId?: string; documentType?: string; status?: string; limit?: number; offset?: number }
  ): Promise<JobPacketDocument[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(jobPacketDocuments)
      .where(eq(jobPacketDocuments.organizationId, orgId))
      .orderBy(desc(jobPacketDocuments.createdAt))
      .limit(limit)
      .offset(offset);

    if (options?.jobId) {
      query = db
        .select()
        .from(jobPacketDocuments)
        .where(
          and(
            eq(jobPacketDocuments.organizationId, orgId),
            eq(jobPacketDocuments.jobId, options.jobId)
          )
        )
        .orderBy(desc(jobPacketDocuments.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    return rows.map(this.mapDocument);
  }

  // 2. Get Single Document
  async getDocument(session: SessionContext, id: string): Promise<JobPacketDocument> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(jobPacketDocuments)
      .where(and(eq(jobPacketDocuments.organizationId, orgId), eq(jobPacketDocuments.id, id)))
      .limit(1);

    if (rows.length === 0) {
      throw new Error(`Job packet document '${id}' not found.`);
    }

    return this.mapDocument(rows[0]);
  }

  // 3. Ingest Document
  async ingestDocument(
    session: SessionContext,
    params: {
      jobId: string;
      jobNumber: string;
      fileName: string;
      fileSizeBytes: number;
      mimeType: string;
      documentType?: DocumentType;
      fileStorageKey?: string;
    }
  ): Promise<JobPacketDocument> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const storageKey = params.fileStorageKey || `tenants/${orgId}/vault/${Date.now()}_${params.fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const [doc] = await db
      .insert(jobPacketDocuments)
      .values({
        id,
        organizationId: orgId,
        jobId: params.jobId,
        jobNumber: params.jobNumber,
        fileName: params.fileName,
        fileStorageKey: storageKey,
        fileSizeBytes: params.fileSizeBytes,
        mimeType: params.mimeType,
        documentType: params.documentType || "engineering_drawing",
        extractionStatus: "pending",
        extractedEntities: [],
        inconsistencies: [],
      })
      .returning();

    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: params.jobId,
      action: "packet.document_ingested",
      summary: `Ingested packet document '${params.fileName}' for Job ${params.jobNumber}`,
      metadata: { documentId: id, fileName: params.fileName, type: doc.documentType },
    });

    return this.mapDocument(doc);
  }

  // 4. Extract Packet Data & Detect Discrepancies
  async extractPacketData(
    session: SessionContext,
    documentId: string,
    options?: { expectedRevision?: string; expectedQuantity?: number }
  ): Promise<JobPacketDocument> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(jobPacketDocuments)
        .where(and(eq(jobPacketDocuments.organizationId, orgId), eq(jobPacketDocuments.id, documentId)))
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Job packet document '${documentId}' not found.`);
      }

      const doc = rows[0];

      // Synthetic OCR & Metadata extraction
      const entities: ExtractedEntity[] = [
        { key: "part_number", label: "Part Number", rawValue: doc.fileName.replace(".pdf", ""), normalizedValue: doc.fileName.replace(".pdf", ""), confidenceScore: 0.98, approved: true },
        { key: "revision", label: "Drawing Revision", rawValue: "REV B", normalizedValue: "B", confidenceScore: 0.96, approved: false },
        { key: "material", label: "Material Spec", rawValue: "304 Stainless Steel 0.25in Sheet", normalizedValue: "SS-304-0.25", confidenceScore: 0.94, approved: true },
        { key: "quantity", label: "PO Quantity", rawValue: "100 pcs", normalizedValue: 100, confidenceScore: 0.99, approved: true },
      ];

      const inconsistencies: InconsistencyFlag[] = [];

      if (options?.expectedRevision && options.expectedRevision !== "B") {
        inconsistencies.push({
          field: "revision",
          severity: "critical_mismatch",
          message: `Drawing revision detected as 'REV B', but job expects 'REV ${options.expectedRevision}'.`,
          expectedValue: options.expectedRevision,
          detectedValue: "B",
        });
      }

      if (options?.expectedQuantity && options.expectedQuantity !== 100) {
        inconsistencies.push({
          field: "quantity",
          severity: "warning",
          message: `Drawing title block specifies 100 pcs, but traveler requires ${options.expectedQuantity} pcs.`,
          expectedValue: options.expectedQuantity,
          detectedValue: 100,
        });
      }

      const status: ExtractionStatus = inconsistencies.length > 0 ? "flagged_inconsistency" : "extracted";

      const [updated] = await tx
        .update(jobPacketDocuments)
        .set({
          extractionStatus: status,
          aiModelUsed: "synthetic-packet-parser-v2.1",
          extractedEntities: entities,
          inconsistencies: inconsistencies,
          updatedAt: new Date(),
        })
        .where(eq(jobPacketDocuments.id, doc.id))
        .returning();

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: doc.jobId,
        action: "packet.extracted",
        summary: `Extracted metadata for '${doc.fileName}' - status: ${status}`,
        metadata: { documentId: doc.id, status, inconsistencyCount: inconsistencies.length },
      });

      return this.mapDocument(updated);
    });
  }

  // 5. Approve Extraction
  async approveExtraction(
    session: SessionContext,
    documentId: string,
    overrides?: Record<string, string | number>
  ): Promise<JobPacketDocument> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(jobPacketDocuments)
        .where(and(eq(jobPacketDocuments.organizationId, orgId), eq(jobPacketDocuments.id, documentId)))
        .for("update");

      if (rows.length === 0) {
        throw new Error(`Job packet document '${documentId}' not found.`);
      }

      const doc = rows[0];
      const entities = (doc.extractedEntities as ExtractedEntity[]).map((e) => {
        if (overrides && overrides[e.key] !== undefined) {
          return { ...e, normalizedValue: overrides[e.key], approved: true };
        }
        return { ...e, approved: true };
      });

      const now = new Date();
      const [updated] = await tx
        .update(jobPacketDocuments)
        .set({
          extractionStatus: "approved",
          extractedEntities: entities,
          inconsistencies: [],
          humanReviewerId: session.user.id,
          humanReviewerName: session.user.name,
          humanApprovedAt: now,
          updatedAt: now,
        })
        .where(eq(jobPacketDocuments.id, doc.id))
        .returning();

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: doc.jobId,
        action: "packet.approved",
        summary: `Approved extracted packet metadata for '${doc.fileName}' by ${session.user.name}`,
        metadata: { documentId: doc.id, reviewerId: session.user.id },
      });

      return this.mapDocument(updated);
    });
  }

  // 6. Assemble Department Packet
  async assembleDepartmentPacket(
    session: SessionContext,
    jobId: string,
    department: "shopfloor" | "quality" | "purchasing" | "shipping"
  ): Promise<DepartmentPacket> {
    const docs = await this.listDocuments(session, { jobId });
    const jobNumber = docs[0]?.jobNumber || "JOB-2026-104";

    const filteredDocs = docs.filter((d) => {
      if (department === "shopfloor") return ["engineering_drawing", "specification_sheet"].includes(d.documentType);
      if (department === "quality") return ["engineering_drawing", "inspection_report", "material_cert"].includes(d.documentType);
      if (department === "purchasing") return ["purchase_order", "material_cert"].includes(d.documentType);
      if (department === "shipping") return ["purchase_order", "inspection_report"].includes(d.documentType);
      return true;
    });

    const checklists: Record<string, string[]> = {
      shopfloor: [
        "Verify drawing revision matches active traveler (BOM check)",
        "Confirm material specification matches raw stock sheet",
        "Inspect critical dimensional tolerances prior to laser cut",
      ],
      quality: [
        "First Article Inspection (FAI) feature ballooning verified",
        "Material Test Report (MTR) heat number matches stock certificate",
        "CMM calibration check valid within 30 days",
      ],
      purchasing: [
        "Vendor purchase order matches quote line items",
        "Raw material certificate of conformance received",
      ],
      shipping: [
        "Packing slip quantities match approved delivery manifest",
        "Certificate of Conformance (CoC) enclosed in shipment",
      ],
    };

    return {
      department,
      jobId,
      jobNumber,
      documentCount: filteredDocs.length,
      documents: filteredDocs,
      checklist: checklists[department] || [],
    };
  }

  private mapDocument(d: typeof jobPacketDocuments.$inferSelect): JobPacketDocument {
    return {
      id: d.id,
      organizationId: d.organizationId,
      jobId: d.jobId,
      jobNumber: d.jobNumber,
      fileName: d.fileName,
      fileStorageKey: d.fileStorageKey,
      fileSizeBytes: d.fileSizeBytes,
      mimeType: d.mimeType,
      documentType: d.documentType as DocumentType,
      extractionStatus: d.extractionStatus as ExtractionStatus,
      aiModelUsed: d.aiModelUsed || undefined,
      extractedEntities: d.extractedEntities as ExtractedEntity[],
      inconsistencies: d.inconsistencies as InconsistencyFlag[],
      humanReviewerId: d.humanReviewerId || undefined,
      humanReviewerName: d.humanReviewerName || undefined,
      humanApprovedAt: d.humanApprovedAt ? d.humanApprovedAt.toISOString() : undefined,
      uploadedAt: d.uploadedAt.toISOString(),
    };
  }
}

export const packetIntelligenceRepository = new PacketIntelligenceRepository();
