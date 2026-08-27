import { serverEnv } from "../env/server";
import type { ObjectStorage } from "./object-storage";
import { S3ObjectStorage } from "./s3-object-storage";
import { ObservedObjectStorage } from "../observability/observed-object-storage";

export * from "./object-storage";
export * from "./object-key";
export * from "./s3-object-storage";

let storage: ObjectStorage | undefined;

export function isObjectStorageConfigured() {
  return Boolean(serverEnv.S3_ENDPOINT);
}

export function getObjectStorage(): ObjectStorage {
  if (!isObjectStorageConfigured()) {
    throw new Error("Private object storage is not configured. Set the complete S3_* environment group.");
  }
  storage ??= new ObservedObjectStorage(new S3ObjectStorage({
    endpoint: serverEnv.S3_ENDPOINT!,
    region: serverEnv.S3_REGION,
    bucket: serverEnv.S3_BUCKET!,
    accessKeyId: serverEnv.S3_ACCESS_KEY_ID!,
    secretAccessKey: serverEnv.S3_SECRET_ACCESS_KEY!,
  }));
  return storage;
}

export function setObjectStorageForTests(value: ObjectStorage | undefined) {
  storage = value;
}
