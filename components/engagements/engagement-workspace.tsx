'use client';

import * as React from "react";
import Link from "next/link";
import {
  GitBranch,
  Globe,
  ExternalLink,
  CheckCircle2,
  Circle,
  Plus,
  FileText,
  Lock,
  Clock,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ClientEngagement,
  EngagementStage,
  EngagementDeliverable,
} from "@/modules/engagements/domain/types";

export interface EngagementWorkspaceProps {
  engagement: ClientEngagement;
}

const STAGES: Array<{ id: EngagementStage; label: string }> = [
  { id: "lead_intake", label: "1. Intake" },
  { id: "architecture_scoping", label: "2. Architecture" },
  { id: "active_development", label: "3. Active Build" },
  { id: "staging_qa", label: "4. Staging / QA" },
  { id: "production_monitored", label: "5. Production" },
];

export function EngagementWorkspace({ engagement: initial }: EngagementWorkspaceProps) {
  const [engagement, setEngagement] = React.useState<ClientEngagement>(initial);
  const [newDeliverableTitle, setNewDeliverableTitle] = React.useState("");
  const [isAddingDeliverable, setIsAddingDeliverable] = React.useState(false);

  const handleStageChange = (newStage: EngagementStage) => {
    setEngagement((prev) => ({
      ...prev,
      stage: newStage,
      updatedAt: new Date().toISOString(),
    }));
  };

  const toggleDeliverableStatus = (delId: string) => {
    setEngagement((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((d) => {
        if (d.id === delId) {
          const nextStatus = d.status === "completed" ? "in_progress" : "completed";
          return {
            ...d,
            status: nextStatus,
            completedAt: nextStatus === "completed" ? new Date().toISOString() : undefined,
          };
        }
        return d;
      }),
    }));
  };

  const addDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeliverableTitle.trim()) return;

    const newDel: EngagementDeliverable = {
      id: `del_${Date.now()}`,
      title: newDeliverableTitle.trim(),
      status: "pending",
      dueDate: "Active Sprint",
    };

    setEngagement((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDel],
    }));

    setNewDeliverableTitle("");
    setIsAddingDeliverable(false);
  };

  const completedCount = engagement.deliverables.filter((d) => d.status === "completed").length;
  const totalCount = engagement.deliverables.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Navigation Back */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 gap-1 font-mono text-xs text-muted-foreground" asChild>
          <Link href="/engagements">
            <ArrowLeft className="size-3.5" />
            <span>All Engagements</span>
          </Link>
        </Button>
      </div>

      {/* Engagement Header Card */}
      <div className="rounded-2xl border border-border bg-card/90 p-6 shadow-xl backdrop-blur space-y-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                {engagement.clientName}
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="font-mono text-xs text-muted-foreground">
                Contact: {engagement.clientContactName} ({engagement.clientContactEmail})
              </span>
            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {engagement.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:shrink-0">
            <div className="text-right font-mono">
              <div className="text-xs font-bold text-foreground sm:text-base">
                ${(engagement.contractValueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Contract Scope Value
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle Stepper */}
        <div className="pt-2 border-t border-border/70">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Lifecycle Stage</span>
            <span className="text-primary font-semibold">{progressPercent}% SOW Completed</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {STAGES.map((st, idx) => {
              const isActive = engagement.stage === st.id;
              const isPast = STAGES.findIndex((s) => s.id === engagement.stage) > idx;

              return (
                <button
                  key={st.id}
                  onClick={() => handleStageChange(st.id)}
                  className={`rounded-lg px-2.5 py-1.5 font-mono text-xs transition text-center ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow"
                      : isPast
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fast Action Quick Links Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          {engagement.repositoryUrl && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 font-mono text-xs" asChild>
              <a href={engagement.repositoryUrl} target="_blank" rel="noreferrer">
                <GitBranch className="size-3.5 text-primary" />
                <span>GitHub Repository</span>
                <ExternalLink className="size-3 opacity-60" />
              </a>
            </Button>
          )}

          {engagement.stagingUrl && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 font-mono text-xs" asChild>
              <a href={engagement.stagingUrl} target="_blank" rel="noreferrer">
                <Globe className="size-3.5 text-sky-400" />
                <span>Staging Preview</span>
                <ExternalLink className="size-3 opacity-60" />
              </a>
            </Button>
          )}

          {engagement.productionUrl && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 font-mono text-xs" asChild>
              <a href={engagement.productionUrl} target="_blank" rel="noreferrer">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span>Live Production</span>
                <ExternalLink className="size-3 opacity-60" />
              </a>
            </Button>
          )}

          <div className="ml-auto flex flex-wrap gap-1">
            {engagement.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="font-mono text-[9px]">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: SOW Deliverables (Left) + File Vault & Secrets (Right) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: SOW Deliverables & Tasks */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border bg-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold tracking-tight">
                    SOW Scope & Deliverable Checklist
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Contractual milestones and technical deliverables for this engagement.
                  </CardDescription>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsAddingDeliverable(!isAddingDeliverable)}
                  className="h-8 gap-1 font-mono text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Deliverable</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {isAddingDeliverable && (
                <form onSubmit={addDeliverable} className="flex gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <Input
                    placeholder="Deliverable title (e.g. Implement QuickBooks webhook receiver)"
                    value={newDeliverableTitle}
                    onChange={(e) => setNewDeliverableTitle(e.target.value)}
                    autoFocus
                    required
                    className="text-xs h-8 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-8 font-mono text-xs">
                    Save
                  </Button>
                </form>
              )}

              <div className="space-y-2">
                {engagement.deliverables.map((del) => (
                  <div
                    key={del.id}
                    className={`flex items-start justify-between gap-3 rounded-xl border p-3 transition ${
                      del.status === "completed"
                        ? "border-border/40 bg-background/30 opacity-70"
                        : "border-border bg-background/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDeliverableStatus(del.id)}
                        className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition"
                      >
                        {del.status === "completed" ? (
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        ) : (
                          <Circle className="size-4" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold leading-5 ${del.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {del.title}
                        </p>
                        {del.description && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                            {del.description}
                          </p>
                        )}
                        {del.dueDate && (
                          <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                            <Clock className="size-3" />
                            <span>Target: {del.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`font-mono text-[9px] ${
                        del.status === "completed"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : del.status === "in_progress"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {del.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Cloudflare R2 File Vault & Secrets */}
        <div className="space-y-6">
          {/* File Vault */}
          <Card className="border-border bg-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold tracking-tight">
                  Cloudflare R2 File Vault
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-[9px]">
                  R2 Zero Egress
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Architecture diagrams, SOW contracts, and client artifacts.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              {engagement.fileVault.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs font-mono text-muted-foreground">
                  No files uploaded yet.
                </div>
              ) : (
                engagement.fileVault.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/50 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="size-4 text-primary shrink-0" />
                      <span className="truncate font-mono text-[11px] text-foreground">
                        {file.filename}
                      </span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[9px] shrink-0">
                      {(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Secrets Store */}
          <Card className="border-border bg-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold tracking-tight">
                  Client Secrets Store
                </CardTitle>
                <Lock className="size-3.5 text-muted-foreground" />
              </div>
              <CardDescription className="text-xs">
                Encrypted environment configs and API pointers.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              {engagement.secrets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs font-mono text-muted-foreground">
                  No active secrets configured.
                </div>
              ) : (
                engagement.secrets.map((secret) => (
                  <div
                    key={secret.id}
                    className="rounded-lg border border-border/70 bg-background/50 p-2.5 space-y-1 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-[11px]">{secret.key}</span>
                      <Badge variant="outline" className="text-[9px]">Encrypted</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{secret.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
