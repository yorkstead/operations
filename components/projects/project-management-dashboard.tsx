'use client';

import * as React from "react";
import Link from "next/link";
import {
  FolderKanban,
  CheckCircle2,
  GitBranch,
  Globe,
  ExternalLink,
  Plus,
  Search,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ListTodo,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  owner: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  client: string;
  status: "Discovery" | "Architecture" | "In Build" | "Staging Review" | "Production Live";
  health: "on_track" | "at_risk" | "blocked" | "completed";
  progress: number;
  budget: number;
  spent: number;
  leadEngineer: string;
  targetLaunch: string;
  repo?: string;
  staging?: string;
  milestones: ProjectMilestone[];
  tags: string[];
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj_1",
    name: "Front Range Sheet Metal Workflow Engine",
    client: "Front Range Precision MFG",
    status: "In Build",
    health: "on_track",
    progress: 72,
    budget: 68000,
    spent: 46200,
    leadEngineer: "Brandon (Lead Operator)",
    targetLaunch: "2026-09-15",
    repo: "https://github.com/yorkstead/operations",
    staging: "https://ops.yorkstead.com/demo?scenario=front-range-manufacturing",
    tags: ["Digital Traveler", "QR Station Scanning", "CNC Laser HUD"],
    milestones: [
      { id: "m1", title: "CAD Drawing Parsing & DXF Vault Integration", dueDate: "2026-08-10", completed: true, owner: "Brandon" },
      { id: "m2", title: "Real-time Station Execution & Traveler Dispatches", dueDate: "2026-08-25", completed: true, owner: "Brandon" },
      { id: "m3", title: "Quality NCR Disposition & IDOR Boundary Audits", dueDate: "2026-09-05", completed: false, owner: "Brandon" },
      { id: "m4", title: "Production Cutover & Operator Training", dueDate: "2026-09-15", completed: false, owner: "Brandon" },
    ],
  },
  {
    id: "proj_2",
    name: "Summit Facility Services Multi-Site Operations",
    client: "Summit Facility Services",
    status: "Staging Review",
    health: "on_track",
    progress: 90,
    budget: 52000,
    spent: 48000,
    leadEngineer: "Brandon (Lead Operator)",
    targetLaunch: "2026-09-08",
    repo: "https://github.com/yorkstead/operations",
    staging: "https://ops.yorkstead.com/demo?scenario=summit-facility-services",
    tags: ["Mobile Checklist", "Equipment Telemetry", "Field Signoff"],
    milestones: [
      { id: "sm1", title: "Facility Asset & Zone Hierarchy Schema", dueDate: "2026-08-01", completed: true, owner: "Brandon" },
      { id: "sm2", title: "Mobile Service Job Dispatch with GPS Verification", dueDate: "2026-08-18", completed: true, owner: "Brandon" },
      { id: "sm3", title: "Deterministic Golden Snapshot Reset Engine", dueDate: "2026-08-29", completed: true, owner: "Brandon" },
      { id: "sm4", title: "Client Staging Acceptance Signoff", dueDate: "2026-09-08", completed: false, owner: "Brandon" },
    ],
  },
  {
    id: "proj_3",
    name: "Mile High Architectural Signworks ERP",
    client: "Mile High Signworks",
    status: "Architecture",
    health: "at_risk",
    progress: 35,
    budget: 84000,
    spent: 24000,
    leadEngineer: "Brandon (Lead Operator)",
    targetLaunch: "2026-10-01",
    repo: "https://github.com/yorkstead/operations",
    staging: "https://ops.yorkstead.com/demo?scenario=mile-high-signworks",
    tags: ["CAD Vector Approvals", "Crane Rigging Dispatch", "Permit Tracking"],
    milestones: [
      { id: "mm1", title: "Vector Artwork Revision Portals & PDF Proofs", dueDate: "2026-08-20", completed: true, owner: "Brandon" },
      { id: "mm2", title: "Crane Crew & Boom Truck Fleet Scheduler", dueDate: "2026-09-10", completed: false, owner: "Brandon" },
      { id: "mm3", title: "Municipal Permit Signoff Ledger", dueDate: "2026-09-22", completed: false, owner: "Brandon" },
    ],
  },
  {
    id: "proj_4",
    name: "Yorkstead Operations Cloudflare R2 Migration & Auth 2.0",
    client: "Yorkstead Systems (Internal)",
    status: "Production Live",
    health: "completed",
    progress: 100,
    budget: 35000,
    spent: 31500,
    leadEngineer: "Brandon (Lead Operator)",
    targetLaunch: "2026-08-30",
    repo: "https://github.com/yorkstead/operations",
    staging: "https://ops.yorkstead.com",
    tags: ["Cloudflare R2", "Better Auth Passkeys", "Vercel Packaging"],
    milestones: [
      { id: "ym1", title: "Better Auth PostgreSQL Identity Migration", dueDate: "2026-08-26", completed: true, owner: "Brandon" },
      { id: "ym2", title: "S3 Presigned URL Zero-Egress Storage Vault", dueDate: "2026-08-28", completed: true, owner: "Brandon" },
      { id: "ym3", title: "Vercel Production Deployment & Passkey Health", dueDate: "2026-08-30", completed: true, owner: "Brandon" },
    ],
  },
];

