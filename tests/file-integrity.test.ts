import { describe, expect, test } from "bun:test";
import { sha256Hex } from "@/lib/infrastructure/storage/file-integrity";

describe("uploaded object integrity", () => {
  test("computes a deterministic SHA-256 while enforcing the byte limit", async () => {
    const body = new Blob(["Yorkstead upload"]).stream();
    const result = await sha256Hex(body, 1024);
    expect(result.sizeBytes).toBe(16);
    expect(result.checksumSha256).toBe("eb97ec91f6f583f7117ce3e02e91eb2d60265799228cf36ec303648ead01e819");
  });

  test("rejects a stream that exceeds its authorized size", async () => {
    await expect(sha256Hex(new Blob(["oversized"]).stream(), 4)).rejects.toThrow("exceeds the permitted size");
  });
});
