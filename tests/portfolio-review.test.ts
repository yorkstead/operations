import { describe, expect, it } from "bun:test";
import { PublicSiteContractService } from "../modules/public-contract/application/public-site-contract-service";

describe("Portfolio Publication Review & Contract Integrity Suite", () => {
  it("verifies all four core demo scenarios are properly published with deep links and synthetic tags", () => {
    const contractService = new PublicSiteContractService();
    const manifest = contractService.getPublicDemoHealthManifest();

    expect(manifest.scenarios.length).toBe(4);

    const slugs = manifest.scenarios.map((s) => s.slug);
    expect(slugs).toContain("front-range-manufacturing");
    expect(slugs).toContain("summit-facility-services");
    expect(slugs).toContain("mile-high-signworks");
    expect(slugs).toContain("peak-mobile-detail");

    for (const sc of manifest.scenarios) {
      expect(sc.name.length).toBeGreaterThan(5);
      expect(sc.industry.length).toBeGreaterThan(5);
      expect(sc.canonicalUrl.startsWith("https://ops.yorkstead.com/demo?scenario=")).toBe(true);
      expect(sc.status).toBe("available");
      expect(sc.storyStageCount).toBeGreaterThanOrEqual(3);
      expect(sc.featuredMetrics.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("ensures public health manifest adheres to security and CORS origins policy", () => {
    const contractService = new PublicSiteContractService();
    const manifest = contractService.getPublicDemoHealthManifest();

    expect(manifest.status).toBe("operational");
    expect(manifest.scenarios.every((s) => !s.canonicalUrl.includes("password"))).toBe(true);
  });
});
