export type ObjectBody = string | Uint8Array | Buffer | ReadableStream<Uint8Array>;

export interface PutObjectInput {
  key: string;
  body: ObjectBody;
  contentType: string;
  contentLength?: number;
  checksumSha256?: string;
  metadata?: Record<string, string>;
}

export interface StoredObject {
  key: string;
  body: ReadableStream<Uint8Array>;
  contentType?: string;
  contentLength?: number;
  checksumSha256?: string;
  etag?: string;
}

export interface ObjectMetadata {
  key: string;
  contentType?: string;
  contentLength?: number;
  checksumSha256?: string;
  etag?: string;
  metadata: Record<string, string>;
}

export interface ObjectList {
  objects: Array<{ key: string; size?: number; etag?: string; lastModified?: Date }>;
  cursor?: string;
}

export interface ObjectUrlOptions {
  operation: "read" | "write";
  expiresInSeconds?: number;
  contentType?: string;
  contentLength?: number;
  checksumSha256?: string;
  downloadFilename?: string;
}

export interface ObjectStorage {
  putObject(input: PutObjectInput): Promise<void>;
  getObject(key: string): Promise<StoredObject | null>;
  deleteObject(key: string): Promise<boolean>;
  getObjectUrl(key: string, options: ObjectUrlOptions): Promise<{ url: string; expiresAt: string }>;
  objectExists(key: string): Promise<boolean>;
  getObjectMetadata(key: string): Promise<ObjectMetadata | null>;
  listObjects(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<ObjectList>;
}

