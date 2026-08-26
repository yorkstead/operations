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
      action: "audit.evaluated",
      summary: "Generated diagnostic briefing score (68% efficiency) for Front Range Manufacturing.",
      entityType: "audit",
      timeAgo: "12m ago",
    },
    {
      id: "act_2",
      actorName: "Brandon York",
      action: "membership.invited",
      summary: "Dispatched operator role invitation to operator@shopfloor.dev.",
      entityType: "membership",
      timeAgo: "34m ago",
    },
    {
      id: "act_3",
      actorName: "System",
      action: "file.verified",
      summary: "Presigned expiring storage token generated for job CAD drawing.",
      entityType: "file",
      timeAgo: "1h ago",
    },
    {
      id: "act_4",
      actorName: "System",
      action: "org.bootstrapped",
      summary: "Initialized tenant boundary for Front Range Manufacturing with global owner.",
      entityType: "organization",
      timeAgo: "2h ago",
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
