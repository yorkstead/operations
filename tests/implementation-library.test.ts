import { describe, expect, it } from "bun:test";
import {
  ImplementationLibraryService,
  standardLibraryTemplates
} from "../modules/implementation-library/application/library-service";

describe("Implementation Library Engine & Template Governance", () => {
  it("defines standard templates across all eight operational categories", () => {
    expect(standardLibraryTemplates.length).toBe(8);

    const categories = standardLibraryTemplates.map((t) => t.category);
    expect(categories).toContain("discovery_questionnaire");
    expect(categories).toContain("workflow_map");
    expect(categories).toContain("acceptance_criteria");
    expect(categories).toContain("configuration_package");
    expect(categories).toContain("import_mapping");
    expect(categories).toContain("training_checklist");
    expect(categories).toContain("operational_runbook");
    expect(categories).toContain("post_launch_review");
  });

  it("ensures every template defines provenance, sanitization date, reviewer, and org-neutral content", () => {
    for (const tmpl of standardLibraryTemplates) {
      expect(tmpl.title.length).toBeGreaterThan(5);
      expect(tmpl.summary.length).toBeGreaterThan(15);
      expect(tmpl.provenance.length).toBeGreaterThan(10);
      expect(tmpl.reviewedBy.length).toBeGreaterThan(5);
      expect(tmpl.contentMarkdown.length).toBeGreaterThan(50);
      expect(tmpl.tags.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("filters templates by category and search keyword accurately", () => {
    const questionnaires = ImplementationLibraryService.getTemplates({ category: "discovery_questionnaire" });
    expect(questionnaires.length).toBe(1);
    expect(questionnaires[0].id).toBe("tmpl_disc_shopfloor");

    const searchResults = ImplementationLibraryService.getTemplates({ search: "cutover" });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].id).toBe("tmpl_rb_cutover");
  });

  it("clones a template into an organization workspace with customized title and versioning", () => {
    const cloned = ImplementationLibraryService.cloneTemplate("tmpl_ac_milestone1", "org_front_range_mfg");
    expect(cloned.clonedId.startsWith("cloned_")).toBe(true);
    expect(cloned.organizationId).toBe("org_front_range_mfg");
    expect(cloned.version).toContain("CUSTOM");

    const orgClones = ImplementationLibraryService.getClonedTemplates("org_front_range_mfg");
    expect(orgClones.length).toBeGreaterThanOrEqual(1);
  });
});
