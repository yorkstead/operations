# Gemini Prompt Runbook

Run exactly one prompt per Gemini session. Every prompt is self-contained but subordinate to `AGENTS.md` and `docs/VISUAL_SYSTEM.md`. Do not paste the entire library into one session.

## Exact order

1. `00-foundation/00-engineering-contract.md`
2. `00-foundation/01-visual-preservation-baseline.md`
3. `00-foundation/02-platform-foundation.md` — **CHECKPOINT: stop, review the actual path, checks, diff, docs, and commit before continuing.**
4. `00-foundation/03-workflow-audit-domain.md`
5. `10-core-platform/10-organizations-and-identity.md`
6. `10-core-platform/11-roles-and-capabilities.md`
7. `10-core-platform/12-files-activity-notifications.md`
8. `10-core-platform/13-customers-vendors-locations.md`
9. `10-core-platform/14-jobs-and-workflow.md`
10. `10-core-platform/15-configuration-and-admin.md` — **CHECKPOINT: stop, review the actual path, checks, diff, docs, and commit before continuing.**
11. `20-operations-modules/20-shopfloor-digital-traveler.md`
12. `20-operations-modules/21-inventory.md`
13. `20-operations-modules/22-job-packet-intelligence.md` — **CHECKPOINT: stop, review the actual path, checks, diff, docs, and commit before continuing.**
14. `20-operations-modules/23-quality.md`
15. `20-operations-modules/24-maintenance.md`
16. `20-operations-modules/25-packaging.md`
17. `20-operations-modules/26-shipping.md`
18. `20-operations-modules/27-quoteflow.md`
19. `20-operations-modules/28-purchasing.md`
20. `20-operations-modules/29-knowledge.md`
21. `20-operations-modules/30-analytics-planning.md`
22. `30-demo-framework/30-demo-engineering-contract.md`
23. `30-demo-framework/31-demo-organization-framework.md`
24. `30-demo-framework/32-front-range-manufacturing.md` — **CHECKPOINT: stop, review the actual path, checks, diff, docs, and commit before continuing.**
25. `30-demo-framework/33-summit-facility-services.md`
26. `30-demo-framework/34-mile-high-signworks.md`
27. `30-demo-framework/35-peak-mobile-detail.md`
28. `40-public-portfolio/40-public-site-integration-contract.md`
29. `40-public-portfolio/41-demos-page.md`
30. `40-public-portfolio/42-solutions-page.md`
31. `40-public-portfolio/43-work-page.md` — **CHECKPOINT: stop, review the actual path, checks, diff, docs, and commit before continuing.**
32. `40-public-portfolio/44-labs-page.md`
33. `40-public-portfolio/45-platform-page.md`
34. `40-public-portfolio/46-homepage-and-how-we-build.md`
35. `50-sales-tools/50-sales-demo-mode.md`
36. `50-sales-tools/51-audit-deliverable.md`
37. `50-sales-tools/52-build-your-system.md`
38. `50-sales-tools/53-implementation-library.md`
39. `60-hardening/60-accessibility-performance.md`
40. `60-hardening/61-security-tenant-isolation.md`
41. `60-hardening/62-data-recovery-observability.md`
42. `60-hardening/63-production-readiness-review.md`
43. `60-hardening/64-portfolio-review-and-handoff.md` — **CHECKPOINT: stop, review the actual path, checks, diff, docs, and commit before continuing.**

## First practical sequence

For the fastest useful and presentable path, complete prompts 1–4, then 11 (`ShopFloor`), 12 (`Inventory`), 13 (`Job Packet Intelligence`), 21–23 (demo contract/framework/manufacturing), and 27–29 (`/demos`, `/solutions`, `/work`). Resume the exact order afterward; do not skip prerequisites that the repository has not already satisfied.

## Session protocol

1. Open the repository root in Gemini.
2. Tell Gemini: “Read `AGENTS.md`, `docs/VISUAL_SYSTEM.md`, and execute only `prompts/<file>.md`.”
3. Require its state/assumptions summary before implementation.
4. Review the running feature at desktop and mobile sizes.
5. Confirm the reported checks and inspect the diff.
6. Commit the prompt as one coherent change.
7. At checkpoints, run the full suite and complete the relevant readiness template.

A prompt is not complete because code was generated. It is complete when the user path, permissions, failure states, data integrity, documentation, and verification evidence meet its acceptance criteria.

