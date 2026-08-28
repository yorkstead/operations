import { describe, expect, it } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("locked architecture and deployment configuration invariants", () => {
  const rootDir = join(import.meta.dir, "../../..");

  it("verifies operations Dockerfile exists and builds standalone Next.js container", () => {
    const dockerfilePath = join(rootDir, "docker/operations.Dockerfile");
    expect(existsSync(dockerfilePath)).toBe(true);

    const content = readFileSync(dockerfilePath, "utf-8");
    expect(content).toContain("ARG BUN_VERSION=1.3.14");
    expect(content).toContain("FROM oven/bun:${BUN_VERSION}-slim");
    expect(content).toContain("apps/operations/.next/standalone");
    expect(content).toContain("HOSTNAME=0.0.0.0");
    expect(content).toContain("PORT=8080");
  });

  it("verifies operations next.config.ts enforces standalone mode unconditionally", () => {
    const nextConfigPath = join(rootDir, "apps/operations/next.config.ts");
    const content = readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain('output: "standalone"');
    expect(content).not.toContain("CF_PAGES");
    expect(content).not.toContain("VERCEL");
  });

  it("verifies website wrangler.jsonc binds strictly to Cloudflare assets and worker", () => {
    const wranglerPath = join(rootDir, "apps/website/wrangler.jsonc");
    expect(existsSync(wranglerPath)).toBe(true);

    const content = readFileSync(wranglerPath, "utf-8");
    expect(content).toContain('"name": "yorkstead-website"');
    expect(content).toContain('"nodejs_compat"');
  });

  it("ensures no obsolete open-next.config.ts exists in apps/website", () => {
    const openNextPath = join(rootDir, "apps/website/open-next.config.ts");
    expect(existsSync(openNextPath)).toBe(false);
  });
});
