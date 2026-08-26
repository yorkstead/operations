'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock, ArrowRight, ShieldCheck, Sparkles, X } from "lucide-react";
import { ExecutiveDashboardSummary } from "@/modules/analytics/domain/types";
import Link from "next/link";

export function AnalyticsWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [dashboard, setDashboard] = React.useState<ExecutiveDashboardSummary | null>(null);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/dashboard");
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load executive analytics." });
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Approval failed");
      }
      setFeedback({ type: "success", message: "Planning suggestion authorized and scheduled for dispatch." });
      fetchDashboardData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Approval failed" });
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
