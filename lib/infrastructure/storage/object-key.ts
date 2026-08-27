export type ObjectKind = "uploads" | "generated" | "archive";

export interface YorksteadObjectKeyInput {
  kind: ObjectKind;
  organizationId: string;
  resourceType?: string;
  resourceId?: string;
  objectId: string;
  filename: string;
}

function safeSegment(value: string, fallback: string): string {
  const normalized = value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 120);
  return normalized || fallback;
}

export function safeObjectFilename(filename: string): string {
  const leaf = filename.replace(/\\/g, "/").split("/").pop() ?? "file";
  const extensionIndex = leaf.lastIndexOf(".");
  const rawStem = extensionIndex > 0 ? leaf.slice(0, extensionIndex) : leaf;
  const rawExtension = extensionIndex > 0 ? leaf.slice(extensionIndex + 1) : "";
  const stem = safeSegment(rawStem, "file").slice(0, 100);
  const extension = safeSegment(rawExtension, "").slice(0, 16);
  return extension ? `${stem}.${extension}` : stem;
}

export function buildYorksteadObjectKey(input: YorksteadObjectKeyInput): string {
  const resourceType = safeSegment(input.resourceType ?? "files", "files");
  const resourceId = safeSegment(input.resourceId ?? "unassigned", "unassigned");
  return [
    input.kind,
    "organizations",
    safeSegment(input.organizationId, "unknown"),
    resourceType,
    resourceId,
    safeSegment(input.objectId, "object"),
    safeObjectFilename(input.filename),
  ].join("/");
}