const HEALTH_CONFIG = {
  on_track: { label: "On Track", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  at_risk: { label: "At Risk", badge: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  blocked: { label: "Blocked", badge: "bg-red-500/10 text-red-400 border-red-500/30" },
  completed: { label: "Completed", badge: "bg-primary/10 text-primary border-primary/30" },
};

const STATUS_ORDER = ["All", "In Build", "Staging Review", "Architecture", "Discovery", "Production Live"] as const;

export function ProjectManagementDashboard() {
  const [projects, setProjects] = React.useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(INITIAL_PROJECTS[0].id);

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchClient = p.client.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchClient && !matchTags) return false;
    }
    return true;
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);
  const activeSprintCount = projects.filter((p) => p.status === "In Build" || p.status === "Staging Review").length;
  const totalMilestones = projects.flatMap((p) => p.milestones);
  const completedMilestones = totalMilestones.filter((m) => m.completed).length;

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          milestones: proj.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Executive KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Active Sprints</span>
              <FolderKanban className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              {activeSprintCount} Projects
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              In active build & staging validation
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Milestone Delivery</span>
              <CheckCircle2 className="size-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
              {completedMilestones} / {totalMilestones.length}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {Math.round((completedMilestones / totalMilestones.length) * 100)}% milestone velocity
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Total Contract Value</span>
              <DollarSign className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              ${totalBudget.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              ${totalSpent.toLocaleString()} deployed ({Math.round((totalSpent / totalBudget) * 100)}% utilized)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Delivery Health</span>
              <ShieldCheck className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              100% Isolated
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Zero tenant leakage & SLA compliant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Projects List + Selected Project Deep-Dive */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Project Catalog & Filters (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <Card className="border-border bg-card/80 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <FolderKanban className="size-5 text-primary" />
                    <CardTitle className="text-base font-bold tracking-tight">
                      Project Command & Execution Center
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Comprehensive operational portfolio, milestone tracking, staging environments, and deliverables.
                  </CardDescription>
                </div>

                <Button size="sm" className="h-8 gap-1 font-mono text-xs shrink-0" asChild>
                  <Link href="/engagements">
                    <Plus className="size-3.5" />
                    <span>New Project</span>
                  </Link>
                </Button>
              </div>

              {/* Search & Status Filters */}
              <div className="space-y-2 pt-3 border-t border-border/60">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search projects by name, client, or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {STATUS_ORDER.map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] transition ${
                        statusFilter === st
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs font-mono text-muted-foreground">
                  No projects match your filter.
                </div>
              ) : (
                filteredProjects.map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  const health = HEALTH_CONFIG[p.health];

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-primary/60 bg-primary/5 shadow-md"
                          : "border-border/80 bg-background/50 hover:border-primary/30 hover:bg-background/80"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">
                              {p.client}
                            </span>
                            <Badge variant="outline" className={`font-mono text-[9px] ${health.badge}`}>
                              {health.label}
                            </Badge>
                            <Badge variant="secondary" className="font-mono text-[9px]">
                              {p.status}
                            </Badge>
                          </div>

                          <h3 className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {p.name}
                          </h3>

                          {/* Progress bar */}
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                              <span>Delivery Progress</span>
                              <span className="font-semibold text-foreground">{p.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {p.tags.map((t) => (
                              <span
                                key={t}
                                className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 font-mono text-xs text-muted-foreground">
                          <span>${(p.budget / 1000).toFixed(0)}k</span>
                          <ArrowRight className={`size-3.5 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground opacity-50"}`} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Project Detailed Command View (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {selectedProject ? (
            <Card className="border-border bg-card/80 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="font-mono text-[9px] uppercase">
                    PROJECT CONTROL
                  </Badge>
                  <Badge variant="outline" className={`font-mono text-[9px] ${HEALTH_CONFIG[selectedProject.health].badge}`}>
                    {HEALTH_CONFIG[selectedProject.health].label}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold tracking-tight text-foreground mt-2">
                  {selectedProject.name}
                </CardTitle>
                <CardDescription className="font-mono text-xs text-primary">
                  Client: {selectedProject.client}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Key Metadata Table */}
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-background/50 p-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block">Lead Engineer</span>
                    <span className="font-semibold text-foreground text-xs">{selectedProject.leadEngineer}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block">Target Launch</span>
                    <span className="font-semibold text-foreground text-xs">{selectedProject.targetLaunch}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <span className="text-[10px] uppercase text-muted-foreground block">Budget Allocated</span>
                    <span className="font-semibold text-foreground text-xs">${selectedProject.budget.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <span className="text-[10px] uppercase text-muted-foreground block">Capital Deployed</span>
                    <span className="font-semibold text-emerald-400 text-xs">${selectedProject.spent.toLocaleString()}</span>
                  </div>
                </div>

                {/* Quick Repos & Staging Links */}
                <div className="flex flex-wrap gap-2">
                  {selectedProject.repo && (
                    <a
                      href={selectedProject.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 py-1.5 font-mono text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
                    >
                      <GitBranch className="size-3.5 text-primary" />
                      <span>Repository</span>
                      <ExternalLink className="size-2.5 opacity-60" />
                    </a>
                  )}
                  {selectedProject.staging && (
                    <a
                      href={selectedProject.staging}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 py-1.5 font-mono text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
                    >
                      <Globe className="size-3.5 text-emerald-400" />
                      <span>Live Staging Sandbox</span>
                      <ExternalLink className="size-2.5 opacity-60" />
                    </a>
                  )}
                </div>

                {/* Milestone Execution Checklist */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-border/70 pb-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <ListTodo className="size-4 text-primary" />
                      Milestone Execution Checklist
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {selectedProject.milestones.filter((m) => m.completed).length}/{selectedProject.milestones.length} Complete
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedProject.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => toggleMilestone(selectedProject.id, m.id)}
                        className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition cursor-pointer ${
                          m.completed
                            ? "border-border/40 bg-background/30 opacity-70"
                            : "border-border/80 bg-background/60 hover:border-primary/40"
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-muted-foreground hover:text-primary transition"
                          aria-label={m.completed ? "Mark milestone incomplete" : "Mark milestone complete"}
                        >
                          <CheckCircle2
                            className={`size-4 ${m.completed ? "text-emerald-400" : "text-muted-foreground/50"}`}
                          />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-medium leading-tight ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {m.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                            <span>Due: {m.dueDate}</span>
                            <span>•</span>
                            <span>{m.owner}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Action Button */}
                <Button className="w-full h-9 font-mono text-xs gap-1.5" asChild>
                  <Link href="/engagements">
                    <span>Open Full Engagement Workspace</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
