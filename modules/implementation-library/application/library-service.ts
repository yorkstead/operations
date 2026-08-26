import type {
  LibraryTemplate,
  TemplateCategory,
  TargetIndustry,
  ClonedOrganizationTemplate
} from "../domain/types";

export const standardLibraryTemplates: LibraryTemplate[] = [
  {
    id: "tmpl_disc_shopfloor",
    category: "discovery_questionnaire",
    title: "Shopfloor Execution & Drawing Lock Discovery",
    version: "v1.2",
    industry: "cnc_sheet_metal",
    summary: "Diagnostic scoping questions to uncover drawing revision leaks, machine setup bottlenecks, and paper traveler friction.",
    provenance: "Sanitized from high-mix precision fabrication audits; 100% org-neutral.",
    sanitizedReviewDate: "2026-08-20",
    reviewedBy: "Brandon York (Principal Engineer)",
    tags: ["shopfloor", "drawings", "revision_lock", "wip_tracking"],
    contentMarkdown: `### Shopfloor Execution & Drawing Lock Discovery

#### 1. CAD Drawing & Revision Hand-off
1. How are engineering drawings currently distributed from the office to machine work centers?
2. When a customer sends Rev B mid-production, how does the machine operator verify they are cutting the latest file?
3. In the past 90 days, how many parts or production runs were scrapped due to superseded drawings?

#### 2. Work Center Sequence & Signoffs
1. Do parts move through strict sequential work centers (e.g. Laser -> Deburr -> Brake -> Weld -> Paint -> Assembly)?
2. Who authorizes transitions between work centers?
3. How is operator attribution recorded at each machine?

#### 3. Machine Downtime & Blocker Reporting
1. How do operators report assist-gas drops, tooling wear, or missing material?
2. Are blockers logged in real-time or reconstructed at end of shift?`,
  },
  {
    id: "tmpl_wf_laser_brake",
    category: "workflow_map",
    title: "Standard Sheet Metal Laser & Press Brake Flow",
    version: "v2.0",
    industry: "cnc_sheet_metal",
    summary: "Stage-by-stage operational workflow map with drawing locks, first-article inspection, and packaging handoffs.",
    provenance: "Curated from standard industrial engineering practices; org-neutral.",
    sanitizedReviewDate: "2026-08-21",
    reviewedBy: "Brandon York (Principal Engineer)",
    tags: ["workflow", "laser", "press_brake", "fai"],
    contentMarkdown: `### Operational Workflow: Sheet Metal Laser & Press Brake

\`\`\`
[RFQ Intake & Quoting] 
       │ (1-Click Convert to Live Job)
       ▼
[Engineering Release] ──► [Cryptographic Drawing Lock (Rev C)]
       │
       ▼
[6kW Fiber Laser Cell] ──► [Operator Attribution & Cut Complete]
       │
       ▼
[Press Brake Forming] ──► [First Article Inspection (FAI)]
       │                          │
       │                   [Pass] ┴ [Fail -> Quarantine NCR]
       ▼
[Welding & Sub-Assembly]
       │
       ▼
[Pallet Load Builder] ──► [Carrier BOL Manifest & Dispatch]
\`\`\``,
  },
  {
    id: "tmpl_ac_milestone1",
    category: "acceptance_criteria",
    title: "Milestone 1 Vertical Slice Acceptance Checklist",
    version: "v1.4",
    industry: "all_industries",
    summary: "Rigorous acceptance criteria checklist to verify a production-ready first release without loose ends.",
    provenance: "Core Yorkstead Engineering Standard.",
    sanitizedReviewDate: "2026-08-22",
    reviewedBy: "Brandon York (Principal Engineer)",
    tags: ["acceptance_criteria", "milestone1", "testing", "release_gate"],
    contentMarkdown: `### Milestone 1 Acceptance Criteria

- [ ] **Tenant Isolation Enforced**: Database queries strictly verify \`organizationId\`; cross-tenant access is rejected at server layer.
- [ ] **End-to-End User Path**: Machine operator can sign in, scan work order QR, view locked CAD drawing, and complete step without encountering dead ends.
- [ ] **Automated Test Coverage**: 100% of unit and integration tests pass cleanly via automated test runner.
- [ ] **Integer Cents Financials**: All currency calculations operate exclusively in integer cents with zero floating-point rounding errors.
- [ ] **Zero Unsanitized PII**: Audit logs and error trackers contain zero unhashed credentials or sensitive customer documents.
- [ ] **Production Rollback Verified**: Database migrations support deterministic rollback verification.`,
  },
  {
    id: "tmpl_cfg_machine_rates",
    category: "configuration_package",
    title: "Machine Hourly Rate & Margin Guardrail Schema",
    version: "v1.1",
    industry: "cnc_sheet_metal",
    summary: "Declarative JSON configuration schema for machine cost centers, hourly runtime rates, and executive margin thresholds.",
    provenance: "Derived from QuoteFlow estimating domain.",
    sanitizedReviewDate: "2026-08-23",
    reviewedBy: "Brandon York (Principal Engineer)",
    tags: ["configuration", "quoteflow", "rates", "margins"],
    contentMarkdown: `### Declarative Machine Rates & Margin Schema

\`\`\`json
{
  "currency": "USD",
  "marginGuardrailThresholdPercent": 25.0,
  "machineCenters": [
    { "code": "LASER-6KW", "name": "6kW Fiber Laser", "hourlyRateCents": 18500, "setupRateCents": 9500 },
    { "code": "BRAKE-150T", "name": "150-Ton CNC Press Brake", "hourlyRateCents": 12500, "setupRateCents": 6500 },
    { "code": "WELD-TIG", "name": "TIG Welding Bench", "hourlyRateCents": 9500, "setupRateCents": 4500 }
  ]
}
\`\`\``,
  },
  {
    id: "tmpl_imp_inventory",
    category: "import_mapping",
    title: "Raw Material & Stock Ledger CSV Import Schema",
    version: "v1.0",
    industry: "all_industries",
    summary: "Standard CSV headers and validation rules for importing raw sheet stock, hardware fasteners, and consumable inventory.",
    provenance: "Compatible with Material Ledger double-entry transactions.",
    sanitizedReviewDate: "2026-08-24",
    reviewedBy: "Brandon York (Principal Engineer)",
    tags: ["import", "csv", "inventory", "ledger"],
    contentMarkdown: `### Raw Material CSV Import Specification

| Column Header | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| \`sku\` | String | Yes | Unique item identifier | \`AL-5052-063-48X96\` |
| \`name\` | String | Yes | Human-readable material name | \`5052-H32 Aluminum Sheet 0.063" 48x96\` |
| \`category\` | String | Yes | Material classification | \`sheet_metal\` |
| \`unit_of_measure\` | String | Yes | Inventory tracking unit | \`sheet\` |
| \`unit_cost_cents\` | Integer | Yes | Cost per unit in integer cents | \`6850\` ($68.50) |
| \`reorder_point\` | Integer | Yes | Minimum threshold before alert | \`10\` |`,
  },
  {
    id: "tmpl_tr_operator",
    category: "training_checklist",
    title: "Shopfloor Machine Operator 15-Minute Onboarding",
    version: "v1.3",
    industry: "cnc_sheet_metal",
    summary: "Quick-start checklist for shop leads training laser and press brake operators on touchscreen digital travelers.",
    provenance: "Ergonomic training guide developed for shopfloor tablets.",
    sanitizedReviewDate: "2026-08-24",
    reviewedBy: "Brandon York (Principal Engineer)",
    tags: ["training", "onboarding", "operator", "touchscreen"],
    contentMarkdown: `### Operator 15-Minute Onboarding Checklist

1. **Sign-In & Station Select** (2 min): Walk operator through station sign-in and selecting the 6kW Laser Cell work center.
2. **Scan Work Order QR** (3 min): Demonstrate barcode scanner aiming to pull up active traveler packet.
3. **Verify Drawing Revision Lock** (3 min): Point out the locked Rev C badge and full-screen pan/zoom vector drawing viewer.
4. **Log Machine Blockers** (3 min): Show one-tap assist-gas alert and maintenance ticket creation.
5. **Complete Operation Signoff** (4 min): Guide first live completion with timestamped operator attribution badge.`,
  },
  {
    id: "tmpl_rb_cutover",
    category: "operational_runbook",
    title: "Production Cutover & Deterministic Rollback Runbook",
    version: "v2.1",
    industry: "all_industries",
    summary: "Step-by-step technical procedures for tenant provisioning, initial data migration, and zero-data-loss rollback.",
    provenance: "Core Yorkstead Systems Reliability Engineering Runbook.",
    sanitizedReviewDate: "2026-08-25",
    reviewedBy: "Brandon York (Principal Engineer)",
    tags: ["runbook", "cutover", "rollback", "migration", "sre"],
    contentMarkdown: `### Production Cutover & Rollback Runbook

#### Pre-Flight Checklist (T-2 Hours)
- [ ] Run \`bun run db:migrate:check\` to verify zero pending schema drift.
- [ ] Confirm automated test suite passes 100% (\`bun test\`).
- [ ] Execute synthetic load test on target tenant database instance.
- [ ] Verify automated database backup snapshot is created and restorable.

#### Go-Live Cutover (T-0)
- [ ] Execute tenant migration script.
- [ ] Import approved master data CSV (materials, customers, work centers).
- [ ] Issue operator station credentials and verify passkey / PIN auth.
- [ ] Run first end-to-end traveler smoke test.

#### Abort & Rollback Criteria
- If database schema conflict occurs during cutover, execute \`bun run db:rollback\` immediately.
- Revert DNS to prior maintenance page; investigate migration log.`,
  },
  {
    id: "tmpl_plr_30day",
    category: "post_launch_review",
    title: "30-Day Post-Launch Adoption & Baseline Review",
    version: "v1.0",
    industry: "all_industries",
    summary: "Structured review template to measure operator traveler adoption, scrap reduction trends, and quote cycle times.",
    provenance: "Evidence-based post-launch verification framework.",
    sanitizedReviewDate: "2026-08-25",
    reviewedBy: "Brandon York (Principal Engineer)",
    tags: ["review", "adoption", "metrics", "post_launch"],
    contentMarkdown: `### 30-Day Post-Launch Review Protocol

#### 1. Operator Adoption Metrics
- [ ] Percentage of completed production jobs run through digital travelers (Target: > 95%).
- [ ] Average time from RFQ intake to sent quote (Target: < 15 minutes).
- [ ] Total recorded machine blocker incidents and resolution times.

#### 2. Quality & Scrap Verification
- [ ] Measured scrapped parts due to revision mismatches (Target: 0 incidents).
- [ ] First Article Inspection (FAI) digital compliance records completed.

#### 3. Operator Feedback & Iteration
- [ ] Solicit feedback from 3 machine operators and 1 estimator.
- [ ] Identify candidate enhancements for Milestone 2 operational expansion.`,
  },
];

