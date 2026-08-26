'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, CheckCircle2, DollarSign, Plus, ArrowRight, TrendingUp, X } from "lucide-react";
import { Quote, QuoteMetricsSummary } from "@/modules/quoting/domain/types";

export function QuoteFlowWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [metrics, setMetrics] = React.useState<QuoteMetricsSummary>({
    activeQuotesCount: 0,
    totalPipelineValueCents: 0,
    winRatePercentage: 68.5,
    averageMarginPercentage: 32.5,
  });

  // Modal State
  const [createOpen, setCreateOpen] = React.useState(false);
  const [customerName, setCustomerName] = React.useState("Alpine Aerospace Systems");
  const [customerEmail, setCustomerEmail] = React.useState("buyer@alpine.com");
  const [quoteTitle, setQuoteTitle] = React.useState("Titanium Brackets RFQ");
  const [partDesc, setPartDesc] = React.useState("Precision Laser Cut Flanges");
  const [qty, setQty] = React.useState(50);
  const [materialCost, setMaterialCost] = React.useState("42.00");
  const [laborCost, setLaborCost] = React.useState("28.00");
  const [machineCost, setMachineCost] = React.useState("15.00");
  const [targetMargin, setTargetMargin] = React.useState(35);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchQuoteData = React.useCallback(async () => {
    try {
      const [qRes, metricsRes] = await Promise.all([
        fetch("/api/quoting/quotes"),
        fetch("/api/quoting/metrics"),
      ]);

      if (qRes.ok) {
        const data = await qRes.json();
        setQuotes(data.quotes || []);
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics || {
          activeQuotesCount: 0,
          totalPipelineValueCents: 0,
          winRatePercentage: 68.5,
          averageMarginPercentage: 32.5,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load quoting registry." });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchQuoteData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchQuoteData]);

  const handleApproveMargin = async (quoteNumber: string) => {
    try {
      const res = await fetch(`/api/quoting/quotes/${quoteNumber}/approve`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve quote");
      }
      setFeedback({ type: "success", message: `Quote ${quoteNumber} margin approved by executive.` });
      fetchQuoteData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Approval failed" });
    }
  };

  const handleConvertJob = async (quoteNumber: string) => {
    try {
      const res = await fetch(`/api/quoting/quotes/${quoteNumber}/convert`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to convert quote");
      }
      const data = await res.json();
      setFeedback({ type: "success", message: `Quote ${quoteNumber} accepted. New live production Job (${data.jobId}) created.` });
      fetchQuoteData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Conversion failed" });
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const matCents = Math.round(parseFloat(materialCost || "0") * 100);
      const labCents = Math.round(parseFloat(laborCost || "0") * 100);
      const machCents = Math.round(parseFloat(machineCost || "0") * 100);

      const res = await fetch("/api/quoting/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: "cust_rfq",
          customerName,
          customerContactEmail: customerEmail,
          title: quoteTitle,
          lineItems: [
            {
              partDescription: partDesc,
              quantity: qty,
              materialCostCents: matCents,
              laborCostCents: labCents,
              machineCostCents: machCents,
              targetMarginPercent: targetMargin,
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create quote");
      }

      setFeedback({ type: "success", message: `Quote estimate created successfully.` });
      setCreateOpen(false);
      fetchQuoteData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Creation failed" });
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
            <Badge variant="default">OPERATIONS//QUOTEFLOW</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Cost Breakdown Estimator & Margin Governance
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            QuoteFlow & Estimating
          </h1>
          <p className="text-sm text-muted-foreground">
            Multi-tier cost breakdown, margin floor controls, and one-click quote-to-job handoffs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            New Quote Estimate
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
            <span className="font-mono text-xs text-muted-foreground">Active Pipeline Value</span>
            <DollarSign className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            ${(metrics.totalPipelineValueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Active Quotes</span>
            <Calculator className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.activeQuotesCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Average Quote Margin</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.averageMarginPercentage}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Historical Win Rate</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.winRatePercentage}%</p>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="size-5" />
            <CardTitle className="text-base">Quote Pipeline & Cost Estimates</CardTitle>
          </div>
          <CardDescription>Precision item cost models, margin floor enforcement, and job conversion.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex min-h-[25vh] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading quote pipeline...</span>
              </div>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
              <Calculator className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">Zero Active Quotes</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Create new quote estimates to calculate manufacturing costs and margins.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {quotes.map((q) => {
                const currentRev = q.revisions.find((r) => r.revisionNumber === q.currentRevisionNumber) || q.revisions[0];
                const totalAmount = currentRev ? (currentRev.totalAmountCents / 100).toFixed(2) : "0.00";
                const marginPercent = currentRev ? currentRev.overallMarginPercent : 0;
                return (
                  <div key={q.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{q.quoteNumber}</span>
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">
                          {q.customerName}
                        </Badge>
                        <Badge
                          variant={q.status === "converted_to_job" ? "default" : "outline"}
                          className={`font-mono text-[9px] uppercase ${
                            q.status === "internal_review" ? "border-destructive text-destructive" : ""
                          }`}
                        >
                          {q.status.replace(/_/g, " ")}
                        </Badge>
                        {q.requiresExecutiveApproval && q.status === "internal_review" && (
                          <Badge variant="outline" className="font-mono text-[9px] uppercase border-destructive text-destructive">
                            Margin &lt; {q.minMarginThresholdPercent}% Review Required
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-xs text-foreground">{q.title}</p>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                        <span>Total: <strong className="text-foreground">${totalAmount}</strong></span>
                        <span>&bull;</span>
                        <span>Margin: <strong className={marginPercent < 25 ? "text-destructive" : "text-primary"}>{marginPercent}%</strong></span>
                        <span>&bull;</span>
                        <span>Expires: {q.expiresAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {q.status === "internal_review" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApproveMargin(q.quoteNumber)}
                          className="font-mono text-xs"
                        >
                          <CheckCircle2 className="mr-1.5 size-3.5" />
                          Approve Margin
                        </Button>
                      )}
                      {(q.status === "approved" || q.status === "draft" || q.status === "sent_to_customer") && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConvertJob(q.quoteNumber)}
                          className="font-mono text-xs"
                        >
                          <ArrowRight className="mr-1.5 size-3.5" />
                          Convert to Job
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

      {/* Create Quote Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">New Manufacturing Estimate</h2>
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateQuote} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Quote Title / RFQ Project</label>
                <input
                  type="text"
                  required
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Part Description</label>
                  <input
                    type="text"
                    required
                    value={partDesc}
                    onChange={(e) => setPartDesc(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value, 10))}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Material ($)</label>
                  <input
                    type="text"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Labor ($)</label>
                  <input
                    type="text"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Machine ($)</label>
                  <input
                    type="text"
                    value={machineCost}
                    onChange={(e) => setMachineCost(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Margin (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(parseInt(e.target.value, 10))}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Calculating..." : "Generate Estimate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
