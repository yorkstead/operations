'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Copy,
  Printer,
  ShieldCheck,
  Tag,
  Layers,
  FileText,
  Workflow,
  Cpu,
  CheckSquare,
  Wrench
} from "lucide-react";
import {
  ImplementationLibraryService,
  standardLibraryTemplates
} from "@/modules/implementation-library/application/library-service";
import type {
  LibraryTemplate,
  TemplateCategory
} from "@/modules/implementation-library/domain/types";

export function ImplementationLibraryView() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeTemplate, setActiveTemplate] = React.useState<LibraryTemplate>(standardLibraryTemplates[0]);
  const [cloneNotice, setCloneNotice] = React.useState<string | null>(null);

  const categories: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", label: "All Templates", icon: BookOpen },
    { id: "discovery_questionnaire", label: "Discovery Scoping", icon: Search },
    { id: "workflow_map", label: "Workflow Maps", icon: Workflow },
    { id: "acceptance_criteria", label: "Acceptance Criteria", icon: CheckSquare },
    { id: "configuration_package", label: "Configuration Packages", icon: Cpu },
    { id: "import_mapping", label: "Import Mappings", icon: Layers },
    { id: "training_checklist", label: "Training Checklists", icon: CheckCircle2 },
    { id: "operational_runbook", label: "Runbooks & Cutover", icon: Wrench },
    { id: "post_launch_review", label: "Post-Launch Reviews", icon: FileText },
  ];

  const filteredTemplates = React.useMemo(() => {
    return ImplementationLibraryService.getTemplates({
      category: selectedCategory === "all" ? undefined : (selectedCategory as TemplateCategory),
      search: searchQuery || undefined,
    });
  }, [selectedCategory, searchQuery]);

  const handleClone = (tmpl: LibraryTemplate) => {
    const cloned = ImplementationLibraryService.cloneTemplate(tmpl.id, "org_demo_current");
    setCloneNotice(`Successfully cloned '${tmpl.title}' into organization workspace (ID: ${cloned.clonedId}).`);
    setTimeout(() => setCloneNotice(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px] uppercase bg-primary/20 text-primary border-primary/30">
              INTERNAL PLAYBOOK & ARTIFACTS
            </Badge>
            <span className="text-muted-foreground text-xs">Organization-Neutral Templates</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Implementation Library
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Standardized discovery questions, workflow maps, acceptance checklists, rate schemas, import templates, and cutover runbooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="font-mono text-xs gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Print Template</span>
          </Button>
        </div>
      </div>

      {cloneNotice && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/[0.08] p-3 text-emerald-400 text-xs flex items-center gap-2 print:hidden">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{cloneNotice}</span>
        </div>
      )}

      {/* Main 2-Column Grid: Template List on Left, Active Template Viewer on Right */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.3fr]">
        {/* Left Column: Filter & Template Cards */}
        <div className="space-y-4 print:hidden">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates, tags, or modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-2.5 py-1 transition text-[11px] ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Template Cards List */}
          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredTemplates.map((tmpl) => {
              const isSelected = activeTemplate?.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setActiveTemplate(tmpl)}
                  className={`cursor-pointer rounded-lg p-3 border transition space-y-1.5 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card/60 text-muted-foreground hover:border-border/80 hover:bg-card/90"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">{tmpl.title}</span>
                    <Badge variant="secondary" className="font-mono text-[8px] uppercase bg-primary/20 text-primary border-primary/30">
                      {tmpl.version}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {tmpl.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5">{tmpl.category}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5">{tmpl.industry}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Template Document Viewer */}
        <div className="space-y-4">
          <Card className="border-border bg-card/90 shadow-md">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-[9px] uppercase bg-primary/20 text-primary border-primary/30">
                      {`${activeTemplate.category.toUpperCase()} // ${activeTemplate.version}`}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Reviewed: {activeTemplate.sanitizedReviewDate}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground mt-1">
                    {activeTemplate.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {activeTemplate.summary}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0 print:hidden">
                  <Button
                    onClick={() => handleClone(activeTemplate)}
                    variant="default"
                    size="sm"
                    className="font-mono text-xs gap-1.5"
                  >
                    <Copy className="size-3.5" />
                    <span>Clone to Org</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {/* Provenance & Sanitization Tag */}
              <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-3 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase">
                  <ShieldCheck className="size-3.5" />
                  <span>Sanitization & Provenance Guarantee</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {activeTemplate.provenance} (Reviewed by {activeTemplate.reviewedBy}). Zero proprietary customer credentials or private CAD files are included.
                </p>
              </div>

              {/* Template Body Markdown Rendering */}
              <div className="rounded-lg border border-border bg-background/50 p-5 font-mono text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {activeTemplate.contentMarkdown}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                <Tag className="size-3.5 text-muted-foreground" />
                {activeTemplate.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="font-mono text-[9px]">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
