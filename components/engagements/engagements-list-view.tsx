'use client';

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  Plus,
  GitBranch,
  Globe,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClientEngagement, EngagementStage } from "@/modules/engagements/domain/types";

export interface EngagementsListViewProps {
  initialEngagements: ClientEngagement[];
}

const STAGE_LABELS: Record<EngagementStage, { label: string; color: string }> = {
  lead_intake: { label: "Lead / Intake", color: "bg-muted text-muted-foreground border-border" },
  architecture_scoping: { label: "Architecture & Scoping", color: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
  active_development: { label: "Active Build & Sprint", color: "bg-primary/15 text-primary border-primary/30" },
  staging_qa: { label: "Staging / QA", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  production_monitored: { label: "Production & Monitored", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  completed: { label: "Completed & Archived", color: "bg-muted text-muted-foreground border-border" },
};

export function EngagementsListView({ initialEngagements }: EngagementsListViewProps) {
  const [engagements] = React.useState<ClientEngagement[]>(initialEngagements);
  const [stageFilter, setStageFilter] = React.useState<string>("All");

  const stages: Array<{ id: string; label: string }> = [
    { id: "All", label: "All Engagements" },
    { id: "active_development", label: "Active Build" },
    { id: "staging_qa", label: "Staging / QA" },
    { id: "architecture_scoping", label: "Architecture" },
    { id: "production_monitored", label: "Production" },
  ];

  const filtered = stageFilter === "All"
    ? engagements
    : engagements.filter((e) => e.stage === stageFilter);

  const totalContractValue = engagements.reduce((sum, e) => sum + e.contractValueCents, 0);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Active Client Delivery</span>
              <Briefcase className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              {engagements.filter((e) => e.stage === "active_development" || e.stage === "staging_qa").length}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              In active sprint execution
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Total Contract Pipeline</span>
              <Sparkles className="size-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
              ${(totalContractValue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Across all client accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>SOW Deliverable Velocity</span>
              <CheckCircle2 className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              88% Completed
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Across milestone deliverables
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Navigation & Filter */}
      <Card className="border-border bg-card/80">
        <CardHeader className="pb-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-base font-bold tracking-tight">
                Client Software Engagements
              </CardTitle>
              <CardDescription className="text-xs">
                Active client accounts, repository links, staging previews, and milestone deliverables.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 gap-1 font-mono text-xs" asChild>
                <Link href="/engagements/new">
                  <Plus className="size-3.5" />
                  <span>New Engagement</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
            {stages.map((st) => (
              <button
                key={st.id}
                onClick={() => setStageFilter(st.id)}
                className={`rounded-full px-3 py-1 font-mono text-xs transition ${
                  stageFilter === st.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid gap-3">
            {filtered.map((eng) => {
              const stageBadge = STAGE_LABELS[eng.stage] || STAGE_LABELS.lead_intake;
              const completedDeliverables = eng.deliverables.filter((d) => d.status === "completed").length;
              const totalDeliverables = eng.deliverables.length;

              return (
                <div
                  key={eng.id}
                  className="group relative rounded-xl border border-border/80 bg-background/60 p-4 transition-all hover:border-primary/50 hover:bg-background/90"
                >
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {eng.clientName}
                        </span>
                        <Badge variant="outline" className={`font-mono text-[9px] ${stageBadge.color}`}>
                          {stageBadge.label}
                        </Badge>
                      </div>

                      <h3 className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        <Link href={`/engagements/${eng.id}`}>
                          {eng.title}
                        </Link>
                      </h3>

                      {/* Tech Stack Pills */}
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {eng.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Details & Fast Action */}
                    <div className="flex flex-wrap items-center gap-4 lg:shrink-0">
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-foreground">
                          ${(eng.contractValueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {completedDeliverables}/{totalDeliverables} Deliverables
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {eng.repositoryUrl && (
                          <a
                            href={eng.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground"
                            title="GitHub Repository"
                          >
                            <GitBranch className="size-3.5" />
                          </a>
                        )}
                        {eng.stagingUrl && (
                          <a
                            href={eng.stagingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground"
                            title="Staging Preview URL"
                          >
                            <Globe className="size-3.5" />
                          </a>
                        )}
                        <Button size="sm" variant="outline" className="h-8 gap-1 font-mono text-xs" asChild>
                          <Link href={`/engagements/${eng.id}`}>
                            <span>Workspace</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
