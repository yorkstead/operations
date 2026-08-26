import { Capability, ROLE_CAPABILITIES_MAP } from "../domain/capabilities";
import { Membership, SessionContext } from "../domain/types";

export class AuthorizationError extends Error {
  public readonly capability: Capability;
  public readonly organizationId: string;

  constructor(capability: Capability, organizationId: string, message?: string) {
    super(
      message ||
        `Access Denied: Missing required capability '${capability}' for organization ${organizationId}.`
    );
    this.name = "AuthorizationError";
    this.capability = capability;
    this.organizationId = organizationId;
  }
}

export class AuthorizationService {
  // Store custom org-level capability overrides: `${orgId}:${role}` -> Set<Capability>
  private orgRoleOverrides: Map<string, Set<Capability>> = new Map();

  getCapabilitiesForMembership(membership: Membership): Capability[] {
    const overrideKey = `${membership.organizationId}:${membership.role}`;
    const overrides = this.orgRoleOverrides.get(overrideKey);

    if (overrides) {
      return Array.from(overrides);
    }

    // Default to static mapping or empty set (deny by default)
    return ROLE_CAPABILITIES_MAP[membership.role] || [];
  }

  hasCapability(membership: Membership, capability: Capability): boolean {
    const capabilities = this.getCapabilitiesForMembership(membership);
    return capabilities.includes(capability);
  }

  canPerform(session: SessionContext, capability: Capability): boolean {
    if (!session || !session.currentMembership) return false;
    return this.hasCapability(session.currentMembership, capability);
  }

  requireCapability(
    session: SessionContext,
    capability: Capability,
    resourceOrganizationId?: string
  ): void {
    if (!session || !session.user || session.user.status !== "active") {
      throw new Error("Unauthorized: Active user session required.");
    }

    const targetOrgId = resourceOrganizationId || session.activeOrganization.id;

    // 1. Tenant boundary check
    if (session.activeOrganization.id !== targetOrgId) {
      throw new Error(
        `Cross-Tenant Violation: Active organization (${session.activeOrganization.id}) does not match resource organization (${targetOrgId}).`
      );
    }

    // 2. Capability check (Deny by default)
    if (!this.hasCapability(session.currentMembership, capability)) {
      throw new AuthorizationError(capability, targetOrgId);
    }
  }

  setRoleCapabilities(
    actorSession: SessionContext,
    organizationId: string,
    role: string,
    capabilities: Capability[]
  ): void {
    // Requires org:manage_roles capability
    this.requireCapability(actorSession, "org:manage_roles", organizationId);

    const overrideKey = `${organizationId}:${role}`;
    this.orgRoleOverrides.set(overrideKey, new Set(capabilities));
  }
}

export const authorizationService = new AuthorizationService();
