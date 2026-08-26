'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, ShieldCheck, UserPlus, Trash2, CheckCircle2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "operator" | "viewer";
  status: "active" | "disabled";
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
}

export function OrganizationWorkspace() {
  const [members, setMembers] = React.useState<Member[]>([
    { id: "usr_1", name: "Brandon York", email: "brandon@yorkstead.com", role: "owner", status: "active" },
    { id: "usr_2", name: "Alex Mercer", email: "alex.mercer@synthetic.dev", role: "admin", status: "active" },
    { id: "usr_3", name: "Dana Scully", email: "dana.scully@synthetic.dev", role: "operator", status: "active" },
  ]);

  const [invites, setInvites] = React.useState<Invite[]>([
    { id: "inv_1", email: "operations.lead@partner.dev", role: "manager", status: "pending", expiresAt: "in 48 hours" },
  ]);

  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"admin" | "manager" | "operator" | "viewer">("operator");
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newInvite: Invite = {
      id: `inv_${Date.now()}`,
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "pending",
      expiresAt: "in 48 hours",
    };

    setInvites([...invites, newInvite]);
    setInviteEmail("");
    setFeedback(`Invitation dispatched to ${newInvite.email} via neutral email port.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((m) => m.id !== memberId));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">CORE//IDENTITY</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Tenant & Membership Management
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Organization & Team Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage tenant profile, role capabilities, secure member invitations, and organization access boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <a href="/settings/roles">
              <ShieldCheck className="mr-2 size-3.5 text-primary" />
              Role Policies
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/settings/configuration">
              <ShieldCheck className="mr-2 size-3.5 text-primary" />
              Module Entitlements
            </a>
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Organization Profile & Invite Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="size-5" />
                <CardTitle className="text-base">Tenant Boundary</CardTitle>
              </div>
              <CardDescription>Active organization profile and isolation context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Organization Name</span>
                <p className="font-mono text-sm font-semibold text-foreground">Front Range Manufacturing</p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tenant Slug</span>
                <p className="font-mono text-xs text-primary">front-range-mfg</p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Isolation Mode</span>
                <p className="font-mono text-xs text-muted-foreground">Server-Enforced `organization_id` Filter</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <UserPlus className="size-5" />
                <CardTitle className="text-base">Invite Team Member</CardTitle>
              </div>
              <CardDescription>Issue time-bound cryptographically secured invitation.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSendInvite} className="space-y-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "manager" | "operator" | "viewer")}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="admin">Administrator (Full tenant admin)</option>
                    <option value="manager">Manager (Shopfloor & Workflow)</option>
                    <option value="operator">Operator (Work station execution)</option>
                    <option value="viewer">Viewer (Read-only observation)</option>
                  </select>
                </div>
                <Button type="submit" variant="default" className="w-full">
                  <Mail className="mr-2 size-3.5" />
                  Send Invitation
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Members and Pending Invites */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Users className="size-5" />
                  <CardTitle className="text-base">Active Members ({members.length})</CardTitle>
                </div>
              </div>
              <CardDescription>Verified users with active organization roles.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-border">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-foreground">{member.name}</span>
                        <Badge variant={member.role === "owner" ? "default" : "secondary"} className="text-[9px]">
                          {member.role.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">{member.email}</span>
                    </div>

                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        aria-label={`Remove ${member.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {invites.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <Mail className="size-5" />
                  <CardTitle className="text-base">Pending Invitations ({invites.length})</CardTitle>
                </div>
                <CardDescription>Unaccepted tokens expiring within 48 hours.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between py-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-foreground">{invite.email}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Role: {invite.role.toUpperCase()} &bull; Expires {invite.expiresAt}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">PENDING</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
