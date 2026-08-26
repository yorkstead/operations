'use client';

import * as React from "react";
import { ALL_MODULE_KEYS, ModuleKey, DEFAULT_ORG_CONFIG } from "@/modules/config/domain/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sliders, History, ShieldCheck, CheckCircle2, RotateCcw } from "lucide-react";

export function ConfigurationWorkspace() {
  const [entitlements, setEntitlements] = React.useState<Record<ModuleKey, boolean>>({
    ...DEFAULT_ORG_CONFIG.entitlements,
  });

  const [terminology, setTerminology] = React.useState({
    ...DEFAULT_ORG_CONFIG.terminology,
  });

  const [workflow, setWorkflow] = React.useState({
    ...DEFAULT_ORG_CONFIG.workflow,
  });

  const [version, setVersion] = React.useState(1);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const toggleModule = (key: ModuleKey) => {
    const updated = !entitlements[key];
    setEntitlements({ ...entitlements, [key]: updated });
    setFeedback(`Module '${key}' ${updated ? "enabled" : "disabled"}.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSave = () => {
    const nextVer = version + 1;
    setVersion(nextVer);
    setFeedback(`Saved configuration as v${nextVer}. Server-side invariants updated.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRollback = () => {
    setEntitlements({ ...DEFAULT_ORG_CONFIG.entitlements });
    setTerminology({ ...DEFAULT_ORG_CONFIG.terminology });
    setWorkflow({ ...DEFAULT_ORG_CONFIG.workflow });
    setVersion(version + 1);
    setFeedback(`Rolled back to initial baseline.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">CORE//CONFIG</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Tenant Settings & Entitlements
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Configuration & Administration
          </h1>
          <p className="text-sm text-muted-foreground">
            Versioned organization settings, module entitlements, terminology mappings, and workflow guardrails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRollback}>
            <RotateCcw className="mr-1.5 size-3.5" />
            Rollback
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            Save Changes (v{version})
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Module Entitlements Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Sliders className="size-5" />
                <CardTitle className="text-base">Module Entitlements</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">Config v{version}</Badge>
            </div>
            <CardDescription>Enable or disable operational modules server-side for this tenant.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {ALL_MODULE_KEYS.map((key) => {
                const isEnabled = entitlements[key];
                return (
                  <div
                    key={key}
                    onClick={() => toggleModule(key)}
                    className={`flex items-center justify-between rounded-lg border p-3.5 transition cursor-pointer ${
                      isEnabled
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border bg-card/40 text-muted-foreground opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-semibold capitalize">{key} Module</span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {isEnabled ? "Active & Entitled" : "Disabled (Enforced)"}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isEnabled}
                      readOnly
                      className="size-4 accent-primary"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Terminology & Workflow Invariants */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="size-5" />
                <CardTitle className="text-base">Industry Terminology</CardTitle>
              </div>
              <CardDescription>Custom label mappings without code divergence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Job Record Label</label>
                <input
                  type="text"
                  value={terminology.jobLabel}
                  onChange={(e) => setTerminology({ ...terminology, jobLabel: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Router / Traveler Label</label>
                <input
                  type="text"
                  value={terminology.travelerLabel}
                  onChange={(e) => setTerminology({ ...terminology, travelerLabel: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Facility Label</label>
                <input
                  type="text"
                  value={terminology.facilityLabel}
                  onChange={(e) => setTerminology({ ...terminology, facilityLabel: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <History className="size-5" />
                <CardTitle className="text-base">Workflow Policies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between py-1">
                <span className="font-mono text-xs text-foreground">Require Quality Signoff</span>
                <input
                  type="checkbox"
                  checked={workflow.requireQualitySignoff}
                  onChange={(e) => setWorkflow({ ...workflow, requireQualitySignoff: e.target.checked })}
                  className="size-4 accent-primary"
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-mono text-xs text-foreground">Allow Rush Overrides</span>
                <input
                  type="checkbox"
                  checked={workflow.allowRushOverrides}
                  onChange={(e) => setWorkflow({ ...workflow, allowRushOverrides: e.target.checked })}
                  className="size-4 accent-primary"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Default Labor Rate ($/hr)</label>
                <input
                  type="number"
                  value={workflow.defaultLaborRatePerHour}
                  onChange={(e) => setWorkflow({ ...workflow, defaultLaborRatePerHour: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
