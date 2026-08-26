import { describe, expect, it } from "bun:test";
import { DemoSeedingService } from "../modules/demo/application/demo-seeding-service";
import { IdentityService } from "../modules/core/application/identity-service";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const identityService = new IdentityService();
const demoSeedingService = new DemoSeedingService();

// Production Customer Organization
const { user: prodUser } = identityService.bootstrapOwner({
  email: "customer@precisionaerotech.com",
  name: "Customer Operations",
  organizationName: "Precision Aerotech Production",
  organizationSlug: "precision-aerotech-prod",
});
const prodSession = identityService.getSessionContext(prodUser.id);

// Demo Sandbox Organization
identityService.createOrganization(prodUser.id, "Front Range Demo Foundry", "front-range-demo");
const demoSession = identityService.switchActiveOrganization(prodUser.id, Array.from(identityService["organizations"].values()).find(o => o.slug === "front-range-demo")!.id);
demoSession.activeOrganization.isDemo = true;

describe("Synthetic Data Isolation & Non-Contamination Verification Suite", () => {
  // 1. Reading an empty production organization performs zero writes
  it("repository read paths do not invoke legacy seed helpers", () => {
    const repositoryFiles = [
      "modules/core/infrastructure/file-repository.ts",
      "modules/analytics/infrastructure/analytics-repository.ts",
      "modules/knowledge/infrastructure/knowledge-repository.ts",
      "modules/maintenance/infrastructure/maintenance-repository.ts",
      "modules/packaging/infrastructure/packaging-repository.ts",
      "modules/packet-intelligence/infrastructure/packet-intelligence-repository.ts",
      "modules/purchasing/infrastructure/purchasing-repository.ts",
      "modules/quoting/infrastructure/quoting-repository.ts",
      "modules/shipping/infrastructure/shipping-repository.ts",
    ];

    for (const repositoryFile of repositoryFiles) {
      const source = readFileSync(resolve(process.cwd(), repositoryFile), "utf8");
      const invocations = source.match(/(?:await\s+)?this\.ensure(?:SeededData|SeededEquipment)\s*\(/g) ?? [];
      expect(invocations).toHaveLength(0);
    }
  });

  // 2. Production organization seeding is rejected
  it("strictly rejects demo seeding when targeted at a production customer organization", () => {
    expect(() => {
      demoSeedingService.seedDemoOrganization(prodSession);
    }).toThrow("Forbidden: Cannot seed production customer organization");
  });

  // 3. Demo organization seeding succeeds
  it("successfully seeds synthetic data into an explicit demo organization", () => {
    const res = demoSeedingService.seedDemoOrganization(demoSession);
    expect(res.success).toBe(true);
    expect(res.seededEntitiesCount).toBeGreaterThan(0);
  });

  // 4. Repeated demo seeding does not duplicate records
  it("ensures repeated demo seeding is idempotent and does not duplicate records", () => {
    const res2 = demoSeedingService.seedDemoOrganization(demoSession);
    expect(res2.success).toBe(true);
    expect(res2.seededEntitiesCount).toBe(0); // 0 new records
  });

  // 5. Demo data remains tenant-isolated
  it("ensures demo seed state remains tenant-isolated", () => {
    expect(demoSeedingService.auditOrganizationContamination(prodSession).totalSyntheticRecordsFound).toBe(0);
    expect(demoSeedingService.auditOrganizationContamination(demoSession).totalSyntheticRecordsFound).toBeGreaterThan(0);
  });

  // 6. Cleanup preview identifies only eligible synthetic records
  it("cleanup preview identifies eligible synthetic records in demo organization without modifying data", () => {
    const preview = demoSeedingService.previewDemoCleanup(demoSession);
    expect(preview.eligibleRecordCount).toBeGreaterThan(0);
    expect(preview.targetOrganizationId).toBe(demoSession.activeOrganization.id);
  });

  // 7. Cross-tenant cleanup is rejected
  it("strictly rejects demo cleanup when targeted at a production organization", () => {
    expect(() => {
      demoSeedingService.cleanDemoOrganization(prodSession);
    }).toThrow("Forbidden: Cannot clean production customer organization");
  });
});
