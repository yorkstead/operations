import { eq, and } from "drizzle-orm";
import { getDb } from "@/db";
import { users, organizations, memberships, auditEvents } from "@/db/schema";
import { User, Organization, Membership, MembershipRole, SessionContext } from "../domain/types";

export class IdentityRepository {
  private memoryUsers: Map<string, User> = new Map();
  private memoryOrganizations: Map<string, Organization> = new Map();
  private memoryMemberships: Map<string, Membership> = new Map();
  private isMemoryMode: boolean = false;

  constructor(forceMemoryMode = false) {
    this.isMemoryMode = forceMemoryMode;
  }

  setMemoryMode(enabled: boolean) {
    this.isMemoryMode = enabled;
  }

  // 1. Owner Bootstrap
  async bootstrapOwner(params: {
    email: string;
    name: string;
    organizationName: string;
    organizationSlug: string;
  }): Promise<{ user: User; organization: Organization; membership: Membership }> {
    const cleanEmail = params.email.toLowerCase().trim();
    const cleanName = params.name.trim();
    const cleanOrgName = params.organizationName.trim();
    const cleanOrgSlug = params.organizationSlug.toLowerCase().trim();
    const now = new Date().toISOString();

    if (this.isMemoryMode) {
      const existingOwner = Array.from(this.memoryUsers.values()).find((u) => u.isGlobalOwner);
      if (existingOwner) {
        throw new Error("System already bootstrapped. Further users must be invited.");
      }

      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const membershipId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const user: User = {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        status: "active",
        isGlobalOwner: true,
        createdAt: now,
        updatedAt: now,
      };

      const organization: Organization = {
        id: orgId,
        name: cleanOrgName,
        slug: cleanOrgSlug,
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

      this.memoryUsers.set(userId, user);
      this.memoryOrganizations.set(orgId, organization);
      this.memoryMemberships.set(membershipId, membership);

      return { user, organization, membership };
    }

    try {
      const db = getDb();

      // Guardrail: Check if any owner or organization already exists in PostgreSQL
      const existing = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.isDemo, false))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("System already bootstrapped. Further users must be invited.");
      }

      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const membershipId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Insert User
      await db.insert(users).values({
        id: userId,
        name: cleanName,
        email: cleanEmail,
        emailVerified: true,
      });

      // Insert Organization
      await db.insert(organizations).values({
        id: orgId,
        name: cleanOrgName,
        slug: cleanOrgSlug,
        status: "active",
        isDemo: false,
      });

      // Insert Owner Membership
      await db.insert(memberships).values({
        id: membershipId,
        organizationId: orgId,
        userId: userId,
        role: "owner",
      });

      // Insert Audit Event
      await db.insert(auditEvents).values({
        id: `aud_${Date.now()}`,
        organizationId: orgId,
        actorId: userId,
        actorName: cleanName,
        entityType: "organization",
        entityId: orgId,
        action: "identity.owner_bootstrapped",
        summary: `Initial owner ${cleanName} (<${cleanEmail}>) bootstrapped organization ${cleanOrgName}.`,
        metadata: { organizationSlug: cleanOrgSlug },
      });

      const user: User = {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        status: "active",
        isGlobalOwner: true,
        createdAt: now,
        updatedAt: now,
      };

