'use client';

import * as React from "react";
import { Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PressureStream {
  name: string;
  loadPercentage: number;
  activeItems: number;
  status: "Normal" | "Elevated" | "High Focus";
  color: string;
}

const STREAMS: PressureStream[] = [
  {
    name: "Client Software Delivery",
    loadPercentage: 65,
    activeItems: 4,
    status: "Normal",
    color: "bg-primary",
  },
  {
    name: "Cloud Ops & Infrastructure",
    loadPercentage: 40,
    activeItems: 2,
    status: "Normal",
    color: "bg-emerald-400",
  },
  {
    name: "Workflow Audits & Quoting",
    loadPercentage: 55,
    activeItems: 3,
    status: "Normal",
    color: "bg-sky-400",
  },
  {
    name: "Platform Security & Verification",
    loadPercentage: 30,
    activeItems: 1,
    status: "Normal",
    color: "bg-purple-400",
  },
];

export function PressureMap() {
  return (
    <Card className="border-border bg-card/80 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-primary" />
              <CardTitle className="text-base font-bold tracking-tight">
                Operational Velocity & Pressure Map
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Real-time resource allocation and sprint balance across active consulting streams.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-[9px] uppercase">
            Balanced
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {STREAMS.map((stream) => (
            <div
              key={stream.name}
              className="rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{stream.name}</span>
                <span className="font-mono text-[11px] font-semibold text-primary">
                  {stream.loadPercentage}% Load
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${stream.color} transition-all duration-500`}
                  style={{ width: `${stream.loadPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span>{stream.activeItems} Active Workstreams</span>
                <span className="text-emerald-400">{stream.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
