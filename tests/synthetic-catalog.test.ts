import { describe, expect, it } from "bun:test";
import { standardLibraryTemplates } from "../modules/implementation-library/application/library-service";
import { availableModules } from "../modules/sales-tools/application/system-configurator-service";
import { syntheticFrontRangeBriefing } from "../modules/audit/application/audit-deliverable-service";

describe("Synthetic Sales & Implementation Catalog Suite", () => {
  it("verifies synthetic audit deliverable fixture structure", () => {
    expect(syntheticFrontRangeBriefing.clientName).toBe("Front Range Precision Manufacturing");
    expect(syntheticFrontRangeBriefing.currentStateMap.length).toBeGreaterThanOrEqual(4);
    expect(syntheticFrontRangeBriefing.implementationMilestones.length).toBeGreaterThanOrEqual(2);
  });

  it("verifies configurator module catalog and price bounds", () => {
    expect(availableModules.length).toBe(8);
    for (const mod of availableModules) {
      expect(Number.isInteger(mod.basePriceMinCents)).toBe(true);
      expect(Number.isInteger(mod.basePriceMaxCents)).toBe(true);
      expect(mod.basePriceMaxCents).toBeGreaterThan(mod.basePriceMinCents);
    }
  });

  it("verifies implementation library templates are sanitized", () => {
    expect(standardLibraryTemplates.length).toBe(8);
    for (const tmpl of standardLibraryTemplates) {
      expect(tmpl.provenance.length).toBeGreaterThan(10);
      expect(tmpl.reviewedBy.length).toBeGreaterThan(5);
      expect(tmpl.contentMarkdown.includes("password")).toBe(false);
      expect(tmpl.contentMarkdown.includes("secret")).toBe(false);
    }
  });
});