      const organization: Organization = {
        id: orgId,
        name: cleanOrgName,
        slug: cleanOrgSlug,
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

      return { user, organization, membership };
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error("Persistent owner bootstrap failed.");
    }
  }

  // 2. Find User
  async findUserById(userId: string): Promise<User | null> {
    if (this.isMemoryMode) {
      return this.memoryUsers.get(userId) || null;
    }

    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];

      return {
        id: r.id,
        email: r.email,
        name: r.name,
        status: "active",
        isGlobalOwner: true,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error("Persistent user lookup failed.");
    }
  }

  // 3. Get Memberships for User
  async getMembershipsForUser(userId: string): Promise<{ membership: Membership; organization: Organization }[]> {
    if (this.isMemoryMode) {
      const userMems = Array.from(this.memoryMemberships.values()).filter((m) => m.userId === userId);
      const list: { membership: Membership; organization: Organization }[] = [];
      for (const m of userMems) {
        const org = this.memoryOrganizations.get(m.organizationId);
        if (org && org.status === "active") {
          list.push({ membership: m, organization: org });
        }
      }
      return list;
    }

    try {
      const db = getDb();
      const rows = await db
        .select({
          membershipId: memberships.id,
          organizationId: memberships.organizationId,
          userId: memberships.userId,
          role: memberships.role,
          memCreatedAt: memberships.createdAt,
          memUpdatedAt: memberships.updatedAt,
          orgId: organizations.id,
          orgName: organizations.name,
          orgSlug: organizations.slug,
          orgStatus: organizations.status,
          orgIsDemo: organizations.isDemo,
          orgCreatedAt: organizations.createdAt,
          orgUpdatedAt: organizations.updatedAt,
        })
        .from(memberships)
        .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
        .where(and(eq(memberships.userId, userId), eq(organizations.status, "active")));

      return rows.map((r) => ({
        membership: {
          id: r.membershipId,
          organizationId: r.organizationId,
          userId: r.userId,
          role: r.role as MembershipRole,
          createdAt: r.memCreatedAt.toISOString(),
          updatedAt: r.memUpdatedAt.toISOString(),
        },
        organization: {
          id: r.orgId,
          name: r.orgName,
          slug: r.orgSlug,
          status: r.orgStatus as "active" | "suspended" | "archived",
          isDemo: r.orgIsDemo,
          createdAt: r.orgCreatedAt.toISOString(),
          updatedAt: r.orgUpdatedAt.toISOString(),
        },
      }));
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error("Persistent membership lookup failed.");
    }
  }

  // 4. Resolve Server Session Context
  async resolveSessionContext(userId: string, requestedOrgId?: string): Promise<SessionContext> {
    const user = await this.findUserById(userId);
    if (!user || user.status !== "active") {
      throw new Error("Unauthorized: Invalid or disabled user account.");
    }

    const allMemberships = await this.getMembershipsForUser(userId);
    if (allMemberships.length === 0) {
      throw new Error("User has no active organization memberships.");
    }

    let activePair = allMemberships[0];

    if (requestedOrgId) {
      const matched = allMemberships.find((m) => m.organization.id === requestedOrgId);
      if (!matched) {
        throw new Error(`Forbidden: User is not an active member of requested organization (${requestedOrgId}).`);
      }
      activePair = matched;
    }

    return {
      user,
      activeOrganization: activePair.organization,
      currentMembership: activePair.membership,
      allMemberships,
    };
  }

  // 5. Create Organization
  async createOrganization(actorUserId: string, name: string, slug: string): Promise<Organization> {
    const user = await this.findUserById(actorUserId);
    if (!user || user.status !== "active") {
      throw new Error("Unauthorized: Invalid or disabled user account.");
    }

    const orgId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const membershipId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const organization: Organization = {
      id: orgId,
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const membership: Membership = {
      id: membershipId,
      organizationId: orgId,
      userId: actorUserId,
      role: "owner",
      createdAt: now,
      updatedAt: now,
    };

    if (this.isMemoryMode) {
      this.memoryOrganizations.set(orgId, organization);
      this.memoryMemberships.set(membershipId, membership);
      return organization;
    }

    try {
      const db = getDb();
      await db.insert(organizations).values({
        id: orgId,
        name: organization.name,
        slug: organization.slug,
        status: "active",
        isDemo: false,
      });

      await db.insert(memberships).values({
        id: membershipId,
        organizationId: orgId,
        userId: actorUserId,
        role: "owner",
      });

      await db.insert(auditEvents).values({
        id: `aud_${Date.now()}`,
        organizationId: orgId,
        actorId: actorUserId,
        actorName: user.name,
        entityType: "organization",
        entityId: orgId,
        action: "identity.organization_created",
        summary: `User ${user.name} created organization ${organization.name}.`,
      });

      return organization;
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error("Persistent organization creation failed.");
    }
  }

  // 6. Remove Membership
  async removeMembership(actorUserId: string, organizationId: string, targetUserId: string): Promise<void> {
    const actorMems = await this.getMembershipsForUser(actorUserId);
    const actorMem = actorMems.find((m) => m.organization.id === organizationId)?.membership;

    if (!actorMem || !["owner", "admin"].includes(actorMem.role)) {
      throw new Error("Forbidden: Only owners and administrators can remove members.");
    }

    const targetMems = await this.getMembershipsForUser(targetUserId);
    const targetMem = targetMems.find((m) => m.organization.id === organizationId)?.membership;

    if (!targetMem) {
      throw new Error("Target membership not found.");
    }

    if (targetMem.role === "owner" && actorMem.role !== "owner") {
      throw new Error("Forbidden: Administrators cannot remove the organization owner.");
    }

    if (this.isMemoryMode) {
      this.memoryMemberships.delete(targetMem.id);
      return;
    }

    try {
      const db = getDb();
      await db
        .delete(memberships)
        .where(and(eq(memberships.organizationId, organizationId), eq(memberships.userId, targetUserId)));

      await db.insert(auditEvents).values({
        id: `aud_${Date.now()}`,
        organizationId: organizationId,
        actorId: actorUserId,
        actorName: "Administrator",
        entityType: "membership",
        entityId: targetMem.id,
        action: "identity.membership_removed",
        summary: `Membership for user ${targetUserId} was removed from organization ${organizationId}.`,
      });
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error("Persistent membership removal failed.");
    }
  }

  // 7. Get Tenant 0 (Yorkstead Systems)
  async getTenantZero(): Promise<{ organization: Organization; owner: User; membership: Membership } | null> {
    if (this.isMemoryMode) {
      const org = Array.from(this.memoryOrganizations.values()).find(
        (o) => o.slug === "yorkstead" || o.id === "org_yorkstead_systems"
      );
      if (!org) return null;
      const user = Array.from(this.memoryUsers.values()).find(
        (u) => u.email === "brandon@yorkstead.com" || u.id === "usr_brandon_operator"
      );
      if (!user) return null;
      const mem = Array.from(this.memoryMemberships.values()).find(
        (m) => m.organizationId === org.id && m.userId === user.id
      );
      if (!mem) return null;
      return { organization: org, owner: user, membership: mem };
    }

    try {
      const db = getDb();
      const orgRows = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, "yorkstead"))
        .limit(1);

      if (orgRows.length === 0) return null;
      const orgRow = orgRows[0];

      const memRows = await db
        .select({
          membershipId: memberships.id,
          role: memberships.role,
          memCreatedAt: memberships.createdAt,
          memUpdatedAt: memberships.updatedAt,
          userId: users.id,
          userName: users.name,
          userEmail: users.email,
          userCreatedAt: users.createdAt,
          userUpdatedAt: users.updatedAt,
        })
        .from(memberships)
        .innerJoin(users, eq(memberships.userId, users.id))
        .where(and(eq(memberships.organizationId, orgRow.id), eq(memberships.role, "owner")))
        .limit(1);

      if (memRows.length === 0) return null;
      const memRow = memRows[0];

      return {
        organization: {
          id: orgRow.id,
          name: orgRow.name,
          slug: orgRow.slug,
          status: orgRow.status as "active" | "suspended" | "archived",
          isDemo: orgRow.isDemo,
          createdAt: orgRow.createdAt.toISOString(),
          updatedAt: orgRow.updatedAt.toISOString(),
        },
        owner: {
          id: memRow.userId,
          name: memRow.userName,
          email: memRow.userEmail,
          status: "active",
          isGlobalOwner: true,
          createdAt: memRow.userCreatedAt.toISOString(),
          updatedAt: memRow.userUpdatedAt.toISOString(),
        },
        membership: {
          id: memRow.membershipId,
          organizationId: orgRow.id,
          userId: memRow.userId,
          role: memRow.role as MembershipRole,
          createdAt: memRow.memCreatedAt.toISOString(),
          updatedAt: memRow.memUpdatedAt.toISOString(),
        },
      };
    } catch (err: unknown) {
      throw err instanceof Error ? err : new Error("Persistent Tenant 0 lookup failed.");
    }
  }
}

export const identityRepository = new IdentityRepository();
