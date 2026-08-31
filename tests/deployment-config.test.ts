import { describe, expect, it } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("locked architecture and deployment configuration invariants", () => {
  const rootDir = join(import.meta.dir, "..");

  it("verifies package.json contains correct package name and scripts", () => {
    const packageJsonPath = join(rootDir, "package.json");
    expect(existsSync(packageJsonPath)).toBe(true);

    const content = readFileSync(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content);
    expect(pkg.name).toBe("@yorkstead/operations");
    expect(pkg.scripts.build).toBe("next build");
    expect(pkg.scripts.test).toBe("bun test");
  });

  it("verifies operations next.config.ts supports Vercel adapter packaging and local standalone builds", () => {
    const nextConfigPath = join(rootDir, "next.config.ts");
    expect(existsSync(nextConfigPath)).toBe(true);

    const content = readFileSync(nextConfigPath, "utf-8");
    expect(content).toContain('process.env.VERCEL === "1" ? undefined : "standalone"');
    expect(content).toContain("outputFileTracingRoot: repositoryRoot");
    expect(content).toContain("applicationSecurityHeaders");
  });

  it("verifies vercel.json configures frozen Bun installation", () => {
    const vercelConfigPath = join(rootDir, "vercel.json");
    expect(existsSync(vercelConfigPath)).toBe(true);

    const content = readFileSync(vercelConfigPath, "utf-8");
    const vercelConfig = JSON.parse(content);
    expect(vercelConfig.framework).toBe("nextjs");
    expect(vercelConfig.installCommand).toBe("bun install --frozen-lockfile");
  });

  it("verifies Vercel deployment packaging decision ADR exists", () => {
    const adrPath = join(rootDir, "docs/decisions/2026-08-30-vercel-adapter-packaging.md");
    expect(existsSync(adrPath)).toBe(true);

    const content = readFileSync(adrPath, "utf-8");
    expect(content).toContain("Vercel packaging for the standalone Operations repository");
    expect(content).toContain("Accepted");
  });

  it("keeps the Operations proxy explicit and origin-aware", () => {
    const proxyPath = join(rootDir, "proxy.ts");
    expect(existsSync(proxyPath)).toBe(true);

    const proxy = readFileSync(proxyPath, "utf-8");
    expect(proxy).toContain("trustedOrigins");
    expect(proxy).toContain("hasAllowlistedDemoSession");
    expect(proxy).toContain("isPublicOperationsPage");
  });

  it("uses the canonical Yorkstead mark for installed-app and splash surfaces", () => {
    const icon = readFileSync(join(rootDir, "app/icon.tsx"), "utf-8");
    const manifest = readFileSync(join(rootDir, "app/manifest.ts"), "utf-8");

    expect(icon).toContain("export function YorksteadIcon");
    expect(icon).toContain('stroke="#38bdf8"');
    expect(manifest).toContain("yorkstead-y-20260828");
    expect(manifest).toContain('purpose: "maskable"');
    expect(manifest).toContain('background_color: "#0d1117"');
  });
});

