'use client';

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Truck,
  Zap,
  Hammer
} from "lucide-react";
import { SIGNWORKS_FIXTURE_DATA } from "@/modules/demo/domain/signworks-scenario";

export function SignworksWalkthrough() {
  const [project, setProject] = React.useState(SIGNWORKS_FIXTURE_DATA.project);
  const [signoffInput, setSignoffInput] = React.useState(project.fieldInstallation.clientSignoffName || "");
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleApproveRevision = () => {
    setProject((prev) => ({
      ...prev,
      currentRevision: {
        ...prev.currentRevision,
        status: "client_approved",
        approvalTimestamp: new Date().toISOString(),
      },
    }));
    setFeedback("Artwork revision locked & client approved. Vector CAD drawings released to CNC router station.");
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleCompleteInstall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signoffInput.trim()) return;

    setProject((prev) => ({
      ...prev,
      status: "completed",
      fieldInstallation: {
        ...prev.fieldInstallation,
        clientSignoffName: signoffInput,
      },
    }));
    setFeedback(`Installation authorized by ${signoffInput}. 5-Year LED Warranty Certificate generated.`);
    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
              DEMO SCENARIO // ARCHITECTURAL SIGNAGE & RIGGING
            </Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Mile High Signworks
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Sign Fabrication, Permitting & Field Rigging
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete lifecycle from vector art revision lock to CNC routing, UL electrical listing, foam-padded crating, and 45ft crane installation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
            {SIGNWORKS_FIXTURE_DATA.metrics.onTimeInstallRate} On-Time Installs
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {SIGNWORKS_FIXTURE_DATA.metrics.firstTimeInspectionPassRate} Permit Pass Rate
          </Badge>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Project Overview Card */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Zap className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">{project.clientName}</CardTitle>
                <CardDescription>{project.locationAddress}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-mono text-xs">
                ${(project.totalContractValueCents / 100).toLocaleString()} Contract
              </Badge>
              <Badge variant="outline" className="font-mono text-[9px] uppercase">
                Status: {project.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-3 font-mono text-xs">
            <div className="rounded border border-border bg-muted/20 p-3">
              <span className="text-muted-foreground block text-[10px]">Sign Specifications</span>
              <strong className="text-foreground text-xs">{project.signType}</strong>
            </div>
            <div className="rounded border border-border bg-muted/20 p-3">
              <span className="text-muted-foreground block text-[10px]">Permit & Electrical Inspection</span>
              <strong className="text-primary text-xs">{project.permit.permitNumber}</strong>
              <span className="text-muted-foreground block text-[9px] mt-0.5">UL 48 Verified &bull; {project.permit.status}</span>
            </div>
            <div className="rounded border border-border bg-muted/20 p-3">
              <span className="text-muted-foreground block text-[10px]">Crane Rigging Dispatch</span>
              <strong className="text-foreground text-xs">{project.fieldInstallation.craneTruckAssigned}</strong>
              <span className="text-muted-foreground block text-[9px] mt-0.5">Lead: {project.fieldInstallation.crewLead}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-Phase Interactive Pipeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Revision Lock & Permitting */}
        <div className="space-y-6">
          {/* Phase 1: Artwork Revision Gate */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <FileCheck2 className="size-5" />
                  <CardTitle className="text-sm font-bold">1. Vector Artwork Revision Gate</CardTitle>
                </div>
                <Badge variant="default" className="font-mono text-[9px]">
                  {project.currentRevision.revisionCode}
                </Badge>
              </div>
              <CardDescription>Enforces client signoff before releasing DXF/CAD vectors to CNC machinery.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 font-mono text-xs">
              <div className="rounded border border-border bg-muted/30 p-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CAD Drawing:</span>
                  <strong className="text-foreground">{project.currentRevision.fileName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <strong className="text-foreground">{project.currentRevision.dimensions}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Illumination:</span>
                  <strong className="text-primary font-bold">Halo-Lit 6500K LED</strong>
                </div>
              </div>

              {project.currentRevision.status === "client_approved" ? (
                <div className="flex items-center gap-2 rounded bg-primary/10 p-2 text-primary text-[11px]">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Approved by {project.currentRevision.approvalName} &bull; Revision Locked</span>
                </div>
              ) : (
                <Button size="sm" onClick={handleApproveRevision} className="w-full font-mono text-xs">
                  Authorize Artwork Approval
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Phase 2: In-Shop Fabrication Steps */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <Hammer className="size-5" />
                <CardTitle className="text-sm font-bold">2. Shopfloor Fabrication Sequence</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 font-mono text-xs">
              {project.fabricationRouting.map((st) => (
                <div key={st.stepNumber} className="flex items-center justify-between rounded border border-border/70 p-2.5 bg-card">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-bold text-foreground">
                      0{st.stepNumber}
                    </span>
                    <div>
                      <span className="text-foreground font-semibold block text-xs">{st.operationName}</span>
                      <span className="text-muted-foreground text-[10px]">{st.workCenter}</span>
                    </div>
                  </div>
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Field Crane Rigging & Closeout */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <Truck className="size-5" />
                <CardTitle className="text-sm font-bold">3. Field Crane Installation & Closeout</CardTitle>
              </div>
              <CardDescription>45ft Boom Truck dispatch with illuminated nighttime proof-of-work.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="rounded border border-border bg-muted/20 p-2.5">
                  <span className="text-muted-foreground block text-[10px]">Masonry Mounting</span>
                  <strong className="text-foreground">Structural Anchors Set</strong>
                </div>
                <div className="rounded border border-border bg-muted/20 p-2.5">
                  <span className="text-muted-foreground block text-[10px]">Electrical Feed</span>
                  <strong className="text-primary">120V Primary Live</strong>
                </div>
              </div>

              {project.status === "completed" ? (
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Project Successfully Closed Out</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Signed Off by: <strong className="text-foreground">{project.fieldInstallation.clientSignoffName}</strong>
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    Proof Photos: {project.fieldInstallation.proofPhotosCount} night-illumination shots archived in File Vault.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCompleteInstall} className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase text-muted-foreground mb-1">
                      Client Final Signoff Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Vance"
                      value={signoffInput}
                      onChange={(e) => setSignoffInput(e.target.value)}
                      className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full font-mono text-xs">
                    Complete Installation & Signoff
                  </Button>
                </form>
              )}

              <div className="pt-2 border-t border-border flex justify-between gap-2">
                <Link
                  href="/shopfloor"
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition"
                >
                  <span>Shopfloor Stations</span>
                  <ArrowRight className="size-3" />
                </Link>
                <Link
                  href="/files"
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition"
                >
                  <span>Permit Vault</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
