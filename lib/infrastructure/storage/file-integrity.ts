import { createHash } from "node:crypto";

export async function sha256Hex(
  body: ReadableStream<Uint8Array>,
  maximumBytes: number,
): Promise<{ checksumSha256: string; sizeBytes: number }> {
  const reader = body.getReader();
  const hash = createHash("sha256");
  let sizeBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sizeBytes += value.byteLength;
      if (sizeBytes > maximumBytes) throw new Error("Uploaded object exceeds the permitted size.");
      hash.update(value);
    }
  } finally {
    reader.releaseLock();
  }

  return { checksumSha256: hash.digest("hex"), sizeBytes };
}
