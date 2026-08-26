export type FileStatus = "pending_scan" | "clean" | "quarantined" | "deleted";

export interface StoredFile {
  id: string;
  organizationId: string;
  uploadedByUserId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  status: FileStatus;
  quarantineReason?: string;
  createdAt: string;
}

export interface FileStoragePort {
  generatePresignedUploadUrl(
    organizationId: string,
    filename: string,
    mimeType: string,
    sizeBytes: number
  ): Promise<{ uploadUrl: string; storageKey: string; expiresAt: string }>;

  generateExpiringDownloadUrl(
    storageKey: string,
    filename: string,
    expiresInSeconds?: number
  ): Promise<{ downloadUrl: string; expiresAt: string }>;

  deleteFile(storageKey: string): Promise<boolean>;
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/csv",
  "application/json",
  "application/dxf",
  "application/step",
  "text/plain",
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB Max

export class SyntheticFileStorageAdapter implements FileStoragePort {
  private files: Map<string, { buffer: Buffer; mimeType: string }> = new Map();

  async generatePresignedUploadUrl(
    organizationId: string,
    filename: string,
    mimeType: string,
    sizeBytes: number
  ): Promise<{ uploadUrl: string; storageKey: string; expiresAt: string }> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Disallowed file type: ${mimeType}.`);
    }
    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds 25MB limit (Provided: ${(sizeBytes / 1024 / 1024).toFixed(1)}MB).`);
    }

    const storageKey = `tenants/${organizationId}/files/${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    return {
      uploadUrl: `https://storage.synthetic.ops.yorkstead.com/upload?key=${encodeURIComponent(storageKey)}&expires=${encodeURIComponent(expiresAt)}`,
      storageKey,
      expiresAt,
    };
  }

  async generateExpiringDownloadUrl(
    storageKey: string,
    filename: string,
    expiresInSeconds: number = 900
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    return {
      downloadUrl: `https://storage.synthetic.ops.yorkstead.com/download?key=${encodeURIComponent(storageKey)}&filename=${encodeURIComponent(filename)}&sig=${Date.now()}`,
      expiresAt,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    this.files.delete(storageKey);
    return true;
  }
}
