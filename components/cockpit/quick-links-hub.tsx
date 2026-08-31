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
    <Card className="border-border bg-card/80 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="size-5 text-primary" />
              <CardTitle className="text-base font-bold tracking-tight">
                Engineering & Operations Quicklinks
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Direct access for software engineering workflows, active module development, cloud infrastructure, and sales demos.
            </CardDescription>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search dev tools, modules, demos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-background/80"
              aria-label="Filter engineering quicklinks"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
          {categories.map((cat) => {
            const count = cat === "All" ? QUICK_LINKS.length : QUICK_LINKS.filter((l) => l.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 font-mono text-xs transition ${
                  isSelected
                    ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
                <span className="ml-1.5 text-[10px] opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {filteredLinks.length === 0 ? (
          <div className="grid min-h-24 place-items-center rounded-xl border border-dashed border-border p-6 text-center">
            <p className="font-mono text-xs text-muted-foreground">
              No developer tools or modules matched &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLinks.map((link) => {
              const Icon = ICON_MAP[link.iconName] || HelpCircle;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-background/50 p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-background/80 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="size-4" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-mono text-[9px] px-1.5 py-0">
                          {link.tag}
                        </Badge>
                        {link.badge && (
                          <Badge
                            variant={link.badgeVariant || "outline"}
                            className="font-mono text-[9px] px-1.5 py-0 border-primary/30 text-primary"
                          >
                            {link.badge}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </div>

                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                      {link.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 font-mono text-[10px] text-muted-foreground">
                    <span className="text-[10px] text-muted-foreground/80">{link.category}</span>
                    <span className="inline-flex items-center gap-0.5 text-primary opacity-0 transition group-hover:opacity-100">
                      Launch <ArrowUpRight className="size-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
