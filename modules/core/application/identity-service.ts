import {
  User,
  Organization,
  Membership,
  Invitation,
  MembershipRole,
  SessionContext,
} from "../domain/types";
import { EmailPort, SyntheticEmailAdapter } from "../domain/ports/email-port";

export class IdentityService {
  private users: Map<string, User> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private memberships: Map<string, Membership> = new Map();
  private invitations: Map<string, Invitation> = new Map();
  private activeOrgSessions: Map<string, string> = new Map(); // userId -> activeOrgId
  private emailAdapter: EmailPort;

  constructor(emailAdapter?: EmailPort) {
    this.emailAdapter = emailAdapter || new SyntheticEmailAdapter();
  }

  // 1. Owner Bootstrap
  bootstrapOwner(params: {
    email: string;
    name: string;
    organizationName: string;
    organizationSlug: string;
  }): { user: User; organization: Organization; membership: Membership } {
    // Single bootstrap guardrail: If global owner already exists, reject public owner creation
    const existingOwner = Array.from(this.users.values()).find((u) => u.isGlobalOwner);
    if (existingOwner) {
      throw new Error("System already bootstrapped. Further users must be invited.");
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const membershipId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const user: User = {
      id: userId,
      email: params.email.toLowerCase().trim(),
      name: params.name.trim(),
      status: "active",
      isGlobalOwner: true,
      createdAt: now,
      updatedAt: now,
    };

    const organization: Organization = {
      id: orgId,
      name: params.organizationName.trim(),
      slug: params.organizationSlug.toLowerCase().trim(),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const membership: Membership = {
      id: membershipId,
      organizationId: orgId,
      userId: userId,
      role: "owner",
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(userId, user);
    this.organizations.set(orgId, organization);
    this.memberships.set(membershipId, membership);
    this.activeOrgSessions.set(userId, orgId);

    return { user, organization, membership };
  }

  // 2. Organization Management
  createOrganization(actorUserId: string, name: string, slug: string): Organization {
    const actor = this.users.get(actorUserId);
    if (!actor || actor.status !== "active") {
      throw new Error("Unauthorized: Invalid or disabled user account.");
    }

    const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const organization: Organization = {
      id: orgId,
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const membershipId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const membership: Membership = {
      id: membershipId,
      organizationId: orgId,
      userId: actorUserId,
      role: "owner",
      createdAt: now,
      updatedAt: now,
    };

    this.organizations.set(orgId, organization);
    this.memberships.set(membershipId, membership);
    this.activeOrgSessions.set(actorUserId, orgId);

    return organization;
  }

  // 3. Invitations & Role Capabilities
  async createInvitation(params: {
    actorUserId: string;
    organizationId: string;
    email: string;
    role: MembershipRole;
    expiresInHours?: number;
  }): Promise<Invitation> {
    const actorMembership = Array.from(this.memberships.values()).find(
      (m) => m.userId === params.actorUserId && m.organizationId === params.organizationId
    );

    if (!actorMembership || !["owner", "admin"].includes(actorMembership.role)) {
      throw new Error("Forbidden: Only organization owners and administrators can invite members.");
    }

    const org = this.organizations.get(params.organizationId);
    if (!org || org.status !== "active") {
      throw new Error("Target organization is inactive or not found.");
    }

    const token = `inv_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const inviteId = `inv_id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + (params.expiresInHours || 48) * 3600 * 1000);

    const invitation: Invitation = {
      id: inviteId,
      organizationId: params.organizationId,
      email: params.email.toLowerCase().trim(),
      role: params.role,
      token,
      status: "pending",
      invitedByUserId: params.actorUserId,
      expiresAt: expiry.toISOString(),
      createdAt: now.toISOString(),
    };

    this.invitations.set(token, invitation);

    await this.emailAdapter.sendEmail({
      to: invitation.email,
      subject: `Invitation to join ${org.name} on Yorkstead Operations`,
      htmlBody: `<p>You have been invited to join <strong>${org.name}</strong> as <strong>${params.role}</strong>.</p><p>Accept your invitation: <a href="https://ops.yorkstead.com/invite/${token}">Accept Invitation</a></p>`,
      textBody: `You have been invited to join ${org.name} as ${params.role}. Accept: https://ops.yorkstead.com/invite/${token}`,
    });

    return invitation;
  }

  // 4. Accept Invitation
  acceptInvitation(token: string, userName: string): { user: User; organization: Organization; membership: Membership } {
    const invitation = this.invitations.get(token);
    if (!invitation) {
      throw new Error("Invalid or unlocated invitation token.");
    }

    if (invitation.status !== "pending") {
      throw new Error(`Invitation is no longer valid (Status: ${invitation.status}).`);
    }

    const now = new Date();
    if (new Date(invitation.expiresAt) < now) {
      invitation.status = "expired";
      throw new Error("Invitation token has expired.");
    }

    let user = Array.from(this.users.values()).find((u) => u.email === invitation.email);
    if (!user) {
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      user = {
        id: userId,
        email: invitation.email,
        name: userName.trim(),
        status: "active",
        isGlobalOwner: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      this.users.set(userId, user);
    } else if (user.status === "disabled") {
      throw new Error("Cannot accept invitation with a disabled account.");
    }

    const org = this.organizations.get(invitation.organizationId);
    if (!org || org.status !== "active") {
      throw new Error("Organization is inactive or deleted.");
    }

    const membershipId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const membership: Membership = {
      id: membershipId,
      organizationId: org.id,
      userId: user.id,
      role: invitation.role,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.memberships.set(membershipId, membership);
    this.activeOrgSessions.set(user.id, org.id);

    invitation.status = "accepted";
    invitation.acceptedAt = now.toISOString();

    return { user, organization: org, membership };
  }

  // 5. Session Context & Active Organization Switcher
  getSessionContext(userId: string): SessionContext {
    const user = this.users.get(userId);
    if (!user || user.status !== "active") {
      throw new Error("Unauthorized: Active user session required.");
    }

    const userMemberships = Array.from(this.memberships.values()).filter(
      (m) => m.userId === userId
    );

    if (userMemberships.length === 0) {
      throw new Error("User has no active organization memberships.");
    }

    const activeOrgId = this.activeOrgSessions.get(userId) || userMemberships[0].organizationId;
    const activeMembership = userMemberships.find((m) => m.organizationId === activeOrgId) || userMemberships[0];
    const activeOrg = this.organizations.get(activeMembership.organizationId);

    if (!activeOrg || activeOrg.status !== "active") {
      throw new Error("Active organization is unavailable.");
    }

    const allMemberships = userMemberships.map((m) => ({
      membership: m,
      organization: this.organizations.get(m.organizationId)!,
    })).filter((item) => item.organization && item.organization.status === "active");

    return {
      user,
      activeOrganization: activeOrg,
      currentMembership: activeMembership,
      allMemberships,
    };
  }

  switchActiveOrganization(userId: string, targetOrgId: string): SessionContext {
    const user = this.users.get(userId);
    if (!user || user.status !== "active") {
      throw new Error("Unauthorized: Invalid user.");
    }

    const membership = Array.from(this.memberships.values()).find(
      (m) => m.userId === userId && m.organizationId === targetOrgId
    );

    if (!membership) {
      throw new Error("Forbidden: User is not a member of the target organization.");
    }

    const org = this.organizations.get(targetOrgId);
    if (!org || org.status !== "active") {
      throw new Error("Target organization is inactive.");
    }

    this.activeOrgSessions.set(userId, targetOrgId);
    return this.getSessionContext(userId);
  }

  // 6. Membership Removal & Account Lifecycle
  removeMembership(actorUserId: string, organizationId: string, targetUserId: string): void {
    const actorMembership = Array.from(this.memberships.values()).find(
      (m) => m.userId === actorUserId && m.organizationId === organizationId
    );

    if (!actorMembership || !["owner", "admin"].includes(actorMembership.role)) {
      throw new Error("Forbidden: Only owners and administrators can remove members.");
    }

    const targetMembership = Array.from(this.memberships.values()).find(
      (m) => m.userId === targetUserId && m.organizationId === organizationId
    );

    if (!targetMembership) {
      throw new Error("Target membership not found.");
    }

    if (targetMembership.role === "owner" && actorMembership.role !== "owner") {
      throw new Error("Forbidden: Administrators cannot remove the organization owner.");
    }

    this.memberships.delete(targetMembership.id);

    // If target was currently active on this org, reset active org
    if (this.activeOrgSessions.get(targetUserId) === organizationId) {
      const remaining = Array.from(this.memberships.values()).find((m) => m.userId === targetUserId);
      if (remaining) {
        this.activeOrgSessions.set(targetUserId, remaining.organizationId);
      } else {
        this.activeOrgSessions.delete(targetUserId);
      }
    }
  }

  disableUser(actorUserId: string, targetUserId: string): void {
    const actor = this.users.get(actorUserId);
    if (!actor || !actor.isGlobalOwner) {
      throw new Error("Forbidden: Only global system owners can disable user accounts.");
    }

    const target = this.users.get(targetUserId);
    if (!target) {
      throw new Error("User not found.");
    }

    target.status = "disabled";
    target.updatedAt = new Date().toISOString();
    this.activeOrgSessions.delete(targetUserId);
  }

  // 7. Strict Tenant Boundary Assertion
  assertTenantAccess(context: SessionContext, resourceOrganizationId: string): void {
    if (context.activeOrganization.id !== resourceOrganizationId) {
      throw new Error(
        `Cross-Tenant Isolation Violation: Active org (${context.activeOrganization.id}) does not match resource org (${resourceOrganizationId}).`
      );
    }
  }
}

export const identityService = new IdentityService();
