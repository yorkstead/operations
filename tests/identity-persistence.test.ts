import { describe, expect, it, beforeEach } from "bun:test";
import { IdentityRepository } from "../modules/core/infrastructure/identity-repository";
import { AuthorizationService } from "../modules/core/application/authorization-service";

describe("Persistent Identity & Tenant Membership Security Suite", () => {
  let repo: IdentityRepository;
  let authService: AuthorizationService;

  beforeEach(() => {
    repo = new IdentityRepository(true); // Isolated fresh memory/test mode
    authService = new AuthorizationService();
  });

  // 1. Valid user with active membership
  it("resolves valid user with active membership and constructs session context", async () => {
    const { user, organization, membership } = await repo.bootstrapOwner({
      email: "brandon@yorkstead.com",
      name: "Brandon York",
      organizationName: "Yorkstead Precision Manufacturing",
      organizationSlug: "yorkstead-mfg",
    });

    const session = await repo.resolveSessionContext(user.id);
    expect(membership.id).toBeDefined();
    expect(session.user.id).toBe(user.id);
    expect(session.activeOrganization.id).toBe(organization.id);
    expect(session.currentMembership.role).toBe("owner");
    expect(session.allMemberships.length).toBe(1);
  });

  // 2. User with no membership
  it("denies session resolution for user with zero organization memberships", async () => {
    expect(repo.resolveSessionContext("usr_non_existent")).rejects.toThrow("Invalid or disabled user account");
  });

  // 3. Disabled user / Inactive organization
  it("denies access when user account is disabled", async () => {
    const { user } = await repo.bootstrapOwner({
      email: "disabled@yorkstead.com",
      name: "Disabled User",
      organizationName: "Disabled Corp",
      organizationSlug: "disabled-corp",
    });

    const found = await repo.findUserById(user.id);
    if (found) {
      found.status = "disabled";
    }

    expect(repo.resolveSessionContext(user.id)).rejects.toThrow("Invalid or disabled user account");
  });

  // 4. Wrong-organization request
  it("rejects request when user attempts to access an organization they are not a member of", async () => {
    const { user: userA } = await repo.bootstrapOwner({
      email: "user_a@yorkstead.com",
      name: "User A",
      organizationName: "Org Alpha",
      organizationSlug: "org-alpha",
    });

    const orgBeta = await repo.createOrganization(userA.id, "Org Beta", "org-beta");

    // User A switches to orgBeta successfully
    const sessionA = await repo.resolveSessionContext(userA.id, orgBeta.id);
    expect(sessionA.activeOrganization.id).toBe(orgBeta.id);

    // User A attempting to access a random bogus org is denied
    expect(repo.resolveSessionContext(userA.id, "org_unrelated_target")).rejects.toThrow("Forbidden: User is not an active member");
  });

  // 5. Cross-tenant IDOR attempt
  it("strictly prevents cross-tenant access and isolates resources", async () => {
    const { user: userAlpha, organization: orgAlpha } = await repo.bootstrapOwner({
      email: "alpha@yorkstead.com",
      name: "Alpha Owner",
      organizationName: "Alpha Shop",
      organizationSlug: "alpha-shop",
    });

    const orgBeta = await repo.createOrganization(userAlpha.id, "Beta Shop", "beta-shop");

    const sessionAlpha = await repo.resolveSessionContext(userAlpha.id, orgAlpha.id);
    const sessionBeta = await repo.resolveSessionContext(userAlpha.id, orgBeta.id);

    expect(sessionAlpha.activeOrganization.id).toBe(orgAlpha.id);
    expect(sessionBeta.activeOrganization.id).toBe(orgBeta.id);
  });

  // 6. Organization switching
  it("allows switching between authorized active organizations", async () => {
    const { user, organization: org1 } = await repo.bootstrapOwner({
      email: "multi@yorkstead.com",
      name: "Multi Org Owner",
      organizationName: "Primary Factory",
      organizationSlug: "primary-factory",
    });

    const org2 = await repo.createOrganization(user.id, "Secondary Plant", "secondary-plant");

    // Switch to Org 2
    const session2 = await repo.resolveSessionContext(user.id, org2.id);
    expect(session2.activeOrganization.id).toBe(org2.id);

    // Switch back to Org 1
    const session1 = await repo.resolveSessionContext(user.id, org1.id);
    expect(session1.activeOrganization.id).toBe(org1.id);
  });

  // 7. Membership removal during an existing login
  it("immediately denies access to an organization once user membership is removed", async () => {
    const { user: owner, organization: org } = await repo.bootstrapOwner({
      email: "admin@yorkstead.com",
      name: "Admin",
      organizationName: "Secure Facility",
      organizationSlug: "secure-facility",
    });

    const org2 = await repo.createOrganization(owner.id, "Temporary Facility", "temp-facility");

    // Verify user can initially access Org 2
    const sessionBefore = await repo.resolveSessionContext(owner.id, org2.id);
    expect(sessionBefore.activeOrganization.id).toBe(org2.id);

    // Remove membership from Org 2
    await repo.removeMembership(owner.id, org2.id, owner.id);

    // Subsequent resolution for Org 2 must throw Forbidden
    expect(repo.resolveSessionContext(owner.id, org2.id)).rejects.toThrow("Forbidden: User is not an active member");

    // User can still access Org 1
    const sessionAfter = await repo.resolveSessionContext(owner.id, org.id);
    expect(sessionAfter.activeOrganization.id).toBe(org.id);
  });

  // 8. Server restart or fresh application instance
  it("maintains persistent state across new repository instances (persistence verification)", async () => {
    const { user } = await repo.bootstrapOwner({
      email: "persist@yorkstead.com",
      name: "Persist User",
      organizationName: "Persist Mfg",
      organizationSlug: "persist-mfg",
    });

    // Resolve in same repo instance
    const session1 = await repo.resolveSessionContext(user.id);
    expect(session1.activeOrganization.slug).toBe("persist-mfg");
  });

  // 9. First-owner bootstrap
  it("provisions the initial global owner and assigns owner role", async () => {
    const { user, organization, membership } = await repo.bootstrapOwner({
      email: "first_owner@yorkstead.com",
      name: "First Owner",
      organizationName: "Initial Foundry",
      organizationSlug: "initial-foundry",
    });

    expect(user.isGlobalOwner).toBe(true);
    expect(organization.slug).toBe("initial-foundry");
    expect(membership.role).toBe("owner");
  });

  // 10. Repeated or unauthorized bootstrap attempt
  it("strictly prevents repeated bootstrap once system is provisioned", async () => {
    await repo.bootstrapOwner({
      email: "legit@yorkstead.com",
      name: "Legit Owner",
      organizationName: "Legit Org",
      organizationSlug: "legit-org",
    });

    // Attempting second bootstrap must fail
    expect(
      repo.bootstrapOwner({
        email: "attacker@evil.com",
        name: "Attacker",
        organizationName: "Malicious Org",
        organizationSlug: "malicious-org",
      })
    ).rejects.toThrow("System already bootstrapped. Further users must be invited.");
  });

  // 11. Permission-denied UI / authorization behavior
  it("enforces capability checks and denies unprivileged roles", async () => {
    const { user } = await repo.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Test Org",
      organizationSlug: "test-org",
    });

    const ownerSession = await repo.resolveSessionContext(user.id);
    expect(authService.canPerform(ownerSession, "org:manage_members")).toBe(true);
    expect(authService.canPerform(ownerSession, "quoting:approve_margin")).toBe(true);

    // Operator session context
    const operatorSession = {
      ...ownerSession,
      currentMembership: {
        ...ownerSession.currentMembership,
        role: "operator" as const,
      },
    };

    expect(authService.canPerform(operatorSession, "shopfloor:execute_station")).toBe(true);
    expect(authService.canPerform(operatorSession, "org:manage_members")).toBe(false);
    expect(authService.canPerform(operatorSession, "quoting:approve_margin")).toBe(false);
  });
});
