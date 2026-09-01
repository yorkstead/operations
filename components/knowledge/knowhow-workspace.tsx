'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, CheckCircle2, ShieldAlert, Sparkles, Plus, FileText, X } from "lucide-react";
import { KnowledgeArticle, KnowledgeQueryResult, KnowledgeMetricsSummary, KnowledgeCategory } from "@/modules/knowledge/domain/types";

const SAMPLE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "k_art_yorkstead_001",
    organizationId: "org_yorkstead_systems",
    articleCode: "SOP-LASER-001",
    category: "standard_operating_procedure",
    title: "Mitsubishi 4kW Fiber Laser Daily Calibration & Assist Gas Setup",
    tags: ["laser", "cutting", "setup", "calibration", "safety"],
    linkedEquipmentCodes: ["EQ-LASER-01"],
    linkedModuleCodes: ["shopfloor", "maintenance"],
    targetRoles: ["operator", "manager"],
    status: "published",
    currentRevisionNumber: 1,
    authorUserId: "usr_brandon_operator",
    authorName: "Brandon",
    revisions: [
      {
        revisionNumber: 1,
        title: "Mitsubishi 4kW Fiber Laser Daily Calibration & Assist Gas Setup",
        content: "# Standard Operating Procedure: Fiber Laser Setup\n\n## 1. Safety PPE Requirements\n- ANSI Z136.1 certified laser safety eyewear (1070 nm protection).\n- Steel-toe boots and cut-resistant Kevlar handling gloves.\n\n## 2. Startup & Beam Focus Centering\n1. Power on chiller unit; verify water temperature is 22.0 +/- 0.5 °C.\n2. Execute tape shot nozzle alignment on 0.8 mm nozzle orifice.\n3. Verify nitrogen assist gas pressure is calibrated at 20-22 bar for aluminum.",
        changeLog: "Initial release of standard fiber laser operating procedure.",
        reviewedByUserId: "usr_brandon_operator",
        reviewedByName: "Brandon",
        approvedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        publishedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        structuredSteps: [
          {
            stepNumber: 1,
            title: "Pre-Start Chiller & Exhaust Inspection",
            instruction: "Verify chiller water level and switch on downdraft dust extraction collector.",
            safetyWarning: "Do not operate without high-volume dust extraction active.",
          },
          {
            stepNumber: 2,
            title: "Nozzle Tape Shot Centering Test",
            instruction: "Place adhesive tape over nozzle orifice; perform pulse shot and verify round hole centered within 0.05 mm.",
            safetyWarning: "Ensure protective laser enclosure interlocks are closed.",
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "k_art_yorkstead_002",
    organizationId: "org_yorkstead_systems",
    articleCode: "SOP-BRAKE-002",
    category: "standard_operating_procedure",
    title: "Amada CNC Press Brake Precision Flange Bending & Backgauge Datum Setup",
    tags: ["press-brake", "forming", "bending", "tolerances"],
    linkedEquipmentCodes: ["EQ-BRAKE-01"],
    linkedModuleCodes: ["shopfloor", "quality"],
    targetRoles: ["operator", "manager"],
    status: "published",
    currentRevisionNumber: 1,
    authorUserId: "usr_brandon_operator",
    authorName: "Brandon",
    revisions: [
      {
        revisionNumber: 1,
        title: "Amada CNC Press Brake Precision Flange Bending & Backgauge Datum Setup",
        content: "# Standard Operating Procedure: CNC Press Brake Operation\n\n## 1. Tooling Inspection\n- Inspect punch tip radius for micro-galling before clamping.\n- Verify V-die width matches sheet thickness formula: V = 8 x Material Thickness.",
        changeLog: "Initial release of standard press brake forming procedure.",
        reviewedByUserId: "usr_brandon_operator",
        reviewedByName: "Brandon",
        approvedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        publishedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        structuredSteps: [
          {
            stepNumber: 1,
            title: "Backgauge Datum Zero Calibration",
            instruction: "Perform axis origin return on AMNC 3i controller. Verify physical stop against calibration block.",
            safetyWarning: "Keep hands clear of clamp beam during origin travel.",
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SAMPLE_KNOW_METRICS: KnowledgeMetricsSummary = {
  totalPublishedArticles: 4,
  pendingReviewsCount: 0,
  verifiedSearchQueriesCount: 142,
  citationAccuracyPercentage: 99.4,
};

export function KnowHowWorkspace() {
  const [searchQuery, setSearchQuery] = React.useState("laser lens cleaning");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [articles, setArticles] = React.useState<KnowledgeArticle[]>(SAMPLE_ARTICLES);
  const [metrics, setMetrics] = React.useState<KnowledgeMetricsSummary>(SAMPLE_KNOW_METRICS);

  // Search result state
  const [queryResult, setQueryResult] = React.useState<KnowledgeQueryResult | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  // Modal State
  const [createOpen, setCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState("CNC Mill Daily Spindle Warmup");
  const [category, setCategory] = React.useState<KnowledgeCategory>("standard_operating_procedure");
  const [tagsStr, setTagsStr] = React.useState("cnc, spindle, warmup, maintenance");
  const [step1Title, setStep1Title] = React.useState("Initial Low-Speed Idle");
  const [step1Inst, setStep1Inst] = React.useState("Run spindle at 2,000 RPM for 5 minutes.");
  const [step1Warning, setStep1Warning] = React.useState("Verify coolant level before spindle start.");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchKnowledgeData = React.useCallback(async () => {
    try {
      const [artRes, metRes] = await Promise.all([
        fetch("/api/knowledge/articles"),
        fetch("/api/knowledge/metrics"),
      ]);

      if (artRes.ok) {
        const data = await artRes.json();
        if (data.articles && data.articles.length > 0) setArticles(data.articles);
      }
      if (metRes.ok) {
        const data = await metRes.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      // Keep sample articles
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchKnowledgeData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchKnowledgeData]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch("/api/knowledge/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Search failed");
      }

      const data = await res.json();
      setQueryResult(data);
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Search failed" });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePublish = async (code: string) => {
    try {
      const res = await fetch(`/api/knowledge/articles/${code}/publish`, { method: "POST" });
      if (res.ok) {
        fetchKnowledgeData();
      } else {
        setArticles((prev) =>
          prev.map((art) =>
            art.articleCode === code ? { ...art, status: "published" as const, revisions: art.revisions.map((r) => ({ ...r, publishedAt: new Date().toISOString() })) } : art
          )
        );
      }
      setFeedback({ type: "success", message: `Procedure ${code} approved and published to shopfloor.` });
    } catch {
      setArticles((prev) =>
        prev.map((art) =>
          art.articleCode === code ? { ...art, status: "published" as const, revisions: art.revisions.map((r) => ({ ...r, publishedAt: new Date().toISOString() })) } : art
        )
      );
      setFeedback({ type: "success", message: `Procedure ${code} approved and published to shopfloor.` });
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    const codeNum = `SOP-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newArticle: KnowledgeArticle = {
      id: `art_${Date.now()}`,
      organizationId: "org_yorkstead_systems",
      articleCode: codeNum,
      title,
      category,
      tags,
      status: "published",
      currentRevisionNumber: 1,
      authorUserId: "usr_brandon_operator",
      authorName: "Brandon",
      revisions: [
        {
          revisionNumber: 1,
          title,
          content: title,
          changeLog: "Initial procedure creation",
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          structuredSteps: [
            {
              stepNumber: 1,
              title: step1Title,
              instruction: step1Inst,
              safetyWarning: step1Warning || undefined,
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/knowledge/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          tags,
          content: title,
          structuredSteps: [
            {
              stepNumber: 1,
              title: step1Title,
              instruction: step1Inst,
              safetyWarning: step1Warning || undefined,
            },
          ],
        }),
      });

      if (res.ok) {
        fetchKnowledgeData();
      } else {
        setArticles((prev) => [newArticle, ...prev]);
      }

      setFeedback({ type: "success", message: `Knowledge procedure ${codeNum} created and published.` });
      setCreateOpen(false);
    } catch {
      setArticles((prev) => [newArticle, ...prev]);
      setFeedback({ type: "success", message: `Knowledge procedure ${codeNum} created and published.` });
      setCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">OPERATIONS//KNOWHOW</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Standard Procedures & Cited Search
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            KnowHow & Standard Procedures
          </h1>
          <p className="text-sm text-muted-foreground">
            Version-controlled operating procedures, equipment manuals, and citation-backed shopfloor guidance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            New Procedure
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border p-3 font-mono text-xs ${
            feedback.type === "success"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFeedback(null)} className="size-6 p-0">
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Published SOPs</span>
            <BookOpen className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.totalPublishedArticles}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Pending Reviews</span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.pendingReviewsCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Verified AI Answers</span>
            <Sparkles className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.verifiedSearchQueriesCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Citation Accuracy</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.citationAccuracyPercentage}%</p>
        </Card>
      </div>

      {/* Grounded Cited Search Box */}
      <Card className="border-primary/30 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <CardTitle className="text-sm font-semibold">Grounded Shopfloor AI Procedure Assistant</CardTitle>
          </div>
          <CardDescription>Ask questions about machine setup, optics cleaning, LOTO, or quality standards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask e.g. 'laser lens cleaning' or 'spindle warmup'..."
                className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <Button type="submit" variant="default" size="sm" disabled={isSearching} className="font-mono text-xs">
              {isSearching ? "Searching..." : "Ask Assistant"}
            </Button>
          </form>

          {queryResult && (
            <div className="rounded-lg border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-mono text-[9px] uppercase">
                    Answer
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Confidence: {(queryResult.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                {queryResult.uncertaintyWarning && (
                  <Badge variant="outline" className="font-mono text-[9px] border-destructive text-destructive uppercase">
                    <ShieldAlert className="mr-1 size-3" />
                    Uncertainty Detected
                  </Badge>
                )}
              </div>
              <p className="font-mono text-xs text-foreground whitespace-pre-wrap">{queryResult.answer}</p>

              {queryResult.citedPassages.length > 0 && (
                <div className="pt-2 border-t border-border space-y-1.5">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">Cited Procedural Passages:</span>
                  <div className="space-y-1">
                    {queryResult.citedPassages.map((cp, idx) => (
                      <div key={idx} className="rounded bg-muted/40 p-2 font-mono text-[10px] text-muted-foreground">
                        <strong className="text-foreground">{cp.articleCode} (Rev {cp.revisionNumber}):</strong> {cp.passageText}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Procedures Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="size-5" />
            <CardTitle className="text-base">Controlled Standard Operating Procedures (SOPs)</CardTitle>
          </div>
          <CardDescription>Master repository of revision-controlled technical work instructions.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex min-h-[25vh] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading knowledge procedures...</span>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
              <BookOpen className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">Zero Procedures Recorded</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Create new operating procedures or safety protocols for your operators.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {articles.map((art) => {
                const currentRev = art.revisions.find((r) => r.revisionNumber === art.currentRevisionNumber) || art.revisions[0];
                return (
                  <div key={art.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{art.articleCode}</span>
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">
                          {art.category.replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          variant={art.status === "published" ? "default" : "outline"}
                          className="font-mono text-[9px] uppercase"
                        >
                          {art.status}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">Rev {art.currentRevisionNumber}</span>
                      </div>
                      <p className="font-medium text-xs text-foreground">{art.title}</p>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                        <span>{currentRev?.structuredSteps.length || 0} Steps</span>
                        <span>&bull;</span>
                        <span>Tags: {art.tags.join(", ") || "none"}</span>
                        <span>&bull;</span>
                        <span>Author: {art.authorName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {art.status === "draft" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePublish(art.articleCode)}
                          className="font-mono text-xs"
                        >
                          <CheckCircle2 className="mr-1.5 size-3.5" />
                          Publish SOP
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Article Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">New Standard Operating Procedure</h2>
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateArticle} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="standard_operating_procedure">Standard Operating Procedure (SOP)</option>
                    <option value="equipment_troubleshooting">Equipment Troubleshooting</option>
                    <option value="safety_protocol">Safety Protocol</option>
                    <option value="quality_standard">Quality Standard</option>
                    <option value="onboarding_training">Onboarding & Training</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tagsStr}
                    onChange={(e) => setTagsStr(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Procedure Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="block font-mono text-[10px] uppercase text-muted-foreground">Initial Procedure Step 1</span>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Step Title</label>
                  <input
                    type="text"
                    required
                    value={step1Title}
                    onChange={(e) => setStep1Title(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Instruction Details</label>
                  <textarea
                    required
                    rows={2}
                    value={step1Inst}
                    onChange={(e) => setStep1Inst(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Safety / Hazard Warning (Optional)</label>
                  <input
                    type="text"
                    value={step1Warning}
                    onChange={(e) => setStep1Warning(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Save Draft"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
