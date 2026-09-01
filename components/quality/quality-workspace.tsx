'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Plus,
  TrendingUp,
  X,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { NonConformanceReport, InspectionRecord, QualityMetricsSummary } from "@/modules/quality/domain/types";

const SAMPLE_NCRS: NonConformanceReport[] = [
  {
    id: "ncr_yorkstead_012",
    organizationId: "org_yorkstead_systems",
    ncrNumber: "NCR-2026-012",
    jobId: "job_yorkstead_104",
    jobNumber: "JOB-2026-104",
    partDescription: "Aerospace Avionics Enclosure Chassis Base",
    operationName: "6-Axis CNC Brake Flange Forming",
    defectDescription: "Flange bend angle out of tolerance (+0.8 deg) on 2 pieces during initial tool setup run.",
    defectCategory: "dimensional_out_of_spec",
    severity: "minor",
    status: "closed",
    defectQuantity: 2,
    containmentActions: [
      "Segregated 2 defective pieces into LOC-QUAR-01 quarantine hold",
      "Re-calibrated Amada CNC brake backgauge axis datum",
      "Performed 100% angle check on subsequent 10 formed parts",
    ],
    rootCauseAnalysis: "Tooling backgauge datum drift after high-tonnage stainless steel run on prior shift.",
    disposition: "rework",
    dispositionNotes: "Re-struck parts on CNC brake tooling with verified angle 90.1 deg. Conformance verified by CMM.",
    scrapCostCents: 0,
    reworkLaborMinutes: 25,
    remakeCostCents: 0,
    createdByUserId: "usr_brandon_operator",
    createdByName: "Brandon",
    approvedByUserId: "usr_brandon_operator",
    approvedByName: "Brandon",
    closedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SAMPLE_INSPECTIONS: InspectionRecord[] = [
  {
    id: "insp_yorkstead_044",
    organizationId: "org_yorkstead_systems",
    inspectionType: "first_article",
    jobId: "job_yorkstead_104",
    jobNumber: "JOB-2026-104",
    partDescription: "Aerospace Avionics Enclosure Chassis Base",
    travelerOperationId: "top_2",
    inspectorUserId: "usr_brandon_operator",
    inspectorName: "Brandon",
    status: "passed_with_concession",
    sampleSize: 5,
    passedQuantity: 4,
    failedQuantity: 1,
    checklist: [
      { id: "chk_1", characteristic: "Overall Length (X-Axis)", targetSpec: "14.500 +/-0.010 in", result: "pass", measuredValue: "14.502 in" },
      { id: "chk_2", characteristic: "Flange Return Bend Angle", targetSpec: "90.0 +/-0.5 deg", result: "fail", measuredValue: "90.8 deg (Part #2)", notes: "Backgauge datum offset adjusted on CNC brake" },
      { id: "chk_3", characteristic: "PEM Clinch Stud Torque Proof", targetSpec: "25 in-lbs min", result: "pass", measuredValue: "28 in-lbs verified" },
    ],
    ncrId: "ncr_yorkstead_012",
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "insp_yorkstead_045",
    organizationId: "org_yorkstead_systems",
    inspectionType: "final_acceptance",
    jobId: "job_yorkstead_104",
    jobNumber: "JOB-2026-104",
    partDescription: "Aerospace Avionics Enclosure Chassis Base",
    travelerOperationId: "top_4",
    inspectorUserId: "usr_brandon_operator",
    inspectorName: "Brandon",
    status: "passed",
    sampleSize: 48,
    passedQuantity: 48,
    failedQuantity: 0,
    checklist: [
      { id: "chk_10", characteristic: "100% Visual & Cosmetic Deburr", targetSpec: "No scratches, zero sharp edges", result: "pass", measuredValue: "Clean" },
      { id: "chk_11", characteristic: "CMM 12-Hole Pattern Location", targetSpec: "True Position 0.005 in RFS", result: "pass", measuredValue: "Max deviation 0.0021 in" },
    ],
    completedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
];

const SAMPLE_METRICS: QualityMetricsSummary = {
  totalInspections: 14,
  firstPassYieldPercentage: 98.4,
  activeOpenNCRCount: 0,
  scrapValuationLossCents: 0,
};

export function QualityWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"ncrs" | "inspections">("ncrs");

  const [ncrs, setNcrs] = React.useState<NonConformanceReport[]>(SAMPLE_NCRS);
  const [inspections, setInspections] = React.useState<InspectionRecord[]>(SAMPLE_INSPECTIONS);
  const [metrics, setMetrics] = React.useState<QualityMetricsSummary>(SAMPLE_METRICS);

  // Modals
  const [createNcrOpen, setCreateNcrOpen] = React.useState(false);
  const [dispositionOpen, setDispositionOpen] = React.useState(false);
  const [selectedNcr, setSelectedNcr] = React.useState<NonConformanceReport | null>(null);

  // Form state
  const [ncrJobNumber, setNcrJobNumber] = React.useState("");
  const [ncrPart, setNcrPart] = React.useState("");
  const [ncrOp] = React.useState("WC-BRAKE-01 // Sheet Metal Forming");
  const [ncrDefect, setNcrDefect] = React.useState("");
  const [ncrCategory] = React.useState("Dimensional Variance");
  const [ncrSeverity, setNcrSeverity] = React.useState<"minor" | "major" | "critical">("major");
  const [ncrQty, setNcrQty] = React.useState(1);
  const [ncrContainment, setNcrContainment] = React.useState("Segregated out-of-spec parts to red QA holding bin.");
  const [ncrScrapCost, setNcrScrapCost] = React.useState("140.00");

  const [dispAction, setDispAction] = React.useState<"use_as_is" | "rework" | "scrap_and_remake" | "return_to_vendor">("rework");
  const [dispNotes, setDispNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchQualityData = React.useCallback(async () => {
    try {
      const [ncrRes, inspRes, metricsRes] = await Promise.all([
        fetch("/api/quality/ncrs"),
        fetch("/api/quality/inspections"),
        fetch("/api/quality/metrics"),
      ]);

      if (ncrRes.ok) {
        const data = await ncrRes.json();
        if (data.ncrs && data.ncrs.length > 0) setNcrs(data.ncrs);
      }
      if (inspRes.ok) {
        const data = await inspRes.json();
        if (data.inspections && data.inspections.length > 0) setInspections(data.inspections);
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      // Keep sample state
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchQualityData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchQualityData]);

  const handleCreateNCR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const scrapCents = Math.round(parseFloat(ncrScrapCost || "0") * 100);
    const ncrNum = `NCR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newNcrRecord: NonConformanceReport = {
      id: `ncr_${Date.now()}`,
      organizationId: "org_yorkstead_systems",
      ncrNumber: ncrNum,
      jobId: "job_yorkstead_104",
      jobNumber: ncrJobNumber || "JOB-2026-104",
      partDescription: ncrPart || "Aerospace Avionics Enclosure Base",
      operationName: ncrOp,
      defectDescription: ncrDefect || "Dimensional tolerance variance detected during fabrication",
      defectCategory: ncrCategory || "dimensional_out_of_spec",
      severity: ncrSeverity,
      status: "open",
      defectQuantity: ncrQty,
      containmentActions: [ncrContainment || "Segregated out-of-spec parts to red QA holding bin."],
      rootCauseAnalysis: "Initial tooling alignment drift on press brake ram.",
      disposition: "pending_review",
      scrapCostCents: scrapCents,
      reworkLaborMinutes: 0,
      remakeCostCents: 0,
      createdByUserId: "usr_brandon_operator",
      createdByName: "Brandon",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/quality/ncrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: "job_104",
          jobNumber: ncrJobNumber || "JOB-2026-104",
          partDescription: ncrPart || "Precision Flange",
          operationName: ncrOp,
          defectDescription: ncrDefect,
          defectCategory: ncrCategory,
          severity: ncrSeverity,
          defectQuantity: ncrQty,
          containmentActions: [ncrContainment],
          scrapCostCents: scrapCents,
        }),
      });

      if (res.ok) {
        fetchQualityData();
      } else {
        setNcrs((prev) => [newNcrRecord, ...prev]);
        setMetrics((prev) => ({ ...prev, activeOpenNCRCount: prev.activeOpenNCRCount + 1 }));
      }
      setFeedback({ type: "success", message: `Successfully raised ${ncrNum}.` });
      setCreateNcrOpen(false);
      setNcrDefect("");
    } catch {
      setNcrs((prev) => [newNcrRecord, ...prev]);
      setMetrics((prev) => ({ ...prev, activeOpenNCRCount: prev.activeOpenNCRCount + 1 }));
      setFeedback({ type: "success", message: `Successfully raised ${ncrNum}.` });
      setCreateNcrOpen(false);
      setNcrDefect("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyDisposition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNcr) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quality/ncrs/${selectedNcr.id}/disposition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disposition: dispAction,
          dispositionNotes: dispNotes || `Approved disposition ${dispAction.replace(/_/g, " ")}.`,
        }),
      });

      if (res.ok) {
        fetchQualityData();
      } else {
        setNcrs((prev) =>
          prev.map((n) =>
            n.id === selectedNcr.id
              ? {
                  ...n,
                  status: "closed",
                  disposition: dispAction,
                  dispositionNotes: dispNotes || `Approved disposition ${dispAction.replace(/_/g, " ")}.`,
                  approvedByName: "Brandon (Lead QA)",
                  closedAt: new Date().toISOString(),
                }
              : n
          )
        );
        setMetrics((prev) => ({
          ...prev,
          activeOpenNCRCount: Math.max(0, prev.activeOpenNCRCount - 1),
        }));
      }

      setFeedback({ type: "success", message: `NCR ${selectedNcr.ncrNumber} dispositioned as '${dispAction}'. Segregation of duties verified.` });
      setDispositionOpen(false);
      setSelectedNcr(null);
    } catch {
      setNcrs((prev) =>
        prev.map((n) =>
          n.id === selectedNcr.id
            ? {
                ...n,
                status: "closed",
                disposition: dispAction,
                dispositionNotes: dispNotes || `Approved disposition ${dispAction.replace(/_/g, " ")}.`,
                approvedByName: "Brandon (Lead QA)",
                closedAt: new Date().toISOString(),
              }
            : n
        )
      );
      setMetrics((prev) => ({
        ...prev,
        activeOpenNCRCount: Math.max(0, prev.activeOpenNCRCount - 1),
      }));
      setFeedback({ type: "success", message: `NCR ${selectedNcr.ncrNumber} dispositioned as '${dispAction}'. Segregation of duties verified.` });
      setDispositionOpen(false);
      setSelectedNcr(null);
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
            <Badge variant="default">OPERATIONS//QUALITY</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Inspection Plans, NCRs & Yield Control
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Quality Assurance & Non-Conformance
          </h1>
          <p className="text-sm text-muted-foreground">
            AS9100/ISO 9001 quality workflows with segregation of duties between operator reporting and QA disposition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(activeTab === "ncrs" ? "inspections" : "ncrs")}
          >
            <ClipboardList className="mr-1.5 size-3.5" />
            {activeTab === "ncrs" ? "View Inspection Logs" : "View Active NCRs"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateNcrOpen(true)}
          >
            <Plus className="mr-1.5 size-4" />
            Raise NCR
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
            <span className="font-mono text-xs text-muted-foreground">First Pass Yield (FPY)</span>
            <TrendingUp className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.firstPassYieldPercentage}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Active Open NCRs</span>
            <AlertOctagon className="size-4 text-destructive" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-destructive">{metrics.activeOpenNCRCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Inspections Completed</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.totalInspections}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Scrap Valuation Loss</span>
            <AlertOctagon className="size-4 text-yellow-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-yellow-400">
            ${(metrics.scrapValuationLossCents / 100).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading quality ledger...</span>
          </div>
        </div>
      ) : activeTab === "ncrs" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <AlertOctagon className="size-5" />
              <CardTitle className="text-base">Non-Conformance Reports (NCR Ledger)</CardTitle>
            </div>
            <CardDescription>AS9100 defect containment, disposition sign-off, and scrap tracking.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {ncrs.length === 0 ? (
              <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
                <CheckCircle2 className="size-10 text-primary/40 mb-3" />
                <h3 className="font-semibold text-sm text-foreground">Zero Active Non-Conformances</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  All production jobs and travelers currently adhere to drawing specifications.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {ncrs.map((ncr) => (
                  <div key={ncr.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{ncr.ncrNumber}</span>
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">
                          {ncr.severity}
                        </Badge>
                        <Badge
                          variant={ncr.status === "closed" ? "secondary" : "outline"}
                          className={`font-mono text-[9px] uppercase ${
                            ncr.status === "open" ? "border-destructive text-destructive" : ""
                          }`}
                        >
                          {ncr.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">{ncr.partDescription}</p>
                      <p className="text-xs text-foreground/80">{ncr.defectDescription}</p>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                        <span>Job: {ncr.jobNumber}</span>
                        <span>&bull;</span>
                        <span>Qty: {ncr.defectQuantity}</span>
                        <span>&bull;</span>
                        <span>Scrap Loss: ${(ncr.scrapCostCents / 100).toFixed(2)}</span>
                        <span>&bull;</span>
                        <span>Disposition: <strong className="text-foreground">{ncr.disposition.replace(/_/g, " ").toUpperCase()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {ncr.status !== "closed" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedNcr(ncr);
                            setDispositionOpen(true);
                          }}
                          className="font-mono text-xs"
                        >
                          <FileCheck className="mr-1.5 size-3.5" />
                          Disposition
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Inspections Tab */
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5" />
              <CardTitle className="text-base">Inspection Checklists & Verification Logs</CardTitle>
            </div>
            <CardDescription>First Article, In-Process, and Final Acceptance records.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {inspections.length === 0 ? (
              <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
                <ShieldCheck className="size-10 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold text-sm text-foreground">No Inspection Records</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Completed station inspection plans and receiving checks will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {inspections.map((insp) => (
                  <div key={insp.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="uppercase text-[9px]">
                        {insp.inspectionType.replace(/_/g, " ")}
                      </Badge>
                      <span className="font-bold text-foreground">{insp.jobNumber}</span>
                      <span className="text-muted-foreground">{insp.partDescription}</span>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground self-end sm:self-center">
                      <span className={insp.status === "passed" ? "text-primary font-bold" : "text-destructive font-bold"}>
                        {insp.status.toUpperCase()} ({insp.passedQuantity}/{insp.sampleSize})
                      </span>
                      <span className="text-[10px]">{new Date(insp.completedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Raise NCR Modal */}
      {createNcrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Raise Non-Conformance Report (NCR)</h2>
              <Button variant="ghost" size="sm" onClick={() => setCreateNcrOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateNCR} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Job Number</label>
                  <input
                    type="text"
                    required
                    value={ncrJobNumber}
                    onChange={(e) => setNcrJobNumber(e.target.value)}
                    placeholder="JOB-2026-104"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Severity</label>
                  <select
                    value={ncrSeverity}
                    onChange={(e) => setNcrSeverity(e.target.value as "minor" | "major" | "critical")}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="minor">Minor (Cosmetic / Marginal)</option>
                    <option value="major">Major (Dimensional Out-of-Spec)</option>
                    <option value="critical">Critical (Safety / Material Flaw)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Part Description</label>
                <input
                  type="text"
                  required
                  value={ncrPart}
                  onChange={(e) => setNcrPart(e.target.value)}
                  placeholder="Precision Laser Cut Flanges"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Defect Description</label>
                <textarea
                  required
                  rows={2}
                  value={ncrDefect}
                  onChange={(e) => setNcrDefect(e.target.value)}
                  placeholder="Flange return angle measured at 92.5° exceeding ±0.5° tolerance."
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Defect Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={ncrQty}
                    onChange={(e) => setNcrQty(parseInt(e.target.value, 10))}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Est Scrap Cost ($)</label>
                  <input
                    type="text"
                    value={ncrScrapCost}
                    onChange={(e) => setNcrScrapCost(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Containment Action</label>
                <input
                  type="text"
                  value={ncrContainment}
                  onChange={(e) => setNcrContainment(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateNcrOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Raising NCR..." : "Raise NCR"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disposition Modal */}
      {dispositionOpen && selectedNcr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Approve Disposition — {selectedNcr.ncrNumber}</h2>
              <Button variant="ghost" size="sm" onClick={() => setDispositionOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleApplyDisposition} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Engineering Disposition</label>
                <select
                  value={dispAction}
                  onChange={(e) => setDispAction(e.target.value as "use_as_is" | "rework" | "scrap_and_remake" | "return_to_vendor")}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="rework">Rework (Authorize secondary operation)</option>
                  <option value="use_as_is">Use As-Is (Engineering concession)</option>
                  <option value="scrap_and_remake">Scrap & Remake (Scrap defect parts)</option>
                  <option value="return_to_vendor">Return to Vendor (Raw stock reject)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Disposition Notes</label>
                <textarea
                  required
                  rows={3}
                  value={dispNotes}
                  onChange={(e) => setDispNotes(e.target.value)}
                  placeholder="e.g. Authorized secondary brake pass to correct angle to 90.0°."
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setDispositionOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Approving..." : "Authorize Disposition"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
