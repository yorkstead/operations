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
    expect(content).toContain('"pattern": "yorkstead.com/*"');
    expect(content).toContain('"pattern": "www.yorkstead.com/*"');
  });

  it("ensures no obsolete open-next.config.ts exists in apps/website", () => {
    const openNextPath = join(rootDir, "apps/website/open-next.config.ts");
    expect(existsSync(openNextPath)).toBe(false);
  });

  it("keeps website staging manual and isolated from the production Worker name", () => {
    const workflowPath = join(rootDir, ".github/workflows/deploy-cloudflare.yml");
    const packagePath = join(rootDir, "apps/website/package.json");
    const stagingConfigScriptPath = join(rootDir, "apps/website/scripts/prepare-staging-wrangler.ts");
    const workflow = readFileSync(workflowPath, "utf-8");
    const websitePackage = readFileSync(packagePath, "utf-8");
    const stagingConfigScript = readFileSync(stagingConfigScriptPath, "utf-8");

    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toContain("workflow_run:");
    expect(workflow).not.toContain("url: https://yorkstead.com");
    expect(workflow).toContain("deploy:cf:staging");
    expect(websitePackage).toContain("prepare:cf:staging");
    expect(websitePackage).toContain("wrangler.staging.json");
    expect(stagingConfigScript).toContain('generatedConfig.name = "yorkstead-website-staging"');
    expect(stagingConfigScript).toContain("delete generatedConfig.triggers");
    expect(stagingConfigScript).toContain("delete generatedConfig.routes");
  });

  it("keeps the Operations production proxy explicit and host-aware", () => {
    const proxyPath = join(rootDir, "infrastructure/cloudflare/operations-proxy.ts");
    const proxyConfigPath = join(rootDir, "infrastructure/cloudflare/wrangler.operations-proxy.jsonc");
    const proxy = readFileSync(proxyPath, "utf-8");
    const proxyConfig = readFileSync(proxyConfigPath, "utf-8");

    expect(proxy).toContain("yorkstead-operations-576569185791.us-central1.run.app");
    expect(proxy).toContain('headers.set("x-forwarded-host", incoming.host)');
    expect(proxy).toContain('headers.set("x-forwarded-proto", "https")');
    expect(proxyConfig).toContain('"name": "yorkstead-operations-proxy"');
  });
});
