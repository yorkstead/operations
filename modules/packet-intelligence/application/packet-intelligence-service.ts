import {
  JobPacketDocument,
  DepartmentPacket,
  DocumentType,
  ExtractedEntity,
  InconsistencyFlag,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";
import { notificationService } from "../../core/application/notification-service";

export class PacketIntelligenceService {
  private documents: Map<string, JobPacketDocument> = new Map();

  constructor() {
    this.seedDefaultPacket("org_default");
  }

  private seedDefaultPacket(orgId: string) {
    const defaultDoc: JobPacketDocument = {
      id: "doc_104_dwg",
      organizationId: orgId,
      jobId: "job_104",
      jobNumber: "JOB-2026-104",
      fileName: "DWG-2026-104-REV-B.pdf",
      fileStorageKey: "vault/org_default/job_104/DWG-2026-104-REV-B.pdf",
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
      uploadedAt: new Date().toISOString(),
    };

    this.documents.set(defaultDoc.id, defaultDoc);
  }

  listDocuments(session: SessionContext, options?: { jobId?: string }): JobPacketDocument[] {
    const orgId = session.activeOrganization.id;
    const docs = Array.from(this.documents.values()).filter((d) => d.organizationId === orgId);
    if (options?.jobId) {
      return docs.filter((d) => d.jobId === options.jobId);
    }
    return docs;
  }

  getDocument(session: SessionContext, id: string): JobPacketDocument {
    const orgId = session.activeOrganization.id;
    const doc = this.documents.get(id);
    if (!doc || doc.organizationId !== orgId) {
      throw new Error(`Job packet document '${id}' not found.`);
    }
    return doc;
  }

  // 1. Ingest Document
  ingestDocument(
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
  ): JobPacketDocument {
    authorizationService.requireCapability(session, "files:upload");

    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const docType = params.documentType || "engineering_drawing";
    const storageKey = params.fileStorageKey || `vault/${session.activeOrganization.id}/${params.jobId}/${params.fileName}`;

    const doc: JobPacketDocument = {
      id,
      organizationId: session.activeOrganization.id,
      jobId: params.jobId,
      jobNumber: params.jobNumber,
      fileName: params.fileName.trim(),
      fileStorageKey: storageKey,
      fileSizeBytes: params.fileSizeBytes,
      mimeType: params.mimeType,
      documentType: docType,
      extractionStatus: "pending",
      extractedEntities: [],
      inconsistencies: [],
      uploadedAt: now,
    };

    this.documents.set(id, doc);

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: params.jobId,
      action: "packet.document_uploaded",
      summary: `Uploaded ${params.fileName} (${params.documentType}) to packet for job ${params.jobNumber}.`,
    });

    return doc;
  }

  // 2. Run Untrusted AI Extraction with Inconsistency Guardrails
  extractPacketData(
    session: SessionContext,
    documentId: string,
    expectedMetadata?: { expectedRevision?: string; expectedQuantity?: number; expectedMaterial?: string }
  ): JobPacketDocument {
    const doc = this.documents.get(documentId);
    if (!doc || doc.organizationId !== session.activeOrganization.id) {
      throw new Error("Job packet document not found.");
    }

    doc.extractionStatus = "extracting";
    doc.aiModelUsed = "synthetic-packet-parser-v2.1";

    // Synthetic OCR entity extraction
    const extracted: ExtractedEntity[] = [
      { key: "part_number", label: "Part Number", rawValue: doc.fileName.replace(".pdf", ""), normalizedValue: doc.fileName.replace(".pdf", ""), confidenceScore: 0.97, approved: false },
      { key: "revision", label: "Drawing Revision", rawValue: "REV B", normalizedValue: "B", confidenceScore: 0.95, approved: false },
      { key: "material", label: "Material Spec", rawValue: "6061-T6 Aluminum 0.25in", normalizedValue: "ALUM-6061-0.25", confidenceScore: 0.92, approved: false },
      { key: "quantity", label: "Drawing Batch Qty", rawValue: "100 pcs", normalizedValue: 100, confidenceScore: 0.98, approved: false },
    ];

    const inconsistencies: InconsistencyFlag[] = [];

    // Verify against known expected metadata (never silently mutating job truth)
    if (expectedMetadata) {
      if (expectedMetadata.expectedRevision && expectedMetadata.expectedRevision !== "B") {
        inconsistencies.push({
          field: "revision",
          severity: "critical_mismatch",
          message: `Drawing indicates Rev B, but job order is locked to Rev ${expectedMetadata.expectedRevision}.`,
          expectedValue: expectedMetadata.expectedRevision,
          detectedValue: "B",
        });
      }
      if (expectedMetadata.expectedQuantity && expectedMetadata.expectedQuantity !== 100) {
        inconsistencies.push({
          field: "quantity",
          severity: "warning",
          message: `Drawing note specifies 100 pcs, but traveler total is ${expectedMetadata.expectedQuantity} pcs.`,
          expectedValue: expectedMetadata.expectedQuantity,
          detectedValue: 100,
        });
      }
    }

    doc.extractedEntities = extracted;
    doc.inconsistencies = inconsistencies;
    doc.extractionStatus = inconsistencies.length > 0 ? "flagged_inconsistency" : "extracted";

    if (inconsistencies.length > 0) {
      notificationService.dispatchNotification({
        organizationId: session.activeOrganization.id,
        recipientUserId: session.user.id,
        title: `Packet Inconsistency on ${doc.jobNumber}`,
        message: `Document ${doc.fileName} flagged with ${inconsistencies.length} metadata discrepancy.`,
        link: `/job-packets?jobId=${doc.jobId}`,
      });
    }

    this.documents.set(documentId, doc);
    return doc;
  }

  // 3. Human Approval of Extracted Truth
  approveExtraction(
    session: SessionContext,
    documentId: string,
    overrides?: Record<string, string | number>
  ): JobPacketDocument {
    authorizationService.requireCapability(session, "jobs:update_status");

    const doc = this.documents.get(documentId);
    if (!doc || doc.organizationId !== session.activeOrganization.id) {
      throw new Error("Document not found.");
    }

    const now = new Date().toISOString();
    doc.extractedEntities.forEach((entity) => {
      if (overrides && overrides[entity.key] !== undefined) {
        entity.normalizedValue = overrides[entity.key];
        entity.rawValue = `${overrides[entity.key]} (Manual Override)`;
      }
      entity.approved = true;
    });

    doc.inconsistencies = [];
    doc.extractionStatus = "approved";
    doc.humanReviewerId = session.user.id;
    doc.humanReviewerName = session.user.name;
    doc.humanApprovedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "job",
      entityId: doc.jobId,
      action: "packet.extraction_approved",
      summary: `Human engineer ${session.user.name} approved extracted truth for ${doc.fileName}.`,
    });

    this.documents.set(documentId, doc);
    return doc;
  }

  // 4. Assemble Department Specific Packets
  assembleDepartmentPacket(
    session: SessionContext,
    jobId: string,
    department: "shopfloor" | "quality" | "purchasing" | "shipping"
  ): DepartmentPacket {
    const jobDocs = Array.from(this.documents.values()).filter(
      (d) => d.organizationId === session.activeOrganization.id && d.jobId === jobId
    );

    const checklistMap: Record<typeof department, string[]> = {
      shopfloor: ["Approved Engineering Drawing (Rev Checked)", "Setup Sheet & Tooling List", "Digital Traveler Sequence"],
      quality: ["First Article Inspection (FAI) Form", "Critical Tolerance Matrix", "Material Test Report (MTR)"],
      purchasing: ["Raw Material Spec Sheet", "Vendor Quote & PO", "Certificate of Conformance (CoC)"],
      shipping: ["Customer Packing Slip", "Shipping Label & Box Count", "Final Inspection Signoff Stamp"],
    };

    return {
      department,
      jobId,
      jobNumber: jobDocs[0]?.jobNumber || "JOB-UNKNOWN",
      documentCount: jobDocs.length,
      documents: jobDocs,
      checklist: checklistMap[department],
    };
  }
}

export const packetIntelligenceService = new PacketIntelligenceService();
