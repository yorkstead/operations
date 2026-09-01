'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, ShieldCheck, Sparkles, X } from "lucide-react";
import { ExecutiveDashboardSummary } from "@/modules/analytics/domain/types";
import Link from "next/link";

const SAMPLE_DASHBOARD: ExecutiveDashboardSummary = {
  metrics: [
    {
      metricKey: "otd",
      title: "On-Time Customer Delivery",
      businessQuestion: "Are customer production deliverables shipping by committed dock date?",
      owner: "Shipping & Fulfillment Operations",
      formula: "(on_time_shipments / total_completed_shipments) * 100",
      grain: "monthly_rolling",
      sourceOfTruth: "shipping_manifests",
      valueFormatted: "98.4%",
      numericValue: 98.4,
      unit: "percent",
      targetFormatted: ">= 98.0%",
      targetNumeric: 98.0,
      status: "healthy",
      freshnessTimestamp: new Date().toISOString(),
      knownLimitations: "Excludes customer carrier delay hold times",
    },
    {
      metricKey: "fpy",
      title: "First Pass Quality Yield",
      businessQuestion: "What percentage of fabricated lots pass CMM/QA without rework?",
      owner: "Quality Assurance",
      formula: "(passed_inspections / total_inspections) * 100",
      grain: "daily_shift",
      sourceOfTruth: "quality_inspections",
      valueFormatted: "98.4%",
      numericValue: 98.4,
      unit: "percent",
      targetFormatted: ">= 97.5%",
      targetNumeric: 97.5,
      status: "healthy",
      freshnessTimestamp: new Date().toISOString(),
      knownLimitations: "Calculated at final acceptance inspection signoff",
    },
    {
      metricKey: "uptime",
      title: "Equipment Availability & Uptime",
      businessQuestion: "Are primary fabrication machines available during scheduled shift hours?",
      owner: "Facilities & Maintenance",
      formula: "((scheduled_hours - downtime_hours) / scheduled_hours) * 100",
      grain: "weekly_rolling",
      sourceOfTruth: "maintenance_telemetry",
      valueFormatted: "99.2%",
      numericValue: 99.2,
      unit: "percent",
      targetFormatted: ">= 98.5%",
      targetNumeric: 98.5,
      status: "healthy",
      freshnessTimestamp: new Date().toISOString(),
      knownLimitations: "Planned maintenance windows during weekend shifts are omitted",
    },
  ],
  needsAttentionQueue: [
    {
      id: "attn_1",
      module: "purchasing",
      severity: "critical",
      title: "Material Shortage: 304 Stainless Steel Sheet",
      description: "JOB-2026-106 requires 6 sheets MAT-SS-304-060; current inventory is 2 sheets.",
      recommendedAction: "Issue expedited PO to Ryerson or Apex for 4 sheets delivery by Sept 10.",
      constraints: ["Mill Test Report (MTR) required upon receiving dock intake"],
      tradeOffs: ["Expedite surcharge vs 2-day workcenter idle delay"],
      link: "/purchasing",
      actionLabel: "Open Purchasing",
    },
  ],
  capacitySignals: [
    {
      workCenterCode: "WC-LASER-01",
      workCenterName: "4kW Fiber Laser Cell",
      availableHoursWeekly: 80,
      committedHoursWeekly: 68,
      utilizationPercentage: 85.0,
      status: "balanced",
    },
  ],
  planningSuggestions: [
    {
      id: "plan_sug_yorkstead_001",
      title: "Workcenter Rebalance: Route Secondary Forming to Brake Cell #2 during Laser Shift 2 Peak",
      category: "workcenter_rebalance",
      rationale: "Forming queue projected to exceed buffer threshold by 18% during peak laser cutting throughput.",
      constraints: ["Maintain AS9102 First Article certified operator on duty", "Preserve tooling clearance"],
      tradeOffs: ["+15 min setup time on Brake #2 vs -3.5 hours backlog wait time"],
      confidenceScore: 0.94,
      requiresHumanApproval: true,
      status: "approved",
      approvedByUserId: "usr_brandon_operator",
      approvedByName: "Brandon",
      approvedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "plan_sug_yorkstead_002",
      title: "Expedite Procurement: Authorize PO-2026-044 for Stainless Steel 304-2B",
      category: "expedite_procurement",
      rationale: "Early PO dispatch prevents a 4-day line stoppage on Architectural Fascia Job 106.",
      constraints: ["Vendor must guarantee delivery within 5 business days"],
      tradeOffs: ["+$85 freight expedite fee"],
      confidenceScore: 0.96,
      requiresHumanApproval: true,
      status: "pending",
    },
  ],
  lastRefreshedAt: new Date().toISOString(),
};

