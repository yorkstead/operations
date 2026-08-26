import {
  FileStoragePort,
  StoredFile,
  SyntheticFileStorageAdapter,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../domain/ports/file-storage-port";
import { SessionContext } from "../domain/types";
import { authorizationService } from "./authorization-service";

export class FileService {
  private fileRecords: Map<string, StoredFile> = new Map();
  public storageAdapter: FileStoragePort;

  constructor(storageAdapter?: FileStoragePort) {
    this.storageAdapter = storageAdapter || new SyntheticFileStorageAdapter();
  }

  async prepareUpload(
    session: SessionContext,
    params: { filename: string; mimeType: string; sizeBytes: number }
  ): Promise<{ fileRecord: StoredFile; uploadUrl: string; expiresAt: string }> {
    if (!session || session.user.status !== "active") {
      throw new Error("Unauthorized: Active user session required.");
    }

    if (!ALLOWED_MIME_TYPES.includes(params.mimeType)) {
      throw new Error(`Invalid file type: ${params.mimeType}`);
    }

    if (params.sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size ${(params.sizeBytes / 1024 / 1024).toFixed(1)}MB exceeds 25MB limit.`);
    }

    const { uploadUrl, storageKey, expiresAt } = await this.storageAdapter.generatePresignedUploadUrl(
      session.activeOrganization.id,
      params.filename,
      params.mimeType,
      params.sizeBytes
    );

    const fileId = `fil_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fileRecord: StoredFile = {
      id: fileId,
      organizationId: session.activeOrganization.id,
      uploadedByUserId: session.user.id,
      filename: params.filename,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
      storageKey,
      status: "clean",
      createdAt: new Date().toISOString(),
    };

    this.fileRecords.set(fileId, fileRecord);
    return { fileRecord, uploadUrl, expiresAt };
  }

  async getAuthorizedDownloadUrl(
    session: SessionContext,
    fileId: string
  ): Promise<{ downloadUrl: string; expiresAt: string; filename: string }> {
    const record = this.fileRecords.get(fileId);
    if (!record) {
      throw new Error(`File ${fileId} not found.`);
    }

    // Strict Tenant Boundary Assertion
    if (session.activeOrganization.id !== record.organizationId) {
      throw new Error("Cross-Tenant File Access Forbidden.");
    }

    if (record.status === "quarantined") {
      throw new Error(`File access blocked: Quarantined (${record.quarantineReason || "Security Policy"}).`);
    }

    const { downloadUrl, expiresAt } = await this.storageAdapter.generateExpiringDownloadUrl(
      record.storageKey,
      record.filename,
      900 // 15 minutes TTL
    );

    return { downloadUrl, expiresAt, filename: record.filename };
  }

  listFiles(session: SessionContext): StoredFile[] {
    return Array.from(this.fileRecords.values()).filter(
      (f) => f.organizationId === session.activeOrganization.id && f.status !== "deleted"
    );
  }

  quarantineFile(session: SessionContext, fileId: string, reason: string): StoredFile {
    authorizationService.requireCapability(session, "org:manage_profile");

    const record = this.fileRecords.get(fileId);
    if (!record) throw new Error("File not found.");

    if (record.organizationId !== session.activeOrganization.id) {
      throw new Error("Cross-tenant mutation denied.");
    }

    record.status = "quarantined";
    record.quarantineReason = reason;
    this.fileRecords.set(fileId, record);
    return record;
  }
}

export const fileService = new FileService();
