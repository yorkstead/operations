export type DocumentType =
  | "engineering_drawing"
  | "purchase_order"
  | "specification_sheet"
  | "material_cert"
  | "inspection_report"
  | "cad_archive";

export type ExtractionStatus =
  | "pending"
  | "extracting"
  | "extracted"
  | "approved"
  | "rejected"
  | "flagged_inconsistency";

export interface ExtractedEntity {
  key: string;
  label: string;
  rawValue: string;
  normalizedValue: string | number;
  confidenceScore: number; // 0.0 - 1.0
  approved: boolean;
}

export interface InconsistencyFlag {
  field: string;
  severity: "warning" | "critical_mismatch";
  message: string;
  expectedValue: string | number;
  detectedValue: string | number;
}

export interface JobPacketDocument {
  id: string;
  organizationId: string;
  jobId: string;
  jobNumber: string;
  fileName: string;
  fileStorageKey: string;
  fileSizeBytes: number;
  mimeType: string;
  documentType: DocumentType;
  extractionStatus: ExtractionStatus;
  aiModelUsed?: string;
  extractedEntities: ExtractedEntity[];
  inconsistencies: InconsistencyFlag[];
  humanReviewerId?: string;
  humanReviewerName?: string;
  humanApprovedAt?: string;
  uploadedAt: string;
}

export interface DepartmentPacket {
  department: "shopfloor" | "quality" | "purchasing" | "shipping";
  jobId: string;
  jobNumber: string;
  documentCount: number;
  documents: JobPacketDocument[];
  checklist: string[];
}
