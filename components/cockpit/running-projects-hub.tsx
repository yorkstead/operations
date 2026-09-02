'use client';

import * as React from "react";
import Link from "next/link";
import {
  Github,
  Globe,
  Shield,
  Cpu,
  Database,
  Cloud,
  FolderKanban,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  RUNNING_PROJECTS,
  type RunningProject,
  type ProjectStatus,
  type ProjectService,
} from "@/lib/cockpit-data";

// ---------------------------------------------------------------------------
// Service icon map — one Lucide icon per service type
// ---------------------------------------------------------------------------

const SERVICE_ICONS: Record<ProjectService, React.ElementType> = {
  github:     Github,
  vercel:     Globe,       // triangle shape closest in Lucide
  netlify:    Cloud,
  cloudflare: Shield,
  "cloud-run": Cpu,
  neon:       Database,
  internal:   FolderKanban,
};

// ---------------------------------------------------------------------------
// Status configuration
// ---------------------------------------------------------------------------

type StatusConfig = {
  dot: string;
  label: string;
  text: string;
  cardRing: string;
  badge: string;
  icon: React.ElementType;
};

const STATUS_CFG: Record<ProjectStatus, StatusConfig> = {
  Active: {
    dot:      "bg-emerald-400",
    label:    "Active",
    text:     "text-emerald-400",
    cardRing: "border-border/70 hover:border-primary/40",
    badge:    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    icon:     CheckCircle2,
  },
  "In Review": {
    dot:      "bg-amber-400",
    label:    "In Review",
    text:     "text-amber-400",
    cardRing: "border-amber-500/40 hover:border-amber-400/60",
    badge:    "border-amber-500/30 bg-amber-500/10 text-amber-400",
    icon:     AlertTriangle,
  },
  Paused: {
    dot:      "bg-sky-400",
    label:    "Paused",
    text:     "text-sky-400",
    cardRing: "border-sky-500/40 hover:border-sky-400/60",
    badge:    "border-sky-500/30 bg-sky-500/10 text-sky-400",
    icon:     PauseCircle,
  },
  Blocked: {
    dot:      "bg-rose-400",
    label:    "Blocked",
    text:     "text-rose-400",
    cardRing: "border-rose-500/50 hover:border-rose-400/70",
    badge:    "border-rose-500/30 bg-rose-500/10 text-rose-400",
    icon:     XCircle,
  },
};

// ---------------------------------------------------------------------------
// Single project card
// ---------------------------------------------------------------------------

function ProjectCard({ project }: { project: RunningProject }) {
  const cfg = STATUS_CFG[project.status];
  const StatusIcon = cfg.icon;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border bg-background/50 transition-colors focus-within:border-primary/50 ${cfg.cardRing}`}
      aria-label={`${project.title} — ${project.status}`}
    >
      {/* Left accent stripe */}
      <span
        className={`absolute inset-y-0 left-0 w-[3px] ${project.accentClass}`}
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col gap-2 px-3 py-3 pl-[14px]">
        {/* Row 1 — codename + stage badge */}
        <div className="flex items-center justify-between gap-1.5">
          <span className="truncate font-mono text-[13px] font-bold tracking-tight text-foreground">
            {project.codename}
          </span>
          <Badge
            variant="secondary"
            className="shrink-0 px-1.5 py-0 font-mono text-[9px] uppercase"
          >
            {project.stageBadge}
          </Badge>
        </div>

        {/* Row 2 — health status */}
        <div className={`flex items-center gap-1.5 font-mono text-[10px] ${cfg.text}`}>
          <StatusIcon className="size-3 shrink-0" aria-hidden="true" />
          <span>{cfg.label}</span>
        </div>

        {/* Row 3 — optional alert note */}
        {project.note && (
          <p className="rounded border border-amber-500/25 bg-amber-500/8 px-1.5 py-1 font-mono text-[9px] leading-snug text-amber-300">
            {project.note}
          </p>
        )}

        {/* Row 4 — description */}
        <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Row 5 — service link chips */}
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {project.links.map((link) => {
            const ServiceIcon = SERVICE_ICONS[link.service];
            const chipClass =
              "inline-flex items-center gap-1 rounded border border-border/60 bg-muted/35 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

            return link.isExternal ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={chipClass}
                title={link.href}
              >
                <ServiceIcon className="size-2.5 shrink-0" aria-hidden="true" />
                {link.label}
                <ArrowUpRight className="size-2 shrink-0 opacity-50" aria-hidden="true" />
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={chipClass}
                title={link.href}
              >
                <ServiceIcon className="size-2.5 shrink-0" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Hub header
// ---------------------------------------------------------------------------

function HubHeader() {
  const total   = RUNNING_PROJECTS.length;
  const active  = RUNNING_PROJECTS.filter((p) => p.status === "Active").length;
  const alert   = RUNNING_PROJECTS.filter((p) => p.status === "Blocked" || p.status === "In Review").length;

  return (
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <FolderKanban className="size-4" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-sm font-bold tracking-tight">Running Projects</CardTitle>
          <CardDescription className="mt-1 text-[11px]">
            {total} projects — quick status and direct service links.
          </CardDescription>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {alert > 0 && (
          <Badge
            variant="outline"
            className="w-fit gap-1.5 border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-400"
          >
            <AlertTriangle className="size-3" aria-hidden="true" />
            {alert} need{alert === 1 ? "s" : ""} attention
          </Badge>
        )}
        <Badge
          variant="outline"
          className="w-fit gap-1.5 border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-400"
        >
          <CheckCircle2 className="size-3" aria-hidden="true" />
          {active} Active
        </Badge>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export function RunningProjectsHub() {
  if (RUNNING_PROJECTS.length === 0) {
    return (
      <Card className="border-border bg-card/80">
        <CardContent className="grid min-h-16 place-items-center p-4">
          <p className="font-mono text-xs text-muted-foreground">
            No running projects configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border bg-card/80">
      <CardHeader className="border-b border-border/70 p-4">
        <HubHeader />
      </CardHeader>

      <CardContent className="p-4">
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          role="list"
          aria-label="Running projects"
        >
          {RUNNING_PROJECTS.map((project) => (
            <div key={project.id} role="listitem" className="flex">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
