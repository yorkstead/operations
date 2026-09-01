'use client';

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, BookOpen, Calculator, Cloud, Code2, FileCheck2, FileSpreadsheet, FolderKanban, FolderLock, Hammer, HelpCircle, Layers, Package, Search, ShieldCheck, Sliders, Sparkles, Truck, Users, Wrench, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QUICK_LINKS, type QuickLinkItem } from "@/lib/cockpit-data";

const ICON_MAP: Record<string, React.ElementType> = { FolderKanban, Hammer, FileSpreadsheet, Layers, Package, Users, Calculator, FileCheck2, BookOpen, ShieldCheck, Wrench, Truck, Sliders, Cloud, Activity, Sparkles, FolderLock };
type Category = QuickLinkItem["category"];

const CATEGORIES: Array<{ name: Category; shortName: string; description: string; icon: React.ElementType; cue: string }> = [
  { name: "Dev & Sprints", shortName: "Delivery", description: "Plan, scope, and move client work forward.", icon: FolderKanban, cue: "bg-primary" },
  { name: "Cloud & Platform", shortName: "Platform", description: "Operate infrastructure, identity, and telemetry.", icon: Cloud, cue: "bg-sky-400" },
  { name: "Software Modules", shortName: "Modules", description: "Open the active industrial workflow engines.", icon: Layers, cue: "bg-amber-400" },
  { name: "Client Demos", shortName: "Demos", description: "Launch isolated sales and scenario workspaces.", icon: Sparkles, cue: "bg-emerald-400" },
];

const PRIORITY_WORK = [
  { id: "projects-command-center", action: "Plan delivery", detail: "Projects & active sprints" },
  { id: "client-engagements", action: "Move client work", detail: "Engagements & milestones" },
  { id: "cloud-infrastructure", action: "Check the platform", detail: "Cloud health & deployments" },
  { id: "demo-hub", action: "Present a demo", detail: "Isolated sales scenarios" },
];

function LinkIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || HelpCircle;
  return <Icon className={className} aria-hidden="true" />;
}

