'use client';

import * as React from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Target,
  Layers,
  Activity,
  Workflow,
  Info,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getModuleGuidance } from "@/lib/guidance/registry";
import { ModuleGuidance } from "@/lib/guidance/types";

export interface ModuleGuidanceCardProps {
  moduleCode: string;
  initialExpanded?: boolean;
  initialTab?: "walkthrough" | "actions" | "outcomes" | "connections";
  contextOverride?: "live" | "demo";
  className?: string;
}

export function ModuleGuidanceCard({
  moduleCode,
  initialExpanded = false,
  initialTab = "walkthrough",
  contextOverride,
  className = "",
}: ModuleGuidanceCardProps) {
  const guidance: ModuleGuidance | undefined = getModuleGuidance(moduleCode);
  const [isExpanded, setIsExpanded] = React.useState(initialExpanded);
  const [activeTab, setActiveTab] = React.useState<"walkthrough" | "actions" | "outcomes" | "connections">(initialTab);

  // Determine demo vs live context
  const isDemoMode = React.useMemo(() => {
    if (contextOverride) {
      return contextOverride === "demo";
    }
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (search.includes("demo=true") || search.includes("scenario=")) {
        return true;
      }
    }
    return false;
  }, [contextOverride]);

  const contentId = `guidance-content-${moduleCode}`;

  if (!guidance) {
    return null;
  }

  return (
    <section
      aria-labelledby={`guidance-heading-${moduleCode}`}
      className={`rounded-xl border transition-all duration-200 ${
        isDemoMode
          ? "border-amber-500/40 bg-card/90 ring-1 ring-amber-500/20"
          : "border-border bg-card/90"
      } ${className}`}
    >
      {/* Header / Toggle Trigger */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary">
                <BookOpen className="size-3.5" />
                <span>MODULE GUIDANCE</span>
              </span>

              <span className="text-border text-xs hidden sm:inline">&bull;</span>

              <Badge variant="outline" className="font-mono text-[10px] tracking-wider uppercase">
                {guidance.badge}
              </Badge>

              {/* Context Indicator: LIVE vs DEMO */}
              {isDemoMode ? (
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] tracking-wider uppercase border-amber-500/40 bg-amber-500/10 text-amber-300 inline-flex items-center gap-1"
                >
                  <Sparkles className="size-3 text-amber-400" />
                  <span>DEMO MODE // SYNTHETIC SANDBOX</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] tracking-wider uppercase border-primary/40 bg-primary/10 text-primary inline-flex items-center gap-1"
                >
                  <ShieldCheck className="size-3 text-primary" />
                  <span>LIVE TENANT // PRODUCTION CONTROLS</span>
                </Badge>
              )}
            </div>

            <h2
              id={`guidance-heading-${moduleCode}`}
              className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2"
            >
              <span>{guidance.name}</span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground font-mono leading-relaxed line-clamp-2 sm:line-clamp-1">
              {guidance.kicker}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-1 sm:pt-0">
            <Button
              type="button"
              variant={isExpanded ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={contentId}
              className="font-mono text-xs h-9 px-3 gap-1.5 focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>{isExpanded ? "Collapse Guide" : "Explore Walkthrough"}</span>
              {isExpanded ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content Body */}
      {isExpanded && (
        <div
          id={contentId}
          role="region"
          aria-label={`${guidance.name} interactive walkthrough and reference guide`}
          className="border-t border-border/80 p-4 sm:p-6 space-y-6 animate-in fade-in duration-150"
        >
          {/* Section 1: Overview, Replaced Friction & Screen Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary">
                <Info className="size-4 shrink-0" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  What This Module Does
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guidance.whatItDoes}
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Workflow className="size-4 shrink-0" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Operational Problem It Replaces
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guidance.problemReplaced}
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-primary">
                <Layers className="size-4 shrink-0" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  What You Are Looking At
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guidance.whatYouAreLookingAt}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("walkthrough")}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition min-h-[36px] flex items-center gap-1.5 ${
                activeTab === "walkthrough"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Workflow className="size-3.5" />
              <span>1. Workflow Walkthrough</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("actions")}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition min-h-[36px] flex items-center gap-1.5 ${
                activeTab === "actions"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Lightbulb className="size-3.5" />
              <span>2. Suggested Actions to Try</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("outcomes")}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition min-h-[36px] flex items-center gap-1.5 ${
                activeTab === "outcomes"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Target className="size-3.5" />
              <span>3. Why This Matters (Outcomes)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("connections")}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition min-h-[36px] flex items-center gap-1.5 ${
                activeTab === "connections"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Activity className="size-3.5" />
              <span>4. Ecosystem & Public Links</span>
            </button>
          </div>

          {/* Tab 1: Numbered Workflow Walkthrough */}
          {activeTab === "walkthrough" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Numbered Operational Sequence ({guidance.workflowWalkthrough.length} Steps)
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Follow steps sequentially through the live interface
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {guidance.workflowWalkthrough.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="rounded-lg border border-border bg-card p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">
                          STEP 0{step.stepNumber}
                        </span>
                        <Badge variant="outline" className="font-mono text-[9px]">
                          STAGE
                        </Badge>
                      </div>
                      <h4 className="font-medium text-xs text-foreground">{step.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {step.keyAction && (
                      <div className="mt-2 rounded border border-primary/20 bg-primary/5 p-2 font-mono text-[10px] text-primary">
                        <span className="font-bold block text-foreground">Key Action:</span>
                        <span>{step.keyAction}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Suggested Actions to Try */}
          {activeTab === "actions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Interactive Actions to Exercise Right Now
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Safely test mutations without affecting production
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {guidance.suggestedActions.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-card p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-primary">
                        <Lightbulb className="size-3.5" />
                        <h4 className="font-mono text-xs font-bold text-foreground">{item.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        <span className="font-semibold text-foreground">Action: </span>
                        {item.action}
                      </p>
                    </div>

                    <div className="mt-2 rounded border border-border bg-muted/40 p-2 font-mono text-[10px] text-muted-foreground">
                      <span className="font-bold block text-foreground">Expected State Change:</span>
                      <span>{item.expectedResult}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Business Outcomes ("Why this matters") */}
          {activeTab === "outcomes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Measured Business Impact & Governance ROI
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Strategic business benefits delivered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {guidance.businessOutcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-card p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-mono text-xs font-bold text-foreground">{outcome.title}</h4>
                        {outcome.metricBadge && (
                          <Badge variant="outline" className="font-mono text-[9px] border-primary/40 text-primary">
                            {outcome.metricBadge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {outcome.impact}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-border/80 font-mono text-[10px] text-primary">
                      <CheckCircle2 className="size-3 shrink-0" />
                      <span>Verified Operational Outcome</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Ecosystem & Public Links */}
          {activeTab === "connections" && (
            <div className="space-y-6">
              {/* Related Operations Modules */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Connected Operations Modules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {guidance.relatedModules.map((m) => (
                    <div
                      key={m.code}
                      className="rounded-lg border border-border bg-card p-3.5 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-foreground">{m.name}</span>
                          <Badge variant="outline" className="font-mono text-[8px] uppercase">
                            {m.code}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {m.description}
                        </p>
                      </div>

                      <Link
                        href={m.path}
                        className="mt-2 inline-flex items-center justify-between rounded border border-border bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] text-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary min-h-[36px]"
                      >
                        <span>Open {m.name}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relevant Canonical Demo Scenarios */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Relevant Demo Scenarios (Interactive Sandboxes)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guidance.relevantDemoScenarios.map((demo) => (
                    <div
                      key={demo.scenarioSlug}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/[0.03] p-3.5 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-amber-400" />
                            <span className="font-mono text-xs font-bold text-foreground">{demo.name}</span>
                          </div>
                          <Badge variant="outline" className="font-mono text-[8px] border-amber-500/40 text-amber-400">
                            DEMO
                          </Badge>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">{demo.industry}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{demo.narrative}</p>
                      </div>

                      <Link
                        href={`/demo?scenario=${demo.scenarioSlug}`}
                        className="mt-2 inline-flex items-center justify-between rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 font-mono text-[11px] text-amber-300 transition hover:bg-amber-500/20 min-h-[36px]"
                      >
                        <span>Launch {demo.name} Demo Sandbox</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Public yorkstead.com Context & Verified Evidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Public Yorkstead.com References & Examples
                  </h3>
                  <Badge variant="outline" className="font-mono text-[9px]">
                    EXTERNAL VERIFIED AUTHORITY
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {guidance.publicLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-card p-3.5 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-foreground">{link.label}</span>
                          {link.badgeText && (
                            <Badge variant="secondary" className="font-mono text-[8px]">
                              {link.badgeText}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {link.description}
                        </p>
                      </div>

                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center justify-between rounded border border-border bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] text-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary min-h-[36px]"
                      >
                        <span className="truncate max-w-[180px]">yorkstead.com</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-muted-foreground">External</span>
                          <ExternalLink className="size-3 text-primary" />
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Visual Reference / Diagram Summary (if any) */}
          {guidance.visualReferences && guidance.visualReferences.length > 0 && (
            <div className="rounded-lg border border-border bg-card/60 p-3.5 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4 text-primary shrink-0" />
                <div>
                  <strong className="text-foreground">{guidance.visualReferences[0].title}: </strong>
                  <span>{guidance.visualReferences[0].caption}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
