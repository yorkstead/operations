'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, ShieldCheck, FileText, UserCheck } from "lucide-react";

interface ActivityItem {
  id: string;
  actorName: string;
  action: string;
  summary: string;
  entityType: "organization" | "membership" | "file" | "audit" | "system";
  timeAgo: string;
}

export function ActivityFeed() {
  const [activities] = React.useState<ActivityItem[]>([
    {
      id: "act_1",
      actorName: "Brandon York",
      action: "shipping.manifest_delivered",
      summary: "Signed Proof of Delivery recorded for SHP-2026-088 (Alpine Aerospace Systems).",
      entityType: "system",
      timeAgo: "6h ago",
    },
    {
      id: "act_2",
      actorName: "Brandon York",
      action: "packaging.container_sealed",
      summary: "Sealed Heavy Duty Crate PKG-2026-042 (48 avionics chassis units, Gross 405 lbs).",
      entityType: "system",
      timeAgo: "18h ago",
    },
    {
      id: "act_3",
      actorName: "Brandon York",
      action: "quality.ncr_closed",
      summary: "NCR-2026-012 closed: re-struck on calibrated press brake with 100% CMM conformance.",
      entityType: "audit",
      timeAgo: "18h ago",
    },
    {
      id: "act_4",
      actorName: "Brandon York",
      action: "shopfloor.traveler_released",
      summary: "Dispatched digital traveler TRV-2026-104 across 5 shopfloor work centers.",
      entityType: "system",
      timeAgo: "2d ago",
    },
    {
      id: "act_5",
      actorName: "Brandon York",
      action: "quotes.converted_to_job",
      summary: "Quote QTE-2026-088 converted into live production work order JOB-2026-104.",
      entityType: "system",
      timeAgo: "3d ago",
    },
    {
      id: "act_6",
      actorName: "System",
      action: "file.verified",
      summary: "Technical drawing Apex-Avionics-Enclosure-RevB.pdf verified clean and quarantined clear.",
      entityType: "file",
      timeAgo: "3d ago",
    },
    {
      id: "act_7",
      actorName: "Brandon York",
      action: "purchasing.material_received",
      summary: "Received 8 sheets 5052-H32 aluminum under Lot LOT-2026-AL-088 with Mill Cert MTR-APEX-89021.",
      entityType: "system",
      timeAgo: "7d ago",
    },
    {
      id: "act_8",
      actorName: "System",
      action: "org.bootstrapped",
      summary: "Initialized tenant root boundary for Yorkstead Systems with global operator.",
      entityType: "organization",
      timeAgo: "30d ago",
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="default">CORE//AUDIT_TRAIL</Badge>
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Immutable Operational History
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Activity & Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">
          Tenant-scoped operational events, administrative actions, and system integrity logs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Activity className="size-5" />
            <CardTitle className="text-base">Recent Events</CardTitle>
          </div>
          <CardDescription>Chronological operational history without sensitive data logging.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3">
                <div className="mt-0.5 rounded-md border border-border bg-secondary p-1.5 text-muted-foreground">
                  {item.entityType === "audit" && <FileText className="size-4 text-primary" />}
                  {item.entityType === "membership" && <UserCheck className="size-4 text-primary" />}
                  {item.entityType === "organization" && <ShieldCheck className="size-4 text-primary" />}
                  {item.entityType === "file" && <FileText className="size-4 text-primary" />}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground">{item.actorName}</span>
                      <Badge variant="outline" className="text-[9px] font-mono">{item.action}</Badge>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