export function QuickLinksHub() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<Category>("Dev & Sprints");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? QUICK_LINKS.filter((item) => [item.title, item.description, item.tag, item.category].some((value) => value.toLowerCase().includes(normalizedQuery)))
    : [];
  const selectedMeta = CATEGORIES.find((category) => category.name === selectedCategory) ?? CATEGORIES[0];
  const categoryLinks = QUICK_LINKS.filter((link) => link.category === selectedCategory);
  const priorityLinks = PRIORITY_WORK.flatMap((priority) => {
    const link = QUICK_LINKS.find((item) => item.id === priority.id);
    return link ? [{ ...priority, link }] : [];
  });

  return (
    <Card className="overflow-hidden border-border bg-card/80">
      <CardHeader className="border-b border-border/70 p-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
              <Code2 className="size-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold tracking-tight">Cockpit launchpad</CardTitle>
              <CardDescription className="mt-1 text-[11px]">Start priority work or open a focused operating area.</CardDescription>
            </div>
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input type="search" placeholder="Find any workspace..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-9 bg-background/80 pl-8 pr-9 text-xs" aria-label="Search all Cockpit workspaces" />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="absolute right-0 top-0 grid size-9 place-items-center text-muted-foreground transition-colors hover:text-foreground" aria-label="Clear workspace search">
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {normalizedQuery ? (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">All workspaces</p>
                <p className="mt-1 text-xs text-muted-foreground">{searchResults.length} {searchResults.length === 1 ? "match" : "matches"} for &ldquo;{searchQuery.trim()}&rdquo;</p>
              </div>
              <button type="button" onClick={() => setSearchQuery("")} className="min-h-9 rounded-md border border-border px-3 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">Back to launchpad</button>
            </div>
            {searchResults.length === 0 ? (
              <div className="grid min-h-24 place-items-center rounded-lg border border-dashed border-border p-5 text-center"><p className="font-mono text-xs text-muted-foreground">No workspace matched that search.</p></div>
            ) : (
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {searchResults.map((link) => (
                  <Link key={link.id} href={link.href} className="group flex min-h-14 items-center gap-2.5 rounded-lg border border-border/70 bg-background/45 px-2.5 py-2 transition-colors hover:border-primary/45 hover:bg-accent/45">
                    <div className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-primary"><LinkIcon name={link.iconName} className="size-3.5" /></div>
                    <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold group-hover:text-primary">{link.title}</p><p className="mt-0.5 truncate font-mono text-[9px] text-muted-foreground">{link.category}</p></div>
                    <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/60 group-hover:text-primary" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <section className="border-b border-border/70 p-4 lg:border-b-0 lg:border-r" aria-labelledby="priority-work-title">
              <div className="mb-3 flex items-center justify-between">
                <div><p id="priority-work-title" className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Priority work</p><p className="mt-1 text-[11px] text-muted-foreground">The four main operator starting points.</p></div>
                <Badge variant="outline" className="px-1.5 py-0 text-[9px]">Start here</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {priorityLinks.map(({ action, detail, link }, index) => (
                  <Link key={link.id} href={link.href} className="group relative min-h-24 overflow-hidden rounded-lg border border-border/80 bg-background/55 p-3 transition-colors hover:border-primary/45 hover:bg-accent/40">
                    <span className="absolute right-2 top-1 font-mono text-3xl font-bold text-foreground/[0.035]" aria-hidden="true">0{index + 1}</span>
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid size-7 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><LinkIcon name={link.iconName} className="size-3.5" /></div>
                      {link.badge && <Badge variant={link.badgeVariant} className="px-1.5 py-0 text-[8px]">{link.badge}</Badge>}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-foreground group-hover:text-primary">{action}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-2"><span className="truncate text-[10px] text-muted-foreground">{detail}</span><ArrowRight className="size-3 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" /></div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="p-4" aria-labelledby="operating-areas-title">
              <div className="mb-3"><p id="operating-areas-title" className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Operating areas</p><p className="mt-1 text-[11px] text-muted-foreground">Choose a lane, then launch the exact tool.</p></div>
              <div className="grid grid-cols-4 gap-1" role="tablist" aria-label="Cockpit operating areas">
                {CATEGORIES.map((category) => {
                  const CategoryIcon = category.icon;
                  const isSelected = category.name === selectedCategory;
                  return (
                    <button key={category.name} type="button" role="tab" aria-selected={isSelected} aria-controls="quick-links-category-panel" onClick={() => setSelectedCategory(category.name)} className={`relative min-h-14 rounded-md border px-1.5 py-2 text-center transition-colors ${isSelected ? "border-primary/35 bg-primary/10 text-primary" : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                      <span className={`absolute inset-x-2 top-0 h-0.5 rounded-full ${category.cue} ${isSelected ? "opacity-100" : "opacity-30"}`} />
                      <CategoryIcon className="mx-auto size-3.5" aria-hidden="true" /><span className="mt-1 block truncate font-mono text-[9px]">{category.shortName}</span>
                    </button>
                  );
                })}
              </div>
              <div id="quick-links-category-panel" role="tabpanel" className="mt-3 rounded-lg border border-border/70 bg-background/35 p-2.5">
                <div className="mb-2 flex items-start justify-between gap-3 px-1"><div><p className="text-xs font-semibold">{selectedMeta.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{selectedMeta.description}</p></div><span className="font-mono text-[9px] text-muted-foreground">{categoryLinks.length} tools</span></div>
                <div className="grid grid-cols-2 gap-1">
                  {categoryLinks.map((link) => (
                    <Link key={link.id} href={link.href} title={link.description} className="group flex min-h-10 min-w-0 items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent focus-visible:bg-accent">
                      <LinkIcon name={link.iconName} className="size-3.5 shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate text-[10px] font-medium text-foreground group-hover:text-primary">{link.title}</span><ArrowUpRight className="size-3 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
