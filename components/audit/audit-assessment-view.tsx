'use client';

import * as React from "react";
import { STANDARD_AUDIT_QUESTIONS } from "@/modules/audit/domain/questions";
import { calculateAuditReport } from "@/modules/audit/domain/scoring";
import { AuditAnswerInput, FactType } from "@/modules/audit/domain/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";
import { AuditClientBriefingView } from "@/components/audit/audit-client-briefing-view";

export function AuditAssessmentView() {
  const [clientName, setClientName] = React.useState("Front Range Manufacturing");
  const [industry, setIndustry] = React.useState("Precision Architectural Fabrication");
  const [leadAuditor, setLeadAuditor] = React.useState("Lead Solutions Architect");
  const [answers, setAnswers] = React.useState<Record<string, AuditAnswerInput>>({
    q_intake_1: {
      questionId: "q_intake_1",
      score: 2,
      factType: "measured_fact",
      evidenceNotes: "Estimates handled via Excel spreadsheets with frequent re-keying into email quotes.",
      estimatedHoursLostWeekly: 6.5,
      severity: "high",
    },
    q_shopfloor_1: {
      questionId: "q_shopfloor_1",
      score: 2,
      factType: "measured_fact",
      evidenceNotes: "Physical clipboards lost between laser cutting and press brake stations.",
      estimatedHoursLostWeekly: 9.0,
      severity: "critical",
    },
    q_inventory_1: {
      questionId: "q_inventory_1",
      score: 3,
      factType: "operator_estimate",
      evidenceNotes: "Weekly stock reconciliation uncovers missing aluminum extrusion drops.",
      estimatedHoursLostWeekly: 4.0,
      severity: "medium",
    },
    q_quality_1: {
      questionId: "q_quality_1",
      score: 3,
      factType: "operator_estimate",
      evidenceNotes: "Paper first-piece inspection tags stored in binder; no digital yield trends.",
      estimatedHoursLostWeekly: 3.5,
      severity: "medium",
    },
    q_shipping_1: {
      questionId: "q_shipping_1",
      score: 4,
      factType: "measured_fact",
      evidenceNotes: "Shipping manifests generated promptly, minor billing delay on custom freight.",
      estimatedHoursLostWeekly: 1.5,
      severity: "low",
    },
  });

  const [activeView, setActiveView] = React.useState<"diagnostic" | "deliverable">("diagnostic");

  const report = React.useMemo(() => {
    return calculateAuditReport("audit_demo_1", clientName, industry, new Date().toISOString().split("T")[0], answers);
  }, [clientName, industry, answers]);

  const updateAnswer = (questionId: string, field: keyof AuditAnswerInput, value: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* View Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4 font-mono text-xs print:hidden">
        <button
          onClick={() => setActiveView("diagnostic")}
          className={`rounded-lg px-3.5 py-1.5 transition ${
            activeView === "diagnostic"
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Internal Diagnostic Assessment
        </button>
        <button
          onClick={() => setActiveView("deliverable")}
          className={`rounded-lg px-3.5 py-1.5 transition ${
            activeView === "deliverable"
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Evidence-Backed Client Briefing Deliverable
        </button>
      </div>

      {activeView === "deliverable" ? (
        <AuditClientBriefingView />
      ) : (
        <>
          {/* Header Info */}
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="default">WORKFLOW//AUDIT</Badge>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Internal Diagnostic Deliverable
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Operational Friction Diagnostic
              </h1>
              <p className="text-sm text-muted-foreground">
                Objective evaluation of shopfloor and workflow bottlenecks before prescribing software.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 size-4" />
                Print Assessment
              </Button>
            </div>
          </div>

      {/* Engagement Parameters */}
      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Client / Facility</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Industry Classification</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Lead Auditor</label>
          <input
            type="text"
            value={leadAuditor}
            onChange={(e) => setLeadAuditor(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Score Summary Banner */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Overall Efficiency Score
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-primary">
              {report.overallEfficiencyScore}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-mono text-[10px] text-muted-foreground">
              Friction Level: {report.overallFrictionScore}% Drag
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Measured Weekly Waste
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-foreground">
              {report.totalMeasuredWeeklyWasteHours} <span className="text-sm font-normal text-muted-foreground">hrs/wk</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-[9px]">Verified Operational Data</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Estimated Weekly Waste
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-foreground">
              {report.totalEstimatedWeeklyWasteHours} <span className="text-sm font-normal text-muted-foreground">hrs/wk</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-[9px]">Operator Estimate</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Annualized Labor Drag
            </CardDescription>
            <CardTitle className="text-3xl font-mono text-foreground">
              {report.totalAnnualWasteHours.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">hrs/yr</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-mono text-[10px] text-muted-foreground">50 Working Weeks Basis</span>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Category Friction Analysis
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {report.categorySummaries.map((cat) => (
            <Card key={cat.category}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{cat.categoryTitle}</CardTitle>
                  <Badge variant={cat.frictionScore > 40 ? "default" : "secondary"}>
                    {cat.frictionScore}% Friction
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${cat.efficiencyScore}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Efficiency: {cat.efficiencyScore}%</span>
                  <span>Waste: {cat.totalHoursLostWeekly} hrs/wk ({cat.measuredHoursLostWeekly}h measured, {cat.estimatedHoursLostWeekly}h est.)</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Audit Question Inputs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Diagnostic Evaluation & Evidence Recording
        </h2>

        <div className="space-y-4">
          {STANDARD_AUDIT_QUESTIONS.map((q) => {
            const currentAnswer = answers[q.id] || {
              questionId: q.id,
              score: 3,
              factType: "operator_estimate",
              evidenceNotes: "",
              estimatedHoursLostWeekly: 0,
              severity: "low",
            };

            return (
              <Card key={q.id} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      {q.categoryTitle}
                    </span>
                    <Badge variant="outline" className="text-[10px]">Weight: {q.weight}x</Badge>
                  </div>
                  <CardTitle className="text-base">{q.questionText}</CardTitle>
                  <CardDescription>{q.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Automation Score (1: Bottleneck — 5: Seamless)
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={currentAnswer.score}
                          onChange={(e) => updateAnswer(q.id, "score", parseInt(e.target.value))}
                          className="h-2 w-full cursor-pointer accent-primary"
                        />
                        <span className="font-mono text-sm font-bold text-primary">{currentAnswer.score}/5</span>
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Data Source Type
                      </label>
                      <select
                        value={currentAnswer.factType}
                        onChange={(e) => updateAnswer(q.id, "factType", e.target.value as FactType)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground"
                      >
                        <option value="measured_fact">Measured Fact (Time Study / Records)</option>
                        <option value="operator_estimate">Operator Estimate</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Weekly Drag (Hours)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={currentAnswer.estimatedHoursLostWeekly}
                        onChange={(e) => updateAnswer(q.id, "estimatedHoursLostWeekly", parseFloat(e.target.value) || 0)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Evidence Notes & Observed Root Causes
                    </label>
                    <textarea
                      rows={2}
                      value={currentAnswer.evidenceNotes}
                      onChange={(e) => updateAnswer(q.id, "evidenceNotes", e.target.value)}
                      placeholder="Record specific observed workflow friction, missing paperwork, or manual step details..."
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Actionable Recommendations & Phased Roadmap */}
      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Prescribed Phased Implementation Roadmap
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {report.recommendedPhases.map((phase) => (
            <Card key={phase.phase} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="default">PHASE 0{phase.phase}</Badge>
                </div>
                <CardTitle className="mt-2 text-base">{phase.title}</CardTitle>
                <CardDescription className="text-xs">{phase.targetFriction}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="rounded-lg border border-border bg-background/50 p-2.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Module:</span>
                  <p className="font-mono text-xs font-semibold text-primary">{phase.recommendedModule}</p>
                </div>
                <p className="text-xs text-muted-foreground">{phase.expectedBenefit}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Disclaimers and Guardrails */}
      <div className="rounded-lg border border-border/80 bg-secondary/30 p-4 text-xs text-muted-foreground">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground">
          ⚠️ Engineering Transparency & Baseline Guardrail:
        </p>
        <p className="mt-1 leading-relaxed">
          In accordance with <code>docs/METRICS.md</code>, all reported hours are segregated into verified measured facts versus operator estimates. Benefit realizations and projected returns remain illustrative until baselined during actual pilot execution.
        </p>
      </div>
        </>
      )}
    </div>
  );
}