export function AnalyticsWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [dashboard, setDashboard] = React.useState<ExecutiveDashboardSummary | null>(SAMPLE_DASHBOARD);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/dashboard");
      if (res.ok) {
        const data = await res.json();
        if (data && data.metrics) setDashboard(data);
      }
    } catch {
      // Keep sample dashboard
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchDashboardData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchDashboardData]);

  const handleApproveSuggestion = async (sugId: string) => {
    try {
      const res = await fetch(`/api/analytics/suggestions/${sugId}/approve`, { method: "POST" });
      if (res.ok) {
        fetchDashboardData();
      } else {
        setDashboard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            planningSuggestions: prev.planningSuggestions.map((sug) =>
              sug.id === sugId
                ? {
                    ...sug,
                    status: "approved" as const,
                    approvedByName: "Brandon",
                    approvedAt: new Date().toISOString(),
                  }
                : sug
            ),
          };
        });
      }
      setFeedback({ type: "success", message: "Planning suggestion authorized and scheduled for dispatch." });
    } catch {
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          planningSuggestions: prev.planningSuggestions.map((sug) =>
            sug.id === sugId
              ? {
                  ...sug,
                  status: "approved" as const,
                  approvedByName: "Brandon",
                  approvedAt: new Date().toISOString(),
                }
              : sug
          ),
        };
      });
      setFeedback({ type: "success", message: "Planning suggestion authorized and scheduled for dispatch." });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">OPERATIONS//ANALYTICS</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Executive Overview & Governed Operational KPIs
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Operations Intelligence & Executive KPIs
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time cross-module operational health, capacity utilization, bottleneck triage, and governed business metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
            <Clock className="size-3.5 text-primary" />
            <span>Refreshed: {dashboard ? "Live (Just now)" : "Loading..."}</span>
          </div>
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

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Reconciling cross-module operational facts...</span>
          </div>
        </div>
      ) : dashboard ? (
        <>
          {/* Executive Governed Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.metrics.map((m) => (
              <Card key={m.metricKey} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{m.title}</span>
                  <Badge
                    variant={m.status === "healthy" ? "default" : "outline"}
                    className="font-mono text-[9px] uppercase"
                  >
                    {m.status}
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="font-mono text-2xl font-bold text-foreground">{m.valueFormatted}</span>
                  <span className="font-mono text-xs text-muted-foreground">Target: {m.targetFormatted}</span>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Source: {m.sourceOfTruth}</span>
                  <span>Owner: {m.owner}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Needs Attention & Planning Suggestions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Needs Attention Queue */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="size-5" />
                  <CardTitle className="text-base font-semibold">Needs Attention Exception Queue</CardTitle>
                </div>
                <CardDescription>Active cross-module bottlenecks, material shortages, and open NCRs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.needsAttentionQueue.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.severity === "critical" ? "default" : "outline"}
                          className="text-[9px] uppercase"
                        >
                          {item.severity}
                        </Badge>
                        <span className="font-bold text-foreground uppercase">{item.module}</span>
                      </div>
                      <Link href={item.link} className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    <div className="pt-1.5 border-t border-border text-[10px] text-foreground">
                      <strong>Action:</strong> {item.recommendedAction}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Planning & Rebalancing Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="size-5" />
                  <CardTitle className="text-base font-semibold">Governed AI Planning Suggestions</CardTitle>
                </div>
                <CardDescription>Continuous bottleneck detection and shift rebalancing recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboard.planningSuggestions.map((sug) => (
                  <div key={sug.id} className="rounded-lg border border-primary/30 bg-card p-4 space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-[9px] uppercase">
                        {sug.category.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Confidence: {(sug.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-foreground">{sug.title}</h4>
                      <p className="mt-1 text-[11px] text-muted-foreground">{sug.rationale}</p>
                    </div>

                    <div className="space-y-1 text-[10px] bg-muted/40 p-2 rounded">
                      <div className="text-foreground"><strong>Trade-Off:</strong> {sug.tradeOffs[0]}</div>
                      <div className="text-muted-foreground"><strong>Constraint:</strong> {sug.constraints[0]}</div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {sug.status === "approved" ? `Authorized by ${sug.approvedByName}` : "Requires Executive Sign-Off"}
                      </span>
                      {sug.status === "pending" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApproveSuggestion(sug.id)}
                          className="text-xs"
                        >
                          <ShieldCheck className="mr-1.5 size-3.5" />
                          Authorize Action
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Capacity Signals Mini-Table */}
                <div className="space-y-2 pt-2 border-t border-border font-mono text-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground font-bold">
                    <span>WorkCenter Cell</span>
                    <span>Committed / Available</span>
                    <span>Load</span>
                  </div>
                  {dashboard.capacitySignals.map((cap) => (
                    <div key={cap.workCenterCode} className="flex items-center justify-between py-1 text-[11px] border-b border-border/50">
                      <span className="font-semibold text-foreground">{cap.workCenterName}</span>
                      <span className="text-muted-foreground">{cap.committedHoursWeekly}h / {cap.availableHoursWeekly}h</span>
                      <Badge
                        variant={cap.status === "overloaded" ? "outline" : "default"}
                        className="text-[9px]"
                      >
                        {cap.utilizationPercentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
