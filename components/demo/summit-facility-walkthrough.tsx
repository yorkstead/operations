'use client';

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CheckSquare,
  Square,
  Camera,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  MapPin,
  ClipboardList
} from "lucide-react";
import { SUMMIT_FACILITY_FIXTURE_DATA } from "@/modules/demo/domain/summit-facility-scenario";

export function SummitFacilityWalkthrough() {
  const [activeJobId, setActiveJobId] = React.useState(SUMMIT_FACILITY_FIXTURE_DATA.jobs[0].id);
  const [checklist, setChecklist] = React.useState(SUMMIT_FACILITY_FIXTURE_DATA.jobs[0].checklist);
  const [signoffName, setSignoffName] = React.useState("");
  const [isSigned, setIsSigned] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const activeJob = SUMMIT_FACILITY_FIXTURE_DATA.jobs.find((j) => j.id === activeJobId) || SUMMIT_FACILITY_FIXTURE_DATA.jobs[0];

  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const handleSignoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signoffName.trim()) return;
    setIsSigned(true);
    setStatusMessage(`Proof-of-work verified and client signoff recorded for ${signoffName}. Shift report generated.`);
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const completedCount = checklist.filter((c) => c.isCompleted).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
              DEMO SCENARIO // COMMERCIAL FACILITY SERVICES
            </Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Summit Facility Services
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Commercial Facility & Sanitation Flow
          </h1>
          <p className="text-sm text-muted-foreground">
            Multi-site facility operations managing scheduled shifts, mobile sanitized checklists, ATP swab verification, and client proof-of-work signoffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
            {SUMMIT_FACILITY_FIXTURE_DATA.metrics.activeSites} Active Client Sites
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {SUMMIT_FACILITY_FIXTURE_DATA.metrics.auditPassingRate} Audit Quality
          </Badge>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Sites & Jobs Selector */}
      <div className="grid gap-4 sm:grid-cols-3">
        {SUMMIT_FACILITY_FIXTURE_DATA.sites.map((site) => {
          const isSelected = activeJob.siteId === site.id;
          return (
            <Card
              key={site.id}
              onClick={() => {
                const job = SUMMIT_FACILITY_FIXTURE_DATA.jobs.find((j) => j.siteId === site.id) || SUMMIT_FACILITY_FIXTURE_DATA.jobs[0];
                setActiveJobId(job.id);
                setChecklist(job.checklist);
                setIsSigned(false);
              }}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30 shadow-md"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
                    <Building2 className="size-4" />
                    <span>{site.code}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[8px] uppercase">
                    {site.activeServiceLevel.replace("_", " ")}
                  </Badge>
                </div>
                <h3 className="font-mono text-sm font-bold text-foreground">{site.name}</h3>
                <p className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" /> {site.address}
                </p>
                <div className="pt-2 border-t border-border flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Area: {site.squareFootage.toLocaleString()} sq ft</span>
                  <span className="text-primary font-semibold">Client: {site.clientName}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile Checklist Execution Simulator */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 text-primary">
                <ClipboardList className="size-5" />
                <CardTitle className="text-base">Shift Sanitation Checklist & Proof of Work</CardTitle>
              </div>
              <Badge variant="default" className="font-mono text-xs">
                Progress: {completedCount}/{checklist.length} ({progressPercent}%)
              </Badge>
            </div>
            <CardDescription>
              Work Order: <strong className="text-foreground">{activeJob.jobNumber}</strong> &bull; Lead: <strong className="text-foreground">{activeJob.crewLead}</strong> &bull; Time: {activeJob.scheduledTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Checklist items */}
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex items-start gap-3 p-3.5 cursor-pointer hover:bg-muted/40 transition"
                >
                  <button type="button" className="mt-0.5 text-primary shrink-0">
                    {item.isCompleted ? <CheckSquare className="size-4" /> : <Square className="size-4 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <p className={`font-mono text-xs ${item.isCompleted ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                      {item.description}
                    </p>
                    <Badge variant="outline" className="font-mono text-[8px] uppercase">
                      {item.category.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Proof of Work Inspection Card */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Camera className="size-4 text-primary" /> Proof of Work Artifacts
                </span>
                <Badge variant="outline" className="text-[9px]">
                  {activeJob.proofOfWork.photoCount} Geo-Tagged Photos
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="rounded bg-card p-2 border border-border">
                  <span className="text-muted-foreground block text-[10px]">ATP Surface Bio-Count</span>
                  <span className="font-bold text-primary">{activeJob.proofOfWork.atpSwabScoreRlu || 12} RLU</span>
                  <span className="text-muted-foreground block text-[9px]">Pass Benchmark &lt; 30 RLU</span>
                </div>
                <div className="rounded bg-card p-2 border border-border">
                  <span className="text-muted-foreground block text-[10px]">Access Lockout Status</span>
                  <span className="font-bold text-foreground">Verified & Secure</span>
                  <span className="text-muted-foreground block text-[9px]">Key Vault Returned</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Digital Signoff & Supplies Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <FileCheck2 className="size-5" />
                <CardTitle className="text-base">Client Digital Signoff</CardTitle>
              </div>
              <CardDescription>Authorize shift completion and generate client audit PDF.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {isSigned || activeJob.proofOfWork.clientSignoffName ? (
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <CheckCircle2 className="size-4" />
                    <span>Authorized & Completed</span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Signee: <strong className="text-foreground">{signoffName || activeJob.proofOfWork.clientSignoffName}</strong>
                  </p>
                  <p className="text-muted-foreground text-[9px]">
                    Timestamp: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSignoff} className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] uppercase text-muted-foreground mb-1">
                      Facility Manager Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={signoffName}
                      onChange={(e) => setSignoffName(e.target.value)}
                      className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full font-mono text-xs">
                    Authorize Completion Signoff
                  </Button>
                </form>
              )}

              <Link
                href="/quality"
                className="mt-2 inline-flex w-full items-center justify-between rounded border border-border bg-card px-3 py-2 font-mono text-xs text-foreground transition hover:border-primary hover:text-primary"
              >
                <span>View Quality Audits</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Consumables Used */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Consumables & Chemical Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 font-mono text-xs space-y-2">
              {activeJob.suppliesUsed.map((sup, idx) => (
                <div key={idx} className="flex justify-between border-b border-border/50 pb-1 text-[11px]">
                  <span className="text-muted-foreground truncate pr-2">{sup.name}</span>
                  <strong className="text-foreground shrink-0">{sup.quantityUsed} {sup.unit}</strong>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
