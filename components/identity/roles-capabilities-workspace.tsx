'use client';

import * as React from "react";
import { ALL_CAPABILITIES, Capability, ROLE_CAPABILITIES_MAP } from "@/modules/core/domain/capabilities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export function RolesCapabilitiesWorkspace() {
  const [selectedRole, setSelectedRole] = React.useState<string>("manager");
  const [capabilitiesMap, setCapabilitiesMap] = React.useState<Record<string, Capability[]>>({
    ...ROLE_CAPABILITIES_MAP,
  });
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const roles = ["owner", "admin", "manager", "operator", "viewer", "demo_visitor"];
  const currentRoleCaps = capabilitiesMap[selectedRole] || [];

  const toggleCapability = (cap: Capability) => {
    if (selectedRole === "owner") {
      setFeedback("Owner capabilities cannot be restricted.");
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const has = currentRoleCaps.includes(cap);
    const updated = has
      ? currentRoleCaps.filter((c) => c !== cap)
      : [...currentRoleCaps, cap];

    setCapabilitiesMap({
      ...capabilitiesMap,
      [selectedRole]: updated,
    });

    setFeedback(`Updated ${selectedRole.toUpperCase()} permissions.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="default">CORE//AUTHORIZATION</Badge>
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Role-Based Capability Matrix
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Roles & Capability Policies
        </h1>
        <p className="text-sm text-muted-foreground">
          Enforce granular least-privilege capability controls across all operational modules. Deny by default.
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {roles.map((role) => (
          <Button
            key={role}
            variant={selectedRole === role ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedRole(role)}
            className="font-mono text-xs uppercase"
          >
            {role}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <CardTitle className="text-base capitalize">{selectedRole} Role Summary</CardTitle>
            </div>
            <CardDescription>
              {selectedRole === "owner" && "Full administrative control and irreversible tenant governance."}
              {selectedRole === "admin" && "Complete operational management and membership invitation rights."}
              {selectedRole === "manager" && "Shopfloor dispatch, inventory counts, quote approvals, and quality."}
              {selectedRole === "operator" && "Station execution, digital travelers, inspection logs, and stock checks."}
              {selectedRole === "viewer" && "Read-only access to traveler views and metrics."}
              {selectedRole === "demo_visitor" && "Interactive sandbox with simulated external effects."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total Granted Capabilities</span>
              <p className="font-mono text-2xl font-bold text-primary">{currentRoleCaps.length} / {ALL_CAPABILITIES.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/50 p-3 text-xs text-muted-foreground space-y-1">
              <span className="font-mono text-[10px] uppercase font-semibold text-foreground">Policy Rule:</span>
              <p>Capabilities are evaluated server-side on every query and mutation. Hidden UI controls never substitute for server authorization.</p>
            </div>
          </CardContent>
        </Card>

        {/* Capability Checkbox Matrix */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Assigned Capabilities</CardTitle>
            <CardDescription>Toggle specific operational permissions for this role.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {ALL_CAPABILITIES.map((cap) => {
                const isGranted = currentRoleCaps.includes(cap);
                const isOwnerRole = selectedRole === "owner";

                return (
                  <div
                    key={cap}
                    onClick={() => !isOwnerRole && toggleCapability(cap)}
                    className={`flex items-center justify-between rounded-lg border p-3 transition cursor-pointer ${
                      isGranted
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border bg-card/40 text-muted-foreground opacity-60 hover:opacity-100"
                    } ${isOwnerRole ? "cursor-not-allowed" : ""}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-semibold">{cap}</span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {isGranted ? "Granted" : "Denied (Default)"}
                      </span>
                    </div>

                    {isOwnerRole ? (
                      <Lock className="size-3.5 text-muted-foreground" />
                    ) : (
                      <input
                        type="checkbox"
                        checked={isGranted}
                        readOnly
                        className="size-4 accent-primary"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
