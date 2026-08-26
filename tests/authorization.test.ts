import { describe, expect, it, beforeEach } from "bun:test";
import { AuthorizationService, AuthorizationError } from "../modules/core/application/authorization-service";
import { IdentityService } from "../modules/core/application/identity-service";
import { Capability } from "../modules/core/domain/capabilities";
import { MembershipRole } from "../modules/core/domain/types";

describe("Authorization & Capability Policies", () => {
  let authService: AuthorizationService;
  let identityService: IdentityService;

  beforeEach(() => {
    authService = new AuthorizationService();
    identityService = new IdentityService();
  });

  it("grants full capabilities to organization owner", () => {
    const { user } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Test Factory",
      organizationSlug: "test-factory",
    });

    const session = identityService.getSessionContext(user.id);
    expect(authService.canPerform(session, "org:manage_profile")).toBe(true);
    expect(authService.canPerform(session, "quoting:approve_margin")).toBe(true);
    expect(authService.canPerform(session, "quality:scrap_rework")).toBe(true);

    expect(() => {
      authService.requireCapability(session, "org:manage_roles");
    }).not.toThrow();
  });

  it("restricts operator role to station execution and denies administrative capabilities", async () => {
    const { user: owner, organization: org } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Test Factory",
      organizationSlug: "test-factory",
    });

    const invite = await identityService.createInvitation({
      actorUserId: owner.id,
      organizationId: org.id,
      email: "operator@shopfloor.dev",
      role: "operator",
    });

    const { user: operator } = identityService.acceptInvitation(invite.token, "Operator Jack");
    const session = identityService.getSessionContext(operator.id);

    // Operator has shopfloor station capabilities
    expect(authService.canPerform(session, "shopfloor:execute_station")).toBe(true);
    expect(authService.canPerform(session, "inventory:view_stock")).toBe(true);

    // Operator is denied admin and financial capabilities (Deny by default)
    expect(authService.canPerform(session, "org:manage_members")).toBe(false);
    expect(authService.canPerform(session, "quoting:approve_margin")).toBe(false);
    expect(authService.canPerform(session, "org:manage_roles")).toBe(false);

    expect(() => {
      authService.requireCapability(session, "org:manage_members");
    }).toThrow(AuthorizationError);
  });

  it("enforces tenant boundary inside capability checks", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    expect(() => {
      authService.requireCapability(session, "inventory:view_stock", "foreign_org_id_999");
    }).toThrow("Cross-Tenant Violation");
  });

  it("supports dynamic capability overrides with actor permission check", () => {
    const { user: owner, organization: org } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const customCaps: Capability[] = ["inventory:view_stock", "inventory:adjust_count"];
    authService.setRoleCapabilities(session, org.id, "custom_role", customCaps);

    const dummyMem = {
      id: "mem_1",
      organizationId: org.id,
      userId: "usr_1",
      role: "custom_role" as unknown as MembershipRole,
      createdAt: "",
      updatedAt: "",
    };

    expect(authService.hasCapability(dummyMem, "inventory:adjust_count")).toBe(true);
    expect(authService.hasCapability(dummyMem, "org:manage_roles")).toBe(false); // Denied
  });
});
