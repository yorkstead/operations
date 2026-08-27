import { logger } from "./logger";
import type { ObjectList, ObjectMetadata, ObjectStorage, ObjectUrlOptions, PutObjectInput, StoredObject } from "../storage/object-storage";

export class ObservedObjectStorage implements ObjectStorage {
  constructor(private readonly storage: ObjectStorage) {}

  private async execute<T>(operation: string, key: string | undefined, action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      logger.error("storage.error", "Object storage operation failed", error, { operation, objectKey: key });
      throw error;
    }
  }

  putObject(input: PutObjectInput): Promise<void> {
    return this.execute("putObject", input.key, () => this.storage.putObject(input));
  }

  getObject(key: string): Promise<StoredObject | null> {
    return this.execute("getObject", key, () => this.storage.getObject(key));
  }

  deleteObject(key: string): Promise<boolean> {
    return this.execute("deleteObject", key, () => this.storage.deleteObject(key));
  }

  getObjectUrl(key: string, options: ObjectUrlOptions): Promise<{ url: string; expiresAt: string }> {
    return this.execute("getObjectUrl", key, () => this.storage.getObjectUrl(key, options));
  }

  objectExists(key: string): Promise<boolean> {
    return this.execute("objectExists", key, () => this.storage.objectExists(key));
  }

  getObjectMetadata(key: string): Promise<ObjectMetadata | null> {
    return this.execute("getObjectMetadata", key, () => this.storage.getObjectMetadata(key));
  }

  listObjects(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<ObjectList> {
    return this.execute("listObjects", options?.prefix, () => this.storage.listObjects(options));
  }
}
