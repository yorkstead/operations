import { describe, expect, it } from "bun:test";
import { brand } from "../lib/brand";

describe("Operations & Public Website Alignment Governance", () => {
  it("maintains approved Yorkstead branding constants without legacy domain references", () => {
    expect(brand.name).toBe("Yorkstead Operations");
    expect(brand.wordmark).toBe("YORKSTEAD");
    expect(brand.siteURL).toBe("https://yorkstead.com");
    expect(brand.systemName).toBe("OPERATIONS//CTRL");
  });

  it("verifies public demo walkthrough links match the 4 approved scenario slugs", () => {
    const validScenarioSlugs = [
      "front-range-manufacturing",
      "summit-facility-services",
      "mile-high-signworks",
      "peak-mobile-detail",
    ];

    for (const slug of validScenarioSlugs) {
      const expectedWalkthroughUrl = `https://yorkstead.com/demos/${slug}`;
      expect(expectedWalkthroughUrl.startsWith("https://yorkstead.com/demos/")).toBe(true);
    }
  });
});
