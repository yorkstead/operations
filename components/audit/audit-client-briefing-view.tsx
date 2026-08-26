'use client';

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Printer,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock
} from "lucide-react";
import { AuditDeliverableService } from "@/modules/audit/application/audit-deliverable-service";
import type {
  AuditClientBriefing,
  EvidenceType
} from "@/modules/audit/domain/client-deliverable";

export function AuditClientBriefingView({
  briefing: initialBriefing,
}: {
  briefing?: AuditClientBriefing;
}) {
  const [briefing] = React.useState<AuditClientBriefing>(
    initialBriefing || AuditDeliverableService.getSyntheticBriefing()
  );

  const handlePrint = () => {
    window.print();
  };

  const renderEvidenceBadge = (type: EvidenceType) => {
    switch (type) {
      case "measured_fact":
        return (
          <Badge variant="secondary" className="font-mono text-[9px] uppercase bg-blue-500/20 text-blue-400 border-blue-500/30 gap-1">
            <CheckCircle2 className="size-3" />
            <span>Measured Fact</span>
          </Badge>
        );
      case "operator_estimate":
        return (
          <Badge variant="secondary" className="font-mono text-[9px] uppercase bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
            <Clock className="size-3" />
            <span>Operator Estimate</span>
          </Badge>
        );
      case "unverified_unknown":
        return (
          <Badge variant="secondary" className="font-mono text-[9px] uppercase bg-slate-500/20 text-slate-400 border-slate-500/30 gap-1">
            <HelpCircle className="size-3" />
            <span>Unverified Data</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 print:space-y-6 print:text-black">
      {/* Top Action & Print Bar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px] uppercase bg-primary/20 text-primary border-primary/30">
              {`${briefing.version} // ${briefing.status.toUpperCase()}`}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              Official Workflow Audit Deliverable
            </span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mt-1">
            Evidence-Backed Client Briefing
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            variant="default"
            size="sm"
            className="font-mono text-xs gap-2"
          >
            <Printer className="size-4" />
            <span>Print / Save PDF</span>
          </Button>
        </div>
      </div>

      {/* Branded Document Container */}
      <div className="rounded-xl border border-border bg-card/85 p-6 sm:p-10 shadow-lg print:border-none print:p-0 print:shadow-none font-mono text-xs space-y-8">
        {/* Document Header */}
        <div className="border-b border-border pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                YORKSTEAD SYSTEMS // WORKFLOW AUDIT BRIEFING
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                {briefing.clientName}
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">{briefing.industry}</p>
            </div>

            <div className="space-y-1 text-right sm:text-right text-[11px] text-muted-foreground">
              <div><strong>Delivery Date:</strong> {briefing.deliveryDate}</div>
              <div><strong>Lead Auditor:</strong> {briefing.leadAuditor}</div>
              <div><strong>Gate Approval:</strong> {briefing.approvedBy || "Pending Review"}</div>
            </div>
          </div>
        </div>

        {/* Evidence Integrity Notice */}
        <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-4 text-[11px] space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px]">
            <ShieldCheck className="size-4" />
            <span>EVIDENCE INTEGRITY & FACT TAXONOMY POLICY</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            This deliverable adheres to the Yorkstead engineering contract. All claims distinguish between <strong>measured operational facts</strong>, <strong>operator estimates</strong>, and <strong>unverified unknowns</strong>. Financial figures represent bounded implementation ranges; no unverified speculative dollar savings are claimed.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">{renderEvidenceBadge("measured_fact")} <span>Directly observed or measured in audit logs</span></div>
            <div className="flex items-center gap-1.5">{renderEvidenceBadge("operator_estimate")} <span>Reported by department operators</span></div>
            <div className="flex items-center gap-1.5">{renderEvidenceBadge("unverified_unknown")} <span>Requires follow-up data collection</span></div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold block">
            1. Executive Summary
          </span>
          <p className="text-foreground text-xs leading-relaxed border-l-2 border-primary/50 pl-3 py-1">
            {briefing.executiveSummary}
          </p>
        </div>

        {/* Current-State Workflow Map */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold block">
            2. Current-State Workflow & Observed Friction
          </span>

          <div className="space-y-3">
            {briefing.currentStateMap.map((node, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-muted/15 p-4 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="font-semibold text-foreground text-sm">{node.stageTitle}</div>
                  <div className="flex items-center gap-2">
                    {renderEvidenceBadge(node.evidenceType)}
                    <Badge variant="outline" className={`font-mono text-[9px] uppercase ${
                      node.frictionLevel === "critical"
                        ? "border-destructive/40 text-destructive bg-destructive/10"
                        : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                    }`}>
                      {node.frictionLevel} Friction
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Current Tool & Method:</span>
                    <p className="text-foreground">{node.currentTool} &rarr; {node.handOffMethod}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Observed Evidence:</span>
                    <p className="text-foreground italic">{node.evidenceNotes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunity Rankings */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold block">
            3. Opportunity Ranking & High-Leverage Solutions
          </span>

          <div className="grid gap-3 sm:grid-cols-3">
            {briefing.opportunityRankings.map((opp) => (
              <div key={opp.rank} className="rounded-lg border border-border bg-muted/20 p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-xs">Rank 0{opp.rank}</span>
                    {renderEvidenceBadge(opp.evidenceType)}
                  </div>
                  <h4 className="font-semibold text-foreground text-xs">{opp.title}</h4>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">{opp.operationalOutcome}</p>
                </div>
                <div className="pt-2 border-t border-border/60 text-[9px] text-muted-foreground space-y-0.5">
                  <div><strong>Module:</strong> {opp.recommendedModule}</div>
                  <div><strong>Target:</strong> {opp.timeframe}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended First Release Scope */}
        <div className="space-y-3 rounded-lg border border-primary/40 bg-primary/[0.04] p-5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold block">
            4. Recommended First Release (Smallest High-Impact Vertical Slice)
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {briefing.recommendedFirstRelease.title}
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              {briefing.recommendedFirstRelease.scopeSummary}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2 text-[11px]">
            <div className="space-y-1.5">
              <span className="text-primary font-bold uppercase text-[9px] block">In Scope (Milestone 1):</span>
              <ul className="space-y-1 text-foreground/90">
                {briefing.recommendedFirstRelease.keyCapabilities.map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="size-3 text-primary mt-0.5 shrink-0" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <span className="text-muted-foreground font-bold uppercase text-[9px] block">Explicitly Excluded (Future Scope):</span>
              <ul className="space-y-1 text-muted-foreground">
                {briefing.recommendedFirstRelease.exclusions.map((exc, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-muted-foreground/60">&times;</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Milestones & Bounded Pricing */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold block">
            5. Implementation Milestones & Bounded Price Policy
          </span>

          <div className="space-y-3">
            {briefing.implementationMilestones.map((ms) => (
              <div key={ms.milestoneNumber} className="rounded-lg border border-border bg-muted/15 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      Milestone {ms.milestoneNumber}: {ms.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">Estimated Duration: {ms.estimatedWeeks}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="font-mono text-xs bg-primary/20 text-primary border-primary/30">
                      ${(ms.priceRangeCents.min / 100).toLocaleString()} – ${(ms.priceRangeCents.max / 100).toLocaleString()}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-[11px]">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block font-bold mb-1">Key Deliverables:</span>
                    <ul className="space-y-1 text-foreground/90">
                      {ms.deliverables.map((del, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="size-3 text-primary mt-0.5 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block font-bold mb-1">Key Assumptions & Scope Guardrails:</span>
                    <ul className="space-y-1 text-muted-foreground">
                      {ms.assumptions.map((ass, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>&bull;</span>
                          <span>{ass}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assumptions, Risks & Next Steps */}
        <div className="grid gap-6 sm:grid-cols-2 border-t border-border pt-6 text-[11px]">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold block">
              6. Governance & Risk Management
            </span>
            <ul className="space-y-1.5 text-muted-foreground">
              {briefing.assumptionsAndRisks.assumptions.map((item, idx) => (
                <li key={idx}>&bull; {item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold block">
              7. Immediate Next Steps
            </span>
            <ul className="space-y-1.5 text-foreground">
              {briefing.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Client Signoff Gate */}
        <div className="border-t border-border pt-6 space-y-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block font-bold">
            8. Authorization & Kickoff Signoff Gate
          </span>
          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <div className="border-b border-border pb-6 space-y-1">
              <span className="text-[9px] uppercase text-muted-foreground block">Client Representative Signature:</span>
              <div className="h-8" />
              <div className="text-[10px] text-muted-foreground">Name: ____________________ Date: ____________</div>
            </div>
            <div className="border-b border-border pb-6 space-y-1">
              <span className="text-[9px] uppercase text-muted-foreground block">Yorkstead Lead Engineer Signature:</span>
              <div className="h-8 flex items-center text-primary font-semibold italic text-xs">Brandon York</div>
              <div className="text-[10px] text-muted-foreground">Name: Brandon York Date: {briefing.deliveryDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
