'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, CheckCircle2, ShieldCheck, Cpu, UploadCloud, X } from "lucide-react";
import { JobPacketDocument, DepartmentPacket } from "@/modules/packet-intelligence/domain/types";
import type { PublicBackgroundJob } from "@/modules/jobs/domain/types";

export function PacketWorkspace() {
  const [activeTab, setActiveTab] = React.useState<"shopfloor" | "quality" | "purchasing" | "shipping">("shopfloor");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [documents, setDocuments] = React.useState<JobPacketDocument[]>([]);
  const [departmentPacket, setDepartmentPacket] = React.useState<DepartmentPacket | null>(null);
  const [extractionJob, setExtractionJob] = React.useState<PublicBackgroundJob | null>(null);
  const [metrics, setMetrics] = React.useState({
    totalIngestedDocuments: 1,
    inconsistencyFlaggedCount: 1,
    humanApprovedCount: 0,
    ocrAccuracyRate: 98.6,
  });

  const fetchPacketData = React.useCallback(async () => {
    try {
      const [docRes, metRes, deptRes] = await Promise.all([
        fetch("/api/packets/documents"),
        fetch("/api/packets/metrics"),
        fetch(`/api/packets/department?department=${activeTab}`),
      ]);

      if (docRes.ok) {
        const data = await docRes.json();
        setDocuments(data.documents || []);
      }
      if (metRes.ok) {
        const data = await metRes.json();
        setMetrics(data.metrics || metrics);
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartmentPacket(data.packet || null);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load packet intelligence data." });
    } finally {
      setLoading(false);
    }
  }, [activeTab, metrics]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchPacketData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchPacketData]);

  React.useEffect(() => {
    if (!extractionJob || !["queued", "running"].includes(extractionJob.status)) return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/background-jobs/${extractionJob.id}`);
      if (!response.ok) return;
      const data = await response.json();
      const next = data.job as PublicBackgroundJob;
      setExtractionJob(next);
      if (next.status === "completed") {
        setFeedback({ type: "success", message: "Drawing extraction completed. Results are ready for engineer review." });
        void fetchPacketData();
      } else if (next.status === "failed") {
        setFeedback({ type: "error", message: next.error?.message || "Drawing extraction failed. Use the job ID when contacting support." });
        void fetchPacketData();
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [extractionJob, fetchPacketData]);

  const handleExtract = async (docId: string) => {
    try {
      const response = await fetch(`/api/packets/documents/${docId}/extract`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Extraction could not be queued.");
      setExtractionJob(data.job);
      setFeedback({ type: "success", message: data.job.status === "completed" ? "Drawing extraction is complete." : "Drawing extraction queued. You can keep working while it runs." });
      void fetchPacketData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Extraction could not be queued." });
    }
  };

  const handleApprove = async (docId: string) => {
    try {
      const res = await fetch(`/api/packets/documents/${docId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: { revision: "B" } }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Approval failed");
      }

      setFeedback({ type: "success", message: "Human engineer approved extracted revision truth. Inconsistency cleared." });
      fetchPacketData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Approval failed" });
    }
  };

  const primaryDoc = documents[0];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">OPERATIONS//INTELLIGENCE</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Job Packet Ingestion & Untrusted AI Extraction
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Job Packet Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            Document classification, revision consistency auditing, provenance tracking, and department packet bundling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setFeedback({ type: "success", message: "Drawing upload pipeline ready. Drag files into document vault." });
            }}
          >
            <UploadCloud className="mr-1.5 size-4" />
            Ingest Drawing Packet
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Ingested Drawings</span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.totalIngestedDocuments}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Flagged Mismatches</span>
            <AlertTriangle className="size-4 text-warning" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-warning">{metrics.inconsistencyFlaggedCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Engineer Approved</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.humanApprovedCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">OCR Model Accuracy</span>
            <Cpu className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.ocrAccuracyRate}%</p>
        </Card>
      </div>

      {/* Primary Ingestion & Discrepancy Card */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-3" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading drawing packets...</span>
        </Card>
      ) : primaryDoc ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Extracted Metadata */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="size-5" />
                    <CardTitle className="text-base font-semibold">{primaryDoc.fileName}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {primaryDoc.jobNumber}
                    </Badge>
                    <Badge
                      variant={primaryDoc.extractionStatus === "approved" ? "default" : "outline"}
                      className="font-mono text-[10px] uppercase"
                    >
                      {primaryDoc.extractionStatus.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Parsed via {primaryDoc.aiModelUsed || "synthetic-packet-parser-v2.1"} &bull; Human-in-the-loop validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {extractionJob && ["queued", "running"].includes(extractionJob.status) && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3" aria-live="polite">
                    <div className="mb-2 flex items-center justify-between font-mono text-xs">
                      <span className="uppercase text-foreground">{extractionJob.status === "queued" ? "Extraction queued" : "Extracting drawing"}</span>
                      <span className="text-muted-foreground">{extractionJob.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary transition-all" style={{ width: `${extractionJob.progress}%` }} />
                    </div>
                  </div>
                )}
                {/* Discrepancy Warning */}
                {primaryDoc.inconsistencies.length > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-mono text-xs font-bold text-destructive uppercase tracking-wider">
                          Critical Discrepancy Detected
                        </h4>
                        <p className="font-mono text-xs text-foreground">
                          {primaryDoc.inconsistencies[0].message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extracted Fields Table */}
                <div className="rounded-md border border-border">
                  <div className="grid grid-cols-12 bg-muted/40 p-2 font-mono text-[10px] uppercase text-muted-foreground">
                    <div className="col-span-4">Field Label</div>
                    <div className="col-span-4">Extracted Value</div>
                    <div className="col-span-2">Confidence</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>
                  <div className="divide-y divide-border">
                    {primaryDoc.extractedEntities.map((ent, idx) => (
                      <div key={idx} className="grid grid-cols-12 p-2.5 font-mono text-xs items-center">
                        <div className="col-span-4 font-semibold text-foreground">{ent.label}</div>
                        <div className="col-span-4 text-foreground">{ent.rawValue}</div>
                        <div className="col-span-2 text-muted-foreground">{(ent.confidenceScore * 100).toFixed(0)}%</div>
                        <div className="col-span-2 text-right">
                          <Badge
                            variant={ent.approved ? "default" : "outline"}
                            className="font-mono text-[9px] uppercase"
                          >
                            {ent.approved ? "Approved" : "Review"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approval Action */}
                {primaryDoc.extractionStatus !== "approved" && (
                  <div className="flex justify-end gap-2 pt-2">
                    {["pending", "failed", "queued"].includes(primaryDoc.extractionStatus) && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={Boolean(extractionJob && ["queued", "running"].includes(extractionJob.status))}
                        onClick={() => handleExtract(primaryDoc.id)}
                        className="font-mono text-xs"
                      >
                        <Cpu className="mr-1.5 size-3.5" />
                        Run Extraction
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(primaryDoc.id)}
                      className="font-mono text-xs"
                    >
                      <ShieldCheck className="mr-1.5 size-3.5" />
                      Approve Revision Truth (Rev B)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Col: Department Bundling */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Department Packet Bundling</CardTitle>
                <CardDescription>Tailored document views & checklists by station role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 font-mono text-[10px]">
                  {(["shopfloor", "quality", "purchasing", "shipping"] as const).map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setActiveTab(dept)}
                      className={`rounded py-1.5 capitalize transition-all ${
                        activeTab === dept
                          ? "bg-background text-foreground shadow-sm font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                {departmentPacket && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-muted-foreground">Job Documents:</span>
                      <Badge variant="outline">{departmentPacket.documentCount} Files</Badge>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <span className="block font-mono text-[10px] uppercase text-muted-foreground font-bold">
                        {activeTab.toUpperCase()} Verification Checklist
                      </span>
                      <ul className="space-y-2 font-mono text-xs text-muted-foreground">
                        {departmentPacket.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary font-bold">&bull;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
