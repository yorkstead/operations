import { describe, expect, it, beforeEach } from "bun:test";
import { PublicSiteContractService } from "../modules/public-contract/application/public-site-contract-service";

describe("Public Site Integration Contract Module", () => {
  let contractService: PublicSiteContractService;

  beforeEach(() => {
    contractService = new PublicSiteContractService();
  });

  it("generates unauthenticated public demo health manifest with all 4 canonical scenarios", () => {
    const manifest = contractService.getPublicDemoHealthManifest();

    expect(manifest.status).toBe("operational");
    expect(manifest.appBaseUrl).toBe("https://ops.yorkstead.com");
    expect(manifest.publicSiteUrl).toBe("https://yorkstead.com");
    expect(manifest.scenarios.length).toBe(4);

    const slugs = manifest.scenarios.map((s) => s.slug);
    expect(slugs).toContain("front-range-manufacturing");
    expect(slugs).toContain("summit-facility-services");
    expect(slugs).toContain("mile-high-signworks");
    expect(slugs).toContain("peak-mobile-detail");

    // Verify zero credential / internal session leakage
    expect(JSON.stringify(manifest)).not.toContain("password");
    expect(JSON.stringify(manifest)).not.toContain("token");
    expect(JSON.stringify(manifest)).not.toContain("secret");
  });

  it("validates and normalizes public deep link targets against allowed origins", () => {
    const valid = contractService.validatePublicDeepLink("https://ops.yorkstead.com/demo?scenario=front-range-manufacturing");
    expect(valid.isValid).toBe(true);
    expect(valid.normalizedUrl).toContain("front-range-manufacturing");

    const invalid = contractService.validatePublicDeepLink("https://malicious-site.com/phish");
    expect(invalid.isValid).toBe(false);
    expect(invalid.normalizedUrl).toBe("https://ops.yorkstead.com/demo");
  });

  it("provides comprehensive static fallback data when sandbox environments are offline", () => {
    const fallback = contractService.getStaticFallbackData("front-range-manufacturing");

    expect(fallback.name).toBe("Front Range Precision Manufacturing");
    expect(fallback.measuredImpact.length).toBeGreaterThanOrEqual(3);
    expect(fallback.workflowStages.length).toBe(4);
    expect(fallback.screenshotUrls.length).toBeGreaterThan(0);
  });
});
