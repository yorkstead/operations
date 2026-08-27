import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  ObjectList,
  ObjectMetadata,
  ObjectStorage,
  ObjectUrlOptions,
  PutObjectInput,
  StoredObject,
} from "./object-storage";

export interface S3ObjectStorageConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
}

function isNotFound(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return candidate.name === "NotFound" || candidate.name === "NoSuchKey" || candidate.$metadata?.httpStatusCode === 404;
}

function expiry(seconds = 900) {
  return {
    seconds,
    expiresAt: new Date(Date.now() + seconds * 1000).toISOString(),
  };
}

export class S3ObjectStorage implements ObjectStorage {
  private readonly client: S3Client;

  constructor(private readonly config: S3ObjectStorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle ?? false,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async putObject(input: PutObjectInput): Promise<void> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
      ChecksumSHA256: input.checksumSha256,
      Metadata: input.metadata,
    }));
  }

  async getObject(key: string): Promise<StoredObject | null> {
    try {
      const response = await this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: key }));
      if (!response.Body) return null;
      return {
        key,
        body: response.Body.transformToWebStream() as ReadableStream<Uint8Array>,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        checksumSha256: response.ChecksumSHA256,
        etag: response.ETag,
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async deleteObject(key: string): Promise<boolean> {
    const existed = await this.objectExists(key);
    if (!existed) return false;
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
    return true;
  }

  async getObjectUrl(key: string, options: ObjectUrlOptions): Promise<{ url: string; expiresAt: string }> {
    const { seconds, expiresAt } = expiry(options.expiresInSeconds);
    const command = options.operation === "write"
      ? new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          ContentType: options.contentType,
          ContentLength: options.contentLength,
          ChecksumSHA256: options.checksumSha256,
        })
      : new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          ResponseContentDisposition: options.downloadFilename
            ? `attachment; filename="${options.downloadFilename.replace(/["\r\n]/g, "_")}"`
            : undefined,
        });
    return { url: await getSignedUrl(this.client, command, { expiresIn: seconds }), expiresAt };
  }

  async objectExists(key: string): Promise<boolean> {
    return (await this.getObjectMetadata(key)) !== null;
  }

  async getObjectMetadata(key: string): Promise<ObjectMetadata | null> {
    try {
      const response = await this.client.send(new HeadObjectCommand({ Bucket: this.config.bucket, Key: key }));
      return {
        key,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        checksumSha256: response.ChecksumSHA256,
        etag: response.ETag,
        metadata: response.Metadata ?? {},
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async listObjects(options: { prefix?: string; limit?: number; cursor?: string } = {}): Promise<ObjectList> {
    const response = await this.client.send(new ListObjectsV2Command({
      Bucket: this.config.bucket,
      Prefix: options.prefix,
      MaxKeys: Math.min(Math.max(options.limit ?? 100, 1), 1000),
      ContinuationToken: options.cursor,
    }));
    return {
      objects: (response.Contents ?? []).flatMap((object) => object.Key ? [{
        key: object.Key,
        size: object.Size,
        etag: object.ETag,
        lastModified: object.LastModified,
      }] : []),
      cursor: response.NextContinuationToken,
    };
  }
}

