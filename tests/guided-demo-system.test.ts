import { describe, it, expect } from "bun:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getAllModuleGuidance,
  getModuleGuidance,
} from "../lib/guidance/registry";
import {
  isValidCanonicalScenario,
  isValidPublicSiteLink,
  isValidOperationsPath,
  CANONICAL_DEMO_SCENARIO_SLUGS,
} from "../lib/guidance/types";
import { ModuleGuidanceCard } from "../components/guidance/module-guidance-card";

describe("Guided-Demo Explanation System & Content Model", () => {
  describe("1. Central Guidance Registry & Content Validation", () => {
    it("registers authoritative guidance for core operational modules", () => {
      const guidanceList = getAllModuleGuidance();
      expect(guidanceList.length).toBeGreaterThanOrEqual(2);

      const codes = guidanceList.map((g) => g.moduleCode);
      expect(codes).toContain("maintenance");
      expect(codes).toContain("packaging");
    });

    it("verifies every registered module contains complete required explanatory sections", () => {
      const allGuidance = getAllModuleGuidance();

      for (const item of allGuidance) {
        expect(item.moduleCode.length).toBeGreaterThan(0);
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.badge.length).toBeGreaterThan(0);
        expect(item.kicker.length).toBeGreaterThan(0);
        expect(item.whatItDoes.length).toBeGreaterThan(20);
        expect(item.problemReplaced.length).toBeGreaterThan(20);
        expect(item.whatYouAreLookingAt.length).toBeGreaterThan(20);

        // Workflow walkthrough sequence validation
        expect(item.workflowWalkthrough.length).toBeGreaterThanOrEqual(3);
        item.workflowWalkthrough.forEach((step, idx) => {
          expect(step.stepNumber).toBe(idx + 1);
          expect(step.title.length).toBeGreaterThan(0);
          expect(step.description.length).toBeGreaterThan(0);
          expect(step.keyAction).toBeDefined();
        });

        // Suggested actions validation
        expect(item.suggestedActions.length).toBeGreaterThanOrEqual(2);
        item.suggestedActions.forEach((action) => {
          expect(action.title.length).toBeGreaterThan(0);
          expect(action.action.length).toBeGreaterThan(0);
          expect(action.expectedResult.length).toBeGreaterThan(0);
        });

        // Business outcomes validation
        expect(item.businessOutcomes.length).toBeGreaterThanOrEqual(2);
        item.businessOutcomes.forEach((outcome) => {
          expect(outcome.title.length).toBeGreaterThan(0);
          expect(outcome.impact.length).toBeGreaterThan(0);
          expect(outcome.metricBadge).toBeDefined();
        });

        // Related modules validation
        expect(item.relatedModules.length).toBeGreaterThanOrEqual(2);
        item.relatedModules.forEach((mod) => {
          expect(mod.code.length).toBeGreaterThan(0);
          expect(mod.name.length).toBeGreaterThan(0);
          expect(mod.path.startsWith("/")).toBe(true);
          expect(mod.description.length).toBeGreaterThan(0);
        });

        // Relevant demo scenarios validation
        expect(item.relevantDemoScenarios.length).toBeGreaterThanOrEqual(1);
        item.relevantDemoScenarios.forEach((demo) => {
          expect(isValidCanonicalScenario(demo.scenarioSlug)).toBe(true);
          expect(demo.name.length).toBeGreaterThan(0);
          expect(demo.industry.length).toBeGreaterThan(0);
          expect(demo.narrative.length).toBeGreaterThan(0);
        });

        // Public links validation
        expect(item.publicLinks.length).toBeGreaterThanOrEqual(2);
        item.publicLinks.forEach((link) => {
          expect(link.label.length).toBeGreaterThan(0);
          expect(link.href.startsWith("https://yorkstead.com")).toBe(true);
          expect(link.description.length).toBeGreaterThan(0);
          expect(link.isExternal).toBe(true);
        });
      }
    });

    it("retrieves guidance by module code or returns undefined for unknown codes", () => {
      expect(getModuleGuidance("maintenance")).toBeDefined();
      expect(getModuleGuidance("packaging")).toBeDefined();
      expect(getModuleGuidance("non-existent-module-xyz")).toBeUndefined();
    });
  });

  describe("2. Trusted Link & Route Registry Allowlist Validation", () => {
    it("validates canonical demo scenario identifiers against locked enum", () => {
      for (const slug of CANONICAL_DEMO_SCENARIO_SLUGS) {
        expect(isValidCanonicalScenario(slug)).toBe(true);
      }

      expect(isValidCanonicalScenario("arbitrary-fake-scenario")).toBe(false);
      expect(isValidCanonicalScenario("")).toBe(false);
    });

    it("strictly allows only https://yorkstead.com public links and rejects third-party URLs", () => {
      expect(isValidPublicSiteLink("https://yorkstead.com/services/manufacturing-software")).toBe(true);
      expect(isValidPublicSiteLink("https://yorkstead.com/work/elward-flow")).toBe(true);
      expect(isValidPublicSiteLink("https://yorkstead.com/demos/front-range-manufacturing")).toBe(true);
      expect(isValidPublicSiteLink("https://yorkstead.com/workflow-audit")).toBe(true);

      // Rejects non-yorkstead URLs
      expect(isValidPublicSiteLink("https://evil-phishing-site.com/services")).toBe(false);
      expect(isValidPublicSiteLink("http://yorkstead.com/services")).toBe(false);
      expect(isValidPublicSiteLink("javascript:alert(1)")).toBe(false);
      expect(isValidPublicSiteLink("https://not-yorkstead.com")).toBe(false);
    });

    it("validates internal operations module paths against declared system routes", () => {
      expect(isValidOperationsPath("/maintenance")).toBe(true);
      expect(isValidOperationsPath("/packaging")).toBe(true);
      expect(isValidOperationsPath("/shopfloor")).toBe(true);
      expect(isValidOperationsPath("/quotes")).toBe(true);
      expect(isValidOperationsPath("/shipping")).toBe(true);
      expect(isValidOperationsPath("/inventory")).toBe(true);

      // Rejects unallowlisted paths
      expect(isValidOperationsPath("/malicious-admin-backdoor")).toBe(false);
      expect(isValidOperationsPath("relative/path")).toBe(false);
    });
  });

  describe("3. Component Markup, Accessibility & Context Labeling", () => {
    it("renders LIVE context indicator when configured for production", () => {
      const html = renderToStaticMarkup(
        React.createElement(ModuleGuidanceCard, {
          moduleCode: "maintenance",
          contextOverride: "live",
          initialExpanded: false,
        })
      );

      expect(html).toContain("LIVE TENANT // PRODUCTION CONTROLS");
      expect(html).toContain("Equipment Maintenance &amp; Downtime Health");
      expect(html).toContain("aria-expanded=\"false\"");
      expect(html).toContain("aria-controls=\"guidance-content-maintenance\"");
    });

    it("renders DEMO context indicator when configured for sandbox", () => {
      const html = renderToStaticMarkup(
        React.createElement(ModuleGuidanceCard, {
          moduleCode: "packaging",
          contextOverride: "demo",
          initialExpanded: false,
        })
      );

      expect(html).toContain("DEMO MODE // SYNTHETIC SANDBOX");
      expect(html).toContain("Packaging &amp; Container Palletization");
    });

    it("renders complete expanded structure with accessibility landmarks", () => {
      const html = renderToStaticMarkup(
        React.createElement(ModuleGuidanceCard, {
          moduleCode: "maintenance",
          contextOverride: "live",
          initialExpanded: true,
          initialTab: "walkthrough",
        })
      );

      // Section and Region Landmarks
      expect(html).toContain("role=\"region\"");
      expect(html).toContain("aria-labelledby=\"guidance-heading-maintenance\"");
      expect(html).toContain("aria-expanded=\"true\"");

      // Requisite Content Blocks
      expect(html).toContain("What This Module Does");
      expect(html).toContain("Operational Problem It Replaces");
      expect(html).toContain("What You Are Looking At");
      expect(html).toContain("Numbered Operational Sequence");
      expect(html).toContain("STEP 01");
      expect(html).toContain("STEP 02");
      expect(html).toContain("STEP 03");
      expect(html).toContain("STEP 04");
    });

    it("renders ecosystem tab with verified external links and canonical demo sandboxes", () => {
      const html = renderToStaticMarkup(
        React.createElement(ModuleGuidanceCard, {
          moduleCode: "maintenance",
          contextOverride: "live",
          initialExpanded: true,
          initialTab: "connections",
        })
      );

      // External link safety attributes
      expect(html).toContain("target=\"_blank\"");
      expect(html).toContain("rel=\"noreferrer\"");
      expect(html).toContain("yorkstead.com");
      expect(html).toContain("https://yorkstead.com/services/manufacturing-software");
      expect(html).toContain("Launch Summit Facility Services Demo Sandbox");
    });

    it("gracefully returns null for unconfigured module codes without throwing", () => {
      const html = renderToStaticMarkup(
        React.createElement(ModuleGuidanceCard, {
          moduleCode: "unknown-nonexistent-code",
        })
      );

      expect(html).toBe("");
    });
  });
});
