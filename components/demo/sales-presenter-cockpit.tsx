'use client';

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Presentation,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  SalesPresenterService,
  PRESENTER_PASSCODE
} from "@/modules/demo/application/sales-presenter-service";
import type { PresenterStep } from "@/modules/demo/domain/sales-presenter";

export function SalesPresenterCockpit({
  currentScenarioSlug,
}: {
  currentScenarioSlug: string;
  onScenarioChange?: (slug: string) => void;
}) {
  const searchParams = useSearchParams();

  const isPresenterParam = searchParams.get("presenter");
  const passcodeParam = searchParams.get("key");
  const stepParam = searchParams.get("step");

  const [isUnlocked, setIsUnlocked] = React.useState(() => {
    return isPresenterParam === "true" || passcodeParam === PRESENTER_PASSCODE;
  });
  const [passcodeAttempt, setPasscodeAttempt] = React.useState("");
  const [passcodeError, setPasscodeError] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(() => {
    if (stepParam) {
      const idx = parseInt(stepParam, 10);
      if (!isNaN(idx) && idx >= 0) return idx;
    }
    return 0;
  });
  const [isAudienceSafe, setIsAudienceSafe] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState<string | null>(null);

  const scenarios = SalesPresenterService.getScenarios();
  const activeScenario = SalesPresenterService.getScenario(currentScenarioSlug) || scenarios[0];
  const activeStep: PresenterStep | undefined = activeScenario.steps[currentStepIndex];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (SalesPresenterService.verifyPasscode(passcodeAttempt)) {
      setIsUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeScenario.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
    }
  };

  const handleResetCheckpoint = () => {
    const res = SalesPresenterService.resetCheckpoint(activeScenario.scenarioSlug);
    setResetMessage(res.message);
    setTimeout(() => setResetMessage(null), 3500);
  };

  if (!isUnlocked) {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-4 font-mono text-xs shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="size-4 text-primary" />
            <span className="font-semibold text-foreground">Sales Demo Presenter Mode</span>
            <span className="text-[10px] text-muted-foreground">(Guided talk tracks & checkpoints)</span>
          </div>

          <form onSubmit={handleUnlock} className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Presenter Passcode"
              value={passcodeAttempt}
              onChange={(e) => setPasscodeAttempt(e.target.value)}
              className="h-8 rounded border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button type="submit" size="sm" variant="default" className="h-8 text-xs font-mono">
              Unlock
            </Button>
          </form>
        </div>
        {passcodeError && (
          <p className="mt-2 text-[10px] text-destructive">
            Invalid passcode. Use authorized staff credentials.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-card/95 shadow-xl backdrop-blur font-mono text-xs overflow-hidden transition-all">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-primary/10 px-4 py-2.5 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Presentation className="size-4 text-primary animate-pulse" />
          <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
            Presenter Cockpit // {activeScenario.scenarioName}
          </span>
          <Badge variant="secondary" className="font-mono text-[9px] uppercase bg-primary/20 text-primary border-primary/30">
            {activeScenario.checkpointName}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Audience Safe Mode Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAudienceSafe(!isAudienceSafe)}
            className="h-7 px-2 text-[10px] font-mono gap-1 text-muted-foreground hover:text-foreground"
            title={isAudienceSafe ? "Show Presenter Notes" : "Hide Presenter Notes (Screen Share Safe)"}
          >
            {isAudienceSafe ? <EyeOff className="size-3.5 text-amber-500" /> : <Eye className="size-3.5 text-primary" />}
            <span>{isAudienceSafe ? "Audience View" : "Presenter View"}</span>
          </Button>

          {/* Reset Checkpoint Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetCheckpoint}
            className="h-7 px-2 text-[10px] font-mono gap-1 border-primary/30 text-primary hover:bg-primary/20"
          >
            <RotateCcw className="size-3" />
            <span>Reset Checkpoint</span>
          </Button>

          {/* Collapse/Expand Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-7 size-7 p-0 text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </Button>
        </div>
      </div>

      {resetMessage && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-1.5 text-emerald-400 text-[10px] flex items-center gap-1.5">
          <CheckCircle2 className="size-3" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Main Cockpit Body */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Step Progress Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activeScenario.steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`rounded-lg p-2.5 text-left border transition ${
                  currentStepIndex === idx
                    ? "border-primary bg-primary/10 text-primary"
                    : idx < currentStepIndex
                    ? "border-emerald-500/30 bg-emerald-500/[0.04] text-emerald-400"
                    : "border-border bg-muted/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold uppercase">Step {step.stepNumber}</span>
                  {idx < currentStepIndex && <CheckCircle2 className="size-3 text-emerald-400" />}
                </div>
                <div className="text-[11px] font-semibold truncate leading-tight">{step.title}</div>
              </button>
            ))}
          </div>

          {/* Active Step Content */}
          {activeStep && (
            <div className="grid gap-4 md:grid-cols-[1.3fr_1fr] pt-1">
              {/* Left Column: Problem vs Solution & Next Action */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">
                    Step {activeStep.stepNumber}: {activeStep.title}
                  </h4>
                  <Badge variant="outline" className="text-[9px] font-mono">
                    Target: {activeStep.targetRoute}
                  </Badge>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="rounded border border-destructive/30 bg-destructive/[0.03] p-2.5 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-destructive">Customer Friction</span>
                    <p className="text-muted-foreground">{activeStep.customerFriction}</p>
                  </div>

                  <div className="rounded border border-primary/30 bg-primary/[0.03] p-2.5 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-primary">Yorkstead Architecture Answer</span>
                    <p className="text-foreground">{activeStep.yorksteadSolution}</p>
                  </div>
                </div>

                <div className="rounded border border-emerald-500/40 bg-emerald-500/[0.06] p-3 text-[11px] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block mb-0.5">Demonstrated Action</span>
                    <p className="text-foreground">{activeStep.suggestedAction}</p>
                  </div>
                  <Link
                    href={activeStep.targetRoute}
                    className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow shrink-0 hover:bg-primary/90"
                  >
                    <span>Execute in UI</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Presenter Talk Track (Screen-Share Guarded) */}
              <div className="space-y-3 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                {!isAudienceSafe ? (
                  <div className="rounded-lg border border-primary/20 bg-muted/30 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase">
                      <Presentation className="size-3.5" />
                      <span>Presenter Talking Points</span>
                    </div>
                    <p className="text-foreground text-[11px] leading-relaxed italic">
                      &ldquo;{activeStep.talkTrack}&rdquo;
                    </p>
                    <div className="pt-2 border-t border-border/60 text-[9px] text-muted-foreground">
                      Target Audience: {activeScenario.targetAudience}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/10 p-4 text-center text-muted-foreground space-y-1">
                    <EyeOff className="size-5 mx-auto text-amber-500" />
                    <span className="text-[10px] font-semibold block text-foreground">Audience Screen-Share Mode Active</span>
                    <p className="text-[10px]">Internal talk track is hidden for clean presentation sharing.</p>
                  </div>
                )}

                {/* Navigation Controls */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="h-8 text-xs font-mono gap-1"
                  >
                    <ArrowLeft className="size-3" />
                    <span>Previous</span>
                  </Button>

                  <span className="text-[10px] text-muted-foreground">
                    Step {currentStepIndex + 1} of {activeScenario.steps.length}
                  </span>

                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleNextStep}
                    disabled={currentStepIndex === activeScenario.steps.length - 1}
                    className="h-8 text-xs font-mono gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