// In-memory store for cloned organization templates
const clonedTemplatesStore: Map<string, ClonedOrganizationTemplate> = new Map();

export class ImplementationLibraryService {
  static getTemplates(filter?: { category?: TemplateCategory; industry?: TargetIndustry; search?: string }): LibraryTemplate[] {
    return standardLibraryTemplates.filter((t) => {
      if (filter?.category && t.category !== filter.category) return false;
      if (filter?.industry && filter.industry !== "all_industries" && t.industry !== "all_industries" && t.industry !== filter.industry) {
        return false;
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchSummary = t.summary.toLowerCase().includes(q);
        const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchTags) return false;
      }
      return true;
    });
  }

  static getTemplateById(id: string): LibraryTemplate | undefined {
    return standardLibraryTemplates.find((t) => t.id === id);
  }

  static cloneTemplate(templateId: string, organizationId: string, customTitle?: string): ClonedOrganizationTemplate {
    const tmpl = this.getTemplateById(templateId);
    if (!tmpl) {
      throw new Error(`Template ${templateId} not found in implementation library.`);
    }

    const clonedId = `cloned_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const cloned: ClonedOrganizationTemplate = {
      clonedId,
      templateId: tmpl.id,
      organizationId,
      title: customTitle || `${tmpl.title} (${organizationId})`,
      version: `${tmpl.version}-CUSTOM`,
      customizedContent: tmpl.contentMarkdown,
      createdAt: now,
      updatedAt: now,
    };

    clonedTemplatesStore.set(clonedId, cloned);
    return cloned;
  }

  static getClonedTemplates(organizationId: string): ClonedOrganizationTemplate[] {
    return Array.from(clonedTemplatesStore.values()).filter((c) => c.organizationId === organizationId);
  }
}
