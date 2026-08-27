import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { buildYorksteadObjectKey, getObjectStorage } from "../lib/infrastructure/storage";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../modules/core/domain/ports/file-storage-port";

const entrySchema = z.object({
  sourceUrl: z.string().url().refine((url) => new URL(url).protocol === "https:", "sourceUrl must use HTTPS"),
  organizationId: z.string().min(1),
  resourceType: z.string().min(1).optional(),
  resourceId: z.string().min(1).optional(),
  objectId: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().refine((value) => ALLOWED_MIME_TYPES.includes(value), "mimeType is not allowed"),
  expectedSizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
  expectedChecksumSha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
});

const manifestSchema = z.object({ version: z.literal(1), objects: z.array(entrySchema) });
type ManifestEntry = z.infer<typeof entrySchema>;

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function targetKey(entry: ManifestEntry): string {
  return buildYorksteadObjectKey({
    kind: "uploads",
    organizationId: entry.organizationId,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    objectId: entry.objectId,
    filename: entry.filename,
  });
}

async function main() {
  const manifestPath = option("--manifest");
  const execute = process.argv.includes("--execute");
  const reportPath = option("--report");
  if (!manifestPath) throw new Error("Usage: bun storage:migrate --manifest <path> [--execute --report <path>]");
  if (execute && !reportPath) throw new Error("--report is required with --execute so the copy result can be reconciled safely.");

  const manifest = manifestSchema.parse(JSON.parse(await readFile(resolve(manifestPath), "utf8")));
  const destinations = manifest.objects.map(targetKey);
  if (new Set(destinations).size !== destinations.length) throw new Error("Manifest contains duplicate destination object keys.");

  if (!execute) {
    console.log(JSON.stringify({ mode: "dry-run", count: manifest.objects.length, objects: manifest.objects.map((entry) => ({ sourceUrl: entry.sourceUrl, targetKey: targetKey(entry) })) }, null, 2));
    return;
  }

  const storage = getObjectStorage();
  const authorization = process.env.SOURCE_STORAGE_BEARER_TOKEN;
  const results: Array<Record<string, unknown>> = [];

  for (const entry of manifest.objects) {
    const key = targetKey(entry);
    const existing = await storage.getObjectMetadata(key);
    if (existing) {
      if (existing.contentLength !== entry.expectedSizeBytes) throw new Error(`Destination exists with a different size: ${key}`);
      results.push({ sourceUrl: entry.sourceUrl, targetKey: key, status: "already-present", sizeBytes: existing.contentLength });
      continue;
    }

    const response = await fetch(entry.sourceUrl, {
      headers: authorization ? { Authorization: `Bearer ${authorization}` } : undefined,
      redirect: "error",
    });
    if (!response.ok) throw new Error(`Source download failed (${response.status}) for ${entry.sourceUrl}`);
    const body = new Uint8Array(await response.arrayBuffer());
    if (body.byteLength !== entry.expectedSizeBytes) throw new Error(`Source size mismatch for ${entry.sourceUrl}`);
    const checksum = createHash("sha256").update(body).digest("hex");
    if (entry.expectedChecksumSha256 && checksum !== entry.expectedChecksumSha256.toLowerCase()) {
      throw new Error(`Source checksum mismatch for ${entry.sourceUrl}`);
    }

    await storage.putObject({
      key,
      body,
      contentType: entry.mimeType,
      contentLength: body.byteLength,
      metadata: {
        "source-checksum-sha256": checksum,
        "migration-source": "legacy-object-storage",
      },
    });
    const copied = await storage.getObjectMetadata(key);
    if (!copied || copied.contentLength !== body.byteLength) throw new Error(`Destination verification failed for ${key}`);
    results.push({ sourceUrl: entry.sourceUrl, targetKey: key, status: "copied", sizeBytes: body.byteLength, checksumSha256: checksum });
  }

  await writeFile(resolve(reportPath!), `${JSON.stringify({ version: 1, completedAt: new Date().toISOString(), objects: results }, null, 2)}\n`, { flag: "wx" });
  console.log(`Copied or verified ${results.length} objects. Source objects were not changed. Report: ${resolve(reportPath!)}`);
}

await main();
