import { describe, expect, it, beforeEach } from "bun:test";
import { IdentityService } from "../modules/core/application/identity-service";
import { SyntheticEmailAdapter } from "../modules/core/domain/ports/email-port";
import { authorizationService } from "../modules/core/application/authorization-service";
import { DemoSeedingService } from "../modules/demo/application/demo-seeding-service";
import { SessionContext } from "../modules/core/domain/types";

describe("Tenant 0: Yorkstead Systems & Operator Identity Suite", () => {
  let emailAdapter: SyntheticEmailAdapter;
  let identityService: IdentityService;
  let demoSeedingService: DemoSeedingService;

  beforeEach(() => {
    emailAdapter = new SyntheticEmailAdapter();
    identityService = new IdentityService(emailAdapter);
    demoSeedingService = new DemoSeedingService();
  });

  it("establishes Yorkstead Systems as the root organization (Tenant 0) for operator Brandon", () => {
    const { user, organization, membership } = identityService.ensureTenantZero();

    expect(user.email).toBe("brandon@yorkstead.com");
    expect(user.name).toBe("Brandon");
    expect(user.isGlobalOwner).toBe(true);
    expect(user.status).toBe("active");

    expect(organization.name).toBe("Yorkstead Systems");
    expect(organization.slug).toBe("yorkstead");
    expect(organization.status).toBe("active");
    expect(organization.isDemo).toBeUndefined(); // production organization (not demo)

    expect(membership.role).toBe("owner");
    expect(membership.organizationId).toBe(organization.id);
    expect(membership.userId).toBe(user.id);
  });

  it("ensures idempotency when resolving Tenant 0", () => {
    const first = identityService.ensureTenantZero();
    const second = identityService.ensureTenantZero();

    expect(first.user.id).toBe(second.user.id);
    expect(first.organization.id).toBe(second.organization.id);
    expect(first.membership.id).toBe(second.membership.id);
  });

  it("grants owner super-admin capabilities to Brandon under Yorkstead Systems", () => {
    const { user } = identityService.ensureTenantZero();
    const session: SessionContext = identityService.getSessionContext(user.id);

    // Operator Brandon has core administrative & operational capabilities
    expect(authorizationService.canPerform(session, "org:manage_roles")).toBe(true);
    expect(authorizationService.canPerform(session, "org:manage_members")).toBe(true);
    expect(authorizationService.canPerform(session, "quoting:create_quote")).toBe(true);
    expect(authorizationService.canPerform(session, "inventory:view_stock")).toBe(true);
    expect(authorizationService.canPerform(session, "shipping:create_manifest")).toBe(true);
    expect(authorizationService.canPerform(session, "files:upload")).toBe(true);
  });

  it("strictly enforces tenant boundary between Yorkstead Systems and demo sandboxes", () => {
    const { user: brandon, organization: yorkstead } = identityService.ensureTenantZero();
    const sessionYorkstead = identityService.getSessionContext(brandon.id);

    // Create a demo scenario organization (e.g. Mile High Signworks)
    const demoOrg = identityService.createOrganization(brandon.id, "Mile High Signworks", "mile-high-signworks");
    demoOrg.isDemo = true;

    // Assert: Yorkstead session accessing Yorkstead resources passes
    expect(() => {
      identityService.assertTenantAccess(sessionYorkstead, yorkstead.id);
    }).not.toThrow();

    // Assert: Yorkstead session cannot access demo resources without explicit org switch
    expect(() => {
      identityService.assertTenantAccess(sessionYorkstead, demoOrg.id);
    }).toThrow("Cross-Tenant Isolation Violation");
  });

  it("strictly denies demo seeding and demo mutation against production Yorkstead Systems", () => {
    const { user: brandon, organization: yorkstead } = identityService.ensureTenantZero();
    const sessionYorkstead = identityService.getSessionContext(brandon.id);

    // Guardrail: Refuses to seed Yorkstead Systems because isDemo is not true
    expect(() => {
      demoSeedingService.seedDemoOrganization(sessionYorkstead);
    }).toThrow("Cannot seed production customer organization 'Yorkstead Systems'");

    expect(() => {
      demoSeedingService.previewDemoCleanup(sessionYorkstead);
    }).toThrow("Cannot preview cleanup for production customer organization 'Yorkstead Systems'");
  });
});
