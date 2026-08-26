export type MembershipRole =
  | "owner"
  | "admin"
  | "manager"
  | "operator"
  | "viewer"
  | "demo_visitor";

export type OrgStatus = "active" | "suspended" | "archived";
export type UserStatus = "active" | "disabled";
export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export interface User {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  isGlobalOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: MembershipRole;
  token: string;
  status: InviteStatus;
  invitedByUserId: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface SessionContext {
  user: User;
  activeOrganization: Organization;
  currentMembership: Membership;
  allMemberships: {
    membership: Membership;
    organization: Organization;
  }[];
}
