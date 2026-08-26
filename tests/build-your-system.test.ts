import { describe, expect, it } from "bun:test";
import {
  SystemConfiguratorService,
  availableModules
} from "../modules/sales-tools/application/system-configurator-service";
import type { ConfiguratorSelections } from "../modules/sales-tools/domain/system-configurator";

describe("Build Your System Configurator Engine", () => {
  it("defines eight composable modules with integer-cents price ranges", () => {
    expect(availableModules.length).toBe(8);

    for (const mod of availableModules) {
      expect(mod.name.length).toBeGreaterThan(3);
      expect(mod.description.length).toBeGreaterThan(15);
      expect(mod.basePriceMinCents).toBeGreaterThan(100000); // > $1,000
      expect(mod.basePriceMaxCents).toBeGreaterThan(mod.basePriceMinCents);
      expect(Number.isInteger(mod.basePriceMinCents)).toBe(true);
      expect(Number.isInteger(mod.basePriceMaxCents)).toBe(true);
    }
  });

  it("evaluates architectural compatibility rules correctly", () => {
    const selections: ConfiguratorSelections = {
      industry: "cnc_sheet_metal",
      shopSize: "10_to_50",
      roles: ["owner_executive", "field_technician"],
      selectedModules: ["shipping_palletization"], // Shipping without inventory
      integrations: ["modbus_plc_telemetry"],      // Modbus safety warning
      primaryBottleneck: "Drawing scrap",
      targetTimeline: "immediate_pilot",
    };

    const notices = SystemConfiguratorService.evaluateCompatibility(selections);
    expect(notices.length).toBeGreaterThanOrEqual(2);

    const titles = notices.map((n) => n.title);
    expect(titles.some((t) => t.includes("Material Ledger"))).toBe(true);
    expect(titles.some((t) => t.includes("Read-Only Telemetry"))).toBe(true);
  });

  it("generates structured discussion brief with phased milestones", () => {
    const selections: ConfiguratorSelections = {
      industry: "cnc_sheet_metal",
      shopSize: "10_to_50",
      roles: ["owner_executive", "estimator_sales", "shopfloor_operator"],
      selectedModules: ["quoteflow_estimating", "shopfloor_travelers", "quality_ncr"],
      integrations: ["vector_cad_dxf", "barcode_scanners"],
      primaryBottleneck: "Drawing revision mismatches",
      targetTimeline: "immediate_pilot",
    };

    const brief = SystemConfiguratorService.generateDiscussionBrief(selections);

    expect(brief.briefId.startsWith("brief_")).toBe(true);
    expect(brief.recommendedPhases.length).toBeGreaterThanOrEqual(1);
    expect(brief.recommendedFirstSlice).toContain("Shopfloor Traveler");
    expect(brief.estimatedTotalScopeCents.min).toBeGreaterThan(400000);
    expect(brief.estimatedTotalScopeCents.max).toBeGreaterThan(brief.estimatedTotalScopeCents.min);
    expect(brief.guardrails.length).toBeGreaterThanOrEqual(2);
  });
});
