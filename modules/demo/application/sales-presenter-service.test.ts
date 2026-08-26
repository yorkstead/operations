import { describe, expect, it } from "bun:test";
import { SalesPresenterService, PRESENTER_PASSCODE } from "./sales-presenter-service";

describe("Sales Presenter Mode & Guided Demo Script Engine", () => {
  it("defines guided presenter scripts for all four core demo scenarios", () => {
    const scenarios = SalesPresenterService.getScenarios();
    expect(scenarios.length).toBe(4);

    const slugs = scenarios.map((s) => s.scenarioSlug);
    expect(slugs).toContain("front-range-manufacturing");
    expect(slugs).toContain("summit-facility-services");
    expect(slugs).toContain("mile-high-signworks");
    expect(slugs).toContain("peak-mobile-detail");
  });

  it("ensures every scenario has at least four sequential steps with complete talk tracks and friction breakdowns", () => {
    const scenarios = SalesPresenterService.getScenarios();

    for (const sc of scenarios) {
      expect(sc.checkpointName.length).toBeGreaterThan(3);
      expect(sc.executiveSummary.length).toBeGreaterThan(20);
      expect(sc.steps.length).toBeGreaterThanOrEqual(4);

      for (const step of sc.steps) {
        expect(step.title.length).toBeGreaterThan(5);
        expect(step.targetRoute.startsWith("/")).toBe(true);
        expect(step.customerFriction.length).toBeGreaterThan(15);
        expect(step.yorksteadSolution.length).toBeGreaterThan(15);
        expect(step.talkTrack.length).toBeGreaterThan(20);
        expect(step.suggestedAction.length).toBeGreaterThan(10);
      }
    }
  });

  it("verifies presenter passcode authentication", () => {
    expect(SalesPresenterService.verifyPasscode(PRESENTER_PASSCODE)).toBe(true);
    expect(SalesPresenterService.verifyPasscode("wrong-passcode")).toBe(false);
    expect(SalesPresenterService.verifyPasscode("")).toBe(false);
  });

  it("resets scenario to its golden checkpoint deterministically", () => {
    const res = SalesPresenterService.resetCheckpoint("front-range-manufacturing");
    expect(res.success).toBe(true);
    expect(res.checkpoint).toBe("Baseline Release 2026-Q1");

    const invalid = SalesPresenterService.resetCheckpoint("unknown-slug");
    expect(invalid.success).toBe(false);
  });
});
