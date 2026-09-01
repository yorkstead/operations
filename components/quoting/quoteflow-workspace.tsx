'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  X,
  FileText,
  Briefcase,
  Printer,
} from "lucide-react";
import { Quote, QuoteMetricsSummary, CostModelType } from "@/modules/quoting/domain/types";

const SAMPLE_QUOTES: Quote[] = [
  {
    id: "qte_yorkstead_088",
    organizationId: "org_yorkstead_systems",
    quoteNumber: "QTE-2026-088",
    customerId: "cust_alpine_01",
    customerName: "Alpine Aerospace Systems",
    customerContactEmail: "m.vance@alpineaero.com",
    title: "Aerospace Avionics Enclosure Chassis Base Prototype (50 pcs)",
    status: "converted_to_job",
    currentRevisionNumber: 1,
    minMarginThresholdPercent: 25,
    requiresExecutiveApproval: false,
    approvedByUserId: "usr_brandon_operator",
    approvedByName: "Brandon",
    approvedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiresAt: "2026-10-31",
    convertedJobId: "job_yorkstead_104",
    convertedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    revisions: [
      {
        revisionNumber: 1,
        changeReason: "Initial CAD intake release with AS9102 inspection bundle",
        subtotalCents: 770000,
        discountPercent: 0,
        discountAmountCents: 0,
        taxPercent: 0,
        taxAmountCents: 0,
        totalAmountCents: 770000,
        overallMarginPercent: 35.0,
        lineItems: [
          {
            id: "qli_1",
            lineItemNumber: 1,
            partDescription: "Aerospace Avionics Enclosure Chassis Base - Rev B",
            drawingNumber: "DWG-2026-AE-104",
            revision: "B",
            quantity: 50,
            costBreakdown: {
              materialCostCents: 4800,
              laborCostCents: 2400,
              machineCostCents: 1800,
              outsourcingCostCents: 0,
              freightCostCents: 500,
              overheadCostCents: 500,
              totalCostCents: 10000,
            },
            targetMarginPercent: 35,
            unitPriceCents: 15400,
            totalPriceCents: 770000,
          },
        ],
        createdByUserId: "usr_brandon_operator",
        createdByName: "Brandon",
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: "qte_yorkstead_089",
    organizationId: "org_yorkstead_systems",
    quoteNumber: "QTE-2026-089",
    customerId: "cust_summit_02",
    customerName: "Summit Architectural Glass",
    customerContactEmail: "elena@summitglass.com",
    title: "Structural Facade Extrusion Mounting Brackets (250 pcs)",
    status: "approved",
    currentRevisionNumber: 1,
    minMarginThresholdPercent: 30,
    requiresExecutiveApproval: false,
    approvedByUserId: "usr_brandon_operator",
    approvedByName: "Brandon",
    approvedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: "2026-11-15",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    revisions: [
      {
        revisionNumber: 1,
        changeReason: "High-volume production run quote with tiered anodize tooling discount.",
        subtotalCents: 1250000,
        discountPercent: 5,
        discountAmountCents: 62500,
        taxPercent: 0,
        taxAmountCents: 0,
        totalAmountCents: 1187500,
        overallMarginPercent: 38.5,
        lineItems: [
          {
            id: "qli_2",
            lineItemNumber: 1,
            partDescription: "Structural Facade Extrusion Mounting Brackets - Rev A",
            drawingNumber: "DWG-2026-SF-201",
            revision: "A",
            quantity: 250,
            costBreakdown: {
              materialCostCents: 2200,
              laborCostCents: 900,
              machineCostCents: 800,
              outsourcingCostCents: 600,
              freightCostCents: 200,
              overheadCostCents: 300,
              totalCostCents: 5000,
            },
            targetMarginPercent: 38,
            unitPriceCents: 4750,
            totalPriceCents: 1187500,
          },
        ],
        createdByUserId: "usr_brandon_operator",
        createdByName: "Brandon",
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
  },
];

const SAMPLE_QUOTE_METRICS: QuoteMetricsSummary = {
  activeQuotesCount: 2,
  totalPipelineValueCents: 1957500,
  winRatePercentage: 75.0,
  averageMarginPercentage: 36.8,
};

export function QuoteFlowWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [quotes, setQuotes] = React.useState<Quote[]>(SAMPLE_QUOTES);
  const [metrics, setMetrics] = React.useState<QuoteMetricsSummary>(SAMPLE_QUOTE_METRICS);

  // Modal State
  const [createOpen, setCreateOpen] = React.useState(false);
  const [previewQuote, setPreviewQuote] = React.useState<Quote | null>(null);
  const [activeModelMode, setActiveModelMode] = React.useState<"consulting" | "manufacturing">("consulting");

  // Consulting Form State
  const [clientName, setClientName] = React.useState("Front Range Precision Manufacturing");
  const [clientEmail, setClientEmail] = React.useState("m.vance@frontrangemfg.com");
  const [proposalTitle, setProposalTitle] = React.useState("Shopfloor Automation & QR Dispatch Engine");
  const [costModelType, setCostModelType] = React.useState<CostModelType>("custom_software_milestone");
  const [engineeringHours, setEngineeringHours] = React.useState(180);
  const [hourlyRate, setHourlyRate] = React.useState(175);
  const [computeCost, setComputeCost] = React.useState(450);
  const [targetMargin, setTargetMargin] = React.useState(40);
  const [deliverablesText, setDeliverablesText] = React.useState(
    "Architecture scoping & schema design\nQR station terminal scanner PWA\nQuickBooks & ERP sync worker"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Manufacturing Form State (for backward compatibility)
  const [partDesc, setPartDesc] = React.useState("Precision Laser Cut Flanges");
  const [qty, setQty] = React.useState(50);
  const [materialCost, setMaterialCost] = React.useState("42.00");
  const [laborCost, setLaborCost] = React.useState("28.00");
  const [machineCost, setMachineCost] = React.useState("15.00");

  const fetchQuoteData = React.useCallback(async () => {
    try {
      const [qRes, metricsRes] = await Promise.all([
        fetch("/api/quoting/quotes"),
        fetch("/api/quoting/metrics"),
      ]);

      if (qRes.ok) {
        const data = await qRes.json();
        if (data.quotes && data.quotes.length > 0) setQuotes(data.quotes);
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      // Keep sample quotes
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
      setFeedback({ type: "success", message: `Proposal ${quoteNumber} accepted. New live client deliverable Job (${data.jobId}) initialized.` });
      fetchQuoteData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Conversion failed" });
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeModelMode === "consulting") {
        const deliverables = deliverablesText
          .split("\n")
          .map((d) => d.trim())
          .filter(Boolean);

        const res = await fetch("/api/quoting/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: `cust_${clientName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
            customerName: clientName,
            customerContactEmail: clientEmail,
            title: proposalTitle,
            costModelType,
            estimatedEngineeringHours: engineeringHours,
            hourlyRateCents: hourlyRate * 100,
            cloudComputePassThroughCents: computeCost * 100,
            deliverableSummary: deliverables,
            targetMarginPercent: targetMargin,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create proposal");
        }

        const data = await res.json();
        setFeedback({ type: "success", message: `Proposal ${data.quote?.quoteNumber || ""} created with Cloudflare R2 vault export.` });
      } else {
        const matCents = Math.round(parseFloat(materialCost || "0") * 100);
        const labCents = Math.round(parseFloat(laborCost || "0") * 100);
        const machCents = Math.round(parseFloat(machineCost || "0") * 100);

        const res = await fetch("/api/quoting/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: "cust_rfq",
            customerName: clientName,
            customerContactEmail: clientEmail,
            title: proposalTitle,
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

        setFeedback({ type: "success", message: "Manufacturing estimate created successfully." });
      }

      setCreateOpen(false);
      fetchQuoteData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Creation failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live Calculations for Consulting Scope
  const calculatedLaborCost = engineeringHours * hourlyRate;
  const calculatedTotalCost = calculatedLaborCost + computeCost;
  const calculatedMarginFactor = targetMargin >= 100 ? 0.6 : 1 - targetMargin / 100;
  const calculatedPrice = Math.round(calculatedTotalCost / (calculatedMarginFactor > 0 ? calculatedMarginFactor : 1));
  const calculatedGrossProfit = calculatedPrice - calculatedTotalCost;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono text-[9px] uppercase">
              CONSULTING & PRICING
            </Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Yorkstead Systems Quoting & SOW Scoping Engine
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Proposals & Cost Modeling
          </h1>
          <p className="text-sm text-muted-foreground">
            Fixed-price discovery audits, custom software milestone pricing, infrastructure SLA retainers, and R2 PDF proposals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={() => setCreateOpen(true)} className="gap-1 font-mono text-xs">
            <Plus className="size-3.5" />
            <span>New Scope / Proposal</span>
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
        <Card className="p-4 border-border bg-card/80">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Active Proposal Pipeline</span>
            <DollarSign className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            ${(metrics.totalPipelineValueCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4 border-border bg-card/80">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Active Proposals</span>
            <Briefcase className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.activeQuotesCount}</p>
        </Card>
        <Card className="p-4 border-border bg-card/80">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Target Gross Margin</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.averageMarginPercentage}%</p>
        </Card>
        <Card className="p-4 border-border bg-card/80">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Historical Win Rate</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.winRatePercentage}%</p>
        </Card>
      </div>

      {/* Proposals & Quotes Table */}
      <Card className="border-border bg-card/80">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="size-5" />
            <CardTitle className="text-base">Consulting Proposals & Scope Estimates</CardTitle>
          </div>
          <CardDescription>
            Fixed-price discovery, custom software milestones, SLA retainers, and Cloudflare R2 document exports.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex min-h-[25vh] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading proposal pipeline...</span>
              </div>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
              <Briefcase className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">Zero Active Proposals</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Create new proposal scopes to calculate engineering costs, milestone payments, and margins.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {quotes.map((q) => {
                const currentRev = q.revisions.find((r) => r.revisionNumber === q.currentRevisionNumber) || q.revisions[0];
                const totalAmount = currentRev ? (currentRev.totalAmountCents / 100).toFixed(2) : "0.00";
                const marginPercent = currentRev ? currentRev.overallMarginPercent : 0;
                const isConsulting = Boolean(q.consultingScope);

                return (
                  <div key={q.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{q.quoteNumber}</span>
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">
                          {q.customerName}
                        </Badge>
                        {isConsulting && (
                          <Badge variant="secondary" className="font-mono text-[9px] uppercase">
                            {q.consultingScope?.costModelType.replace(/_/g, " ")}
                          </Badge>
                        )}
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
                      <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                        <span>Total: <strong className="text-foreground">${totalAmount}</strong></span>
                        <span>&bull;</span>
                        <span>Margin: <strong className={marginPercent < 25 ? "text-destructive" : "text-emerald-400"}>{marginPercent}%</strong></span>
                        {q.consultingScope?.paymentMilestones && (
                          <>
                            <span>&bull;</span>
                            <span>{q.consultingScope.paymentMilestones.length} Payment Milestones</span>
                          </>
                        )}
                        {q.consultingScope?.proposalPdfR2Key && (
                          <>
                            <span>&bull;</span>
                            <span className="text-sky-400">R2 Vault Attached</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewQuote(q)}
                        className="font-mono text-xs gap-1"
                      >
                        <FileText className="size-3.5" />
                        <span>Proposal PDF</span>
                      </Button>

                      {q.status === "internal_review" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApproveMargin(q.quoteNumber)}
                          className="font-mono text-xs gap-1"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>Approve</span>
                        </Button>
                      )}
                      {(q.status === "approved" || q.status === "draft" || q.status === "sent_to_customer") && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConvertJob(q.quoteNumber)}
                          className="font-mono text-xs gap-1"
                        >
                          <ArrowRight className="size-3.5" />
                          <span>Accept & Hand off</span>
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

      {/* PDF Proposal Preview Modal */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-mono text-[9px]">YORKSTEAD SYSTEMS</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{previewQuote.quoteNumber}</span>
                </div>
                <h2 className="text-lg font-bold text-foreground mt-1">{previewQuote.title}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewQuote(null)} className="size-8 p-0">
                <X className="size-4" />
              </Button>
            </div>

            {/* Client & Metadata */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/80 bg-background/60 p-4 font-mono text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Prepared For Client</span>
                <strong className="text-foreground text-sm">{previewQuote.customerName}</strong>
                <p className="text-muted-foreground text-[11px]">{previewQuote.customerContactEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px] uppercase">Total Scope Fee</span>
                <strong className="text-primary text-base">
                  ${(
                    (previewQuote.revisions[0]?.totalAmountCents || 0) / 100
                  ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
                <p className="text-emerald-400 text-[11px]">
                  {previewQuote.revisions[0]?.overallMarginPercent}% Margin
                </p>
              </div>
            </div>

            {/* Payment Milestones */}
            {previewQuote.consultingScope?.paymentMilestones && (
              <div className="space-y-2">
                <h3 className="font-mono text-xs uppercase font-bold text-foreground">
                  Payment Milestones & Schedule
                </h3>
                <div className="space-y-1.5">
                  {previewQuote.consultingScope.paymentMilestones.map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-center justify-between rounded-lg border border-border/70 bg-background/40 p-3 font-mono text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{pm.milestoneName}</span>
                        <span className="text-muted-foreground text-[10px] block">Trigger: {pm.triggerCondition}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-foreground font-bold">
                          ${(pm.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-muted-foreground text-[10px] block">({pm.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cloudflare R2 Vault Key */}
            {previewQuote.consultingScope?.proposalPdfR2Key && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 font-mono text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-sky-400 shrink-0" />
                  <span className="text-sky-300 truncate">{previewQuote.consultingScope.proposalPdfR2Key}</span>
                </div>
                <Badge variant="outline" className="text-[9px] border-sky-500/40 text-sky-400">
                  R2 Zero Egress
                </Badge>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setPreviewQuote(null)} className="font-mono text-xs">
                Close
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="font-mono text-xs gap-1.5"
              >
                <Printer className="size-3.5" />
                <span>Print / Save PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal & Scope Builder Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-base font-bold text-foreground">Interactive Proposal & Scope Builder</h2>
                <p className="text-xs text-muted-foreground">Calculate labor, compute pass-through, margins, and payment milestones.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-lg border border-border p-1 bg-background/60 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveModelMode("consulting")}
                className={`flex-1 py-1.5 rounded-md transition font-semibold ${
                  activeModelMode === "consulting"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Software & Automation Consulting
              </button>
              <button
                type="button"
                onClick={() => setActiveModelMode("manufacturing")}
                className={`flex-1 py-1.5 rounded-md transition font-semibold ${
                  activeModelMode === "manufacturing"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Physical Fabrication / Manufacturing
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Client Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Proposal / Scope Title</label>
                <input
                  type="text"
                  required
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {activeModelMode === "consulting" ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block font-mono text-[10px] uppercase text-muted-foreground">Cost Model</label>
                      <select
                        value={costModelType}
                        onChange={(e) => setCostModelType(e.target.value as CostModelType)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-2.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="custom_software_milestone">Milestone Software Build</option>
                        <option value="discovery_audit">Fixed Discovery Audit</option>
                        <option value="monthly_sla_retainer">Monthly SLA Retainer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-muted-foreground">Dev Hours</label>
                      <input
                        type="number"
                        min={1}
                        value={engineeringHours}
                        onChange={(e) => setEngineeringHours(parseInt(e.target.value, 10) || 0)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-muted-foreground">Rate ($/hr)</label>
                      <input
                        type="number"
                        min={50}
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(parseInt(e.target.value, 10) || 0)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-muted-foreground">Cloud Compute & API Pass-through ($)</label>
                      <input
                        type="number"
                        min={0}
                        value={computeCost}
                        onChange={(e) => setComputeCost(parseInt(e.target.value, 10) || 0)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-muted-foreground">Target Margin (%)</label>
                      <input
                        type="number"
                        min={10}
                        max={90}
                        value={targetMargin}
                        onChange={(e) => setTargetMargin(parseInt(e.target.value, 10) || 0)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-muted-foreground">
                      Deliverables Checklist (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={deliverablesText}
                      onChange={(e) => setDeliverablesText(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Real-time Pricing & Margin Calculation Box */}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Estimated Internal Cost:</span>
                      <strong className="text-foreground">${calculatedTotalCost.toLocaleString()}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Projected Gross Profit:</span>
                      <strong className="text-emerald-400">${calculatedGrossProfit.toLocaleString()} ({targetMargin}%)</strong>
                    </div>
                    <div className="flex items-center justify-between border-t border-primary/20 pt-2 font-mono">
                      <span className="text-sm font-bold text-foreground">Target Client Fee:</span>
                      <span className="text-lg font-bold text-primary">${calculatedPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="block font-mono text-[10px] uppercase text-muted-foreground">Part Description</label>
                    <input
                      type="text"
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
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)} className="font-mono text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting} className="font-mono text-xs">
                  {isSubmitting ? "Generating Scope..." : "Generate Proposal & R2 Export"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
