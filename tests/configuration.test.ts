import { describe, expect, it, beforeEach } from "bun:test";
import { ConfigurationService, ModuleDisabledError } from "../modules/config/application/configuration-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Organization Configuration & Administration", () => {
  let configService: ConfigurationService;
  let identityService: IdentityService;

  beforeEach(() => {
    configService = new ConfigurationService();
    identityService = new IdentityService();
  });

  it("retrieves default configuration and tracks versioned updates", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const config = configService.getConfiguration(session);
    expect(config.version).toBe(1);
    expect(config.entitlements.shopfloor).toBe(true);

    // Update configuration
    const updated = configService.updateConfiguration(
      session,
      {
        terminology: {
          jobLabel: "Project",
          travelerLabel: "Router",
          facilityLabel: "Building",
          operatorLabel: "Tech",
        },
        workflow: {
          allowRushOverrides: false,
          requireQualitySignoff: true,
          defaultLaborRatePerHour: 95.0,
        },
      },
      "Adopt aerospace terminology and updated shop rates."
    );

    expect(updated.version).toBe(2);
    expect(updated.terminology.jobLabel).toBe("Project");
    expect(updated.workflow.defaultLaborRatePerHour).toBe(95.0);

    const history = configService.listHistory(session);
    expect(history.length).toBe(2);
    expect(history[0].version).toBe(2);
  });

  it("enforces server-side disabled module checks and rejects access", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    // Disable quoteflow module
    const currentConfig = configService.getConfiguration(session);
    configService.updateConfiguration(
      session,
      {
        entitlements: {
          ...currentConfig.entitlements,
          quoteflow: false,
        },
      },
      "Disable QuoteFlow for standard operator tenant."
    );

    expect(() => {
      configService.assertModuleEnabled(session, "quoteflow");
    }).toThrow(ModuleDisabledError);

    // Enabled module passes
    expect(() => {
      configService.assertModuleEnabled(session, "shopfloor");
    }).not.toThrow();
  });

  it("validates invariants and supports rollback", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    // Invariant test: negative labor rate must fail
    expect(() => {
      configService.updateConfiguration(
        session,
        {
          workflow: {
            allowRushOverrides: true,
            requireQualitySignoff: true,
            defaultLaborRatePerHour: -50,
          },
        },
        "Invalid rate"
      );
    }).toThrow("greater than zero");

    // Rollback test
    const rolledBack = configService.rollbackConfiguration(session, 1, "Testing rollback to initial state");
    expect(rolledBack.version).toBe(2); // new version containing v1 snapshot
    expect(rolledBack.workflow.defaultLaborRatePerHour).toBe(85.0);
  });
});
