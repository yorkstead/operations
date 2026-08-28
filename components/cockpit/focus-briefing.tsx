'use client';

import * as React from "react";
import {
  Flame,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FocusBriefingProps {
  operatorName?: string;
  activeClientCount?: number;
  openTaskCount?: number;
  completedTodayCount?: number;
}

export function FocusBriefing({
  operatorName = "Brandon",
  activeClientCount = 4,
  openTaskCount = 8,
  completedTodayCount = 3,
}: FocusBriefingProps) {
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/90 to-background p-6 shadow-xl backdrop-blur">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Operator Identity & Date */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono text-[9px] uppercase tracking-widest bg-primary text-primary-foreground">
              OPERATOR COCKPIT
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">{currentDate}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {operatorName}
          </h1>
          <p className="max-w-xl text-xs text-muted-foreground leading-relaxed">
            Yorkstead Systems operations are healthy. All tenant data is isolated, continuous delivery pipelines are operational, and live client deliverables are tracking to schedule.
          </p>
        </div>

        {/* Executive Stats Matrix */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/60 px-4 py-3 text-center">
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground">
              <Briefcase className="size-3 text-primary" />
              <span>Clients</span>
            </div>
            <span className="mt-1 font-mono text-xl font-bold text-foreground">
              {activeClientCount}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/60 px-4 py-3 text-center">
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-amber-400">
              <Flame className="size-3" />
              <span>Pending</span>
            </div>
            <span className="mt-1 font-mono text-xl font-bold text-amber-400">
              {openTaskCount}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/60 px-4 py-3 text-center">
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase text-emerald-400">
              <CheckCircle2 className="size-3" />
              <span>Closed</span>
            </div>
            <span className="mt-1 font-mono text-xl font-bold text-emerald-400">
              {completedTodayCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
