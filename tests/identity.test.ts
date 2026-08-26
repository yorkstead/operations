import { describe, expect, it, beforeEach } from "bun:test";
import { IdentityService } from "../modules/core/application/identity-service";
import { SyntheticEmailAdapter } from "../modules/core/domain/ports/email-port";

describe("Core Organizations & Identity Management", () => {
  let emailAdapter: SyntheticEmailAdapter;
  let identityService: IdentityService;

  beforeEach(() => {
    emailAdapter = new SyntheticEmailAdapter();
    identityService = new IdentityService(emailAdapter);
  });

  it("bootstraps the initial global owner and primary organization", () => {
    const { user, organization, membership } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Brandon York",
      organizationName: "Front Range Manufacturing",
      organizationSlug: "front-range-mfg",
    });

    expect(user.id).toBeDefined();
    expect(user.isGlobalOwner).toBe(true);
    expect(organization.slug).toBe("front-range-mfg");
    expect(membership.role).toBe("owner");

    // Guardrail test: Re-bootstrapping must fail
    expect(() => {
      identityService.bootstrapOwner({
        email: "intruder@evil.com",
        name: "Intruder",
        organizationName: "Hacked Org",
        organizationSlug: "hacked",
      });
    }).toThrow("System already bootstrapped");
  });

  it("handles team invitation lifecycle and token acceptance", async () => {
    const { user: owner, organization: org } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Brandon York",
      organizationName: "Front Range Manufacturing",
      organizationSlug: "front-range-mfg",
    });

    const invitation = await identityService.createInvitation({
      actorUserId: owner.id,
      organizationId: org.id,
      email: "operator@shopfloor.dev",
      role: "operator",
      expiresInHours: 48,
    });

    expect(invitation.status).toBe("pending");
    expect(emailAdapter.sentMessages.length).toBe(1);
    expect(emailAdapter.sentMessages[0].to).toBe("operator@shopfloor.dev");

    // Accept invitation
    const { user: newMember, membership: newMembership } = identityService.acceptInvitation(
      invitation.token,
      "Shop Operator"
    );

    expect(newMember.email).toBe("operator@shopfloor.dev");
    expect(newMembership.role).toBe("operator");
    expect(newMembership.organizationId).toBe(org.id);

    // Re-acceptance must fail
    expect(() => {
      identityService.acceptInvitation(invitation.token, "Duplicate");
    }).toThrow("Invitation is no longer valid");
  });

  it("enforces tenant boundary isolation and rejects cross-tenant operations", () => {
    const { user: owner1, organization: org1 } = identityService.bootstrapOwner({
      email: "owner1@yorkstead.com",
      name: "Owner One",
      organizationName: "Org Alpha",
      organizationSlug: "org-alpha",
    });

    const org2 = identityService.createOrganization(owner1.id, "Org Beta", "org-beta");

    const sessionAlpha = identityService.getSessionContext(owner1.id);
    expect(sessionAlpha.activeOrganization.id).toBe(org2.id); // newly created became active

    // Switch to org1
    const session1 = identityService.switchActiveOrganization(owner1.id, org1.id);
    expect(session1.activeOrganization.id).toBe(org1.id);

    // Assert boundary: Active org1 access to org1 passes
    expect(() => {
      identityService.assertTenantAccess(session1, org1.id);
    }).not.toThrow();

    // Assert boundary: Active org1 access to org2 throws cross-tenant violation
    expect(() => {
      identityService.assertTenantAccess(session1, org2.id);
    }).toThrow("Cross-Tenant Isolation Violation");
  });

  it("rejects authentication for disabled accounts", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Org Alpha",
      organizationSlug: "org-alpha",
    });

    identityService.disableUser(owner.id, owner.id);

    expect(() => {
      identityService.getSessionContext(owner.id);
    }).toThrow("Unauthorized");
  });
});
