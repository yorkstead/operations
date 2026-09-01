'use client';

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  Code2,
  FolderKanban,
  Hammer,
  FileSpreadsheet,
  Layers,
  Calculator,
  ShieldCheck,
  Wrench,
  Truck,
  BookOpen,
  Cloud,
  Activity,
  Sparkles,
  Package,
  FileCheck2,
  Users,
  FolderLock,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QUICK_LINKS, type QuickLinkItem } from "@/lib/cockpit-data";

const ICON_MAP: Record<string, React.ElementType> = {
  FolderKanban,
  Hammer,
  FileSpreadsheet,
  Layers,
  Package,
  Users,
  Calculator,
  FileCheck2,
  BookOpen,
  ShieldCheck,
  Wrench,
  Truck,
  Sliders,
  Cloud,
  Activity,
  Sparkles,
  FolderLock,
};

const CATEGORY_CUES: Record<QuickLinkItem["category"], string> = {
  "Dev & Sprints": "border-l-primary",
  "Cloud & Platform": "border-l-sky-400",
  "Software Modules": "border-l-amber-400",
  "Client Demos": "border-l-emerald-400",
};

export function QuickLinksHub() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const categories = ["All", "Dev & Sprints", "Cloud & Platform", "Software Modules", "Client Demos"];

  const filteredLinks = QUICK_LINKS.filter((item: QuickLinkItem) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <Card className="border-border bg-card/80">
      <CardHeader className="gap-3 p-4 pb-3">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                <Code2 className="size-3.5" />
              </div>
              <CardTitle className="text-sm font-bold tracking-tight">
                Quick links
              </CardTitle>
              <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                {filteredLinks.length} shown
              </Badge>
            </div>
            <CardDescription className="mt-1 text-[11px]">
              Jump directly to delivery, platform, module, and demo workspaces.
            </CardDescription>
          </div>

          {/* Quick Search */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Find a workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-background/80 pl-8 pr-12 text-xs"
              aria-label="Filter engineering quicklinks"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 px-1 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                aria-label="Clear quick link search"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-border/60 pt-3" aria-label="Filter quick links by category">
          {categories.map((cat) => {
            const count = cat === "All" ? QUICK_LINKS.length : QUICK_LINKS.filter((l) => l.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={isSelected}
                className={`min-h-9 shrink-0 rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors ${
                  isSelected
                    ? "border border-primary/30 bg-primary/15 font-semibold text-primary"
                    : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
                <span className="ml-1.5 text-[10px] opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {filteredLinks.length === 0 ? (
          <div className="grid min-h-24 place-items-center rounded-xl border border-dashed border-border p-6 text-center">
            <p className="font-mono text-xs text-muted-foreground">
              No developer tools or modules matched &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLinks.map((link) => {
              const Icon = ICON_MAP[link.iconName] || HelpCircle;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  title={link.description}
                  className={`group relative flex min-h-16 items-center gap-2.5 rounded-lg border border-l-2 border-border/70 bg-background/45 px-2.5 py-2 transition-colors hover:border-primary/45 hover:bg-accent/45 focus-visible:bg-accent/45 ${CATEGORY_CUES[link.category]}`}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                        {link.title}
                      </span>
                      {link.badge && (
                        <Badge
                          variant={link.badgeVariant || "outline"}
                          className="hidden shrink-0 border-primary/30 px-1 py-0 text-[8px] text-primary 2xl:inline-flex"
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {link.description}
                    </p>
                    <span className="mt-0.5 block truncate font-mono text-[9px] text-muted-foreground/75">
                      {link.tag}
                    </span>
                  </div>

                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
