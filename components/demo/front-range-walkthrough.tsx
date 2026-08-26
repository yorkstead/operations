'use client';

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { FRONT_RANGE_FIXTURE_DATA } from "@/modules/demo/domain/front-range-scenario";

export function FrontRangeWalkthrough() {
  const [selectedPersona, setSelectedPersona] = React.useState(FRONT_RANGE_FIXTURE_DATA.personas[0].id);
  const [disruptionActive, setDisruptionActive] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const currentPersona = FRONT_RANGE_FIXTURE_DATA.personas.find((p) => p.id === selectedPersona)!;

  const toggleDisruption = () => {
    if (!disruptionActive) {
      setDisruptionActive(true);
      setFeedback("Simulation disruption triggered: EQ-LASER-01 Nitrogen Assist Gas Pressure Alarm. Laser Cell halted.");
    } else {
      setDisruptionActive(false);
      setFeedback("Disruption resolved: Manifold O-ring replaced and lines purged. Asset EQ-LASER-01 restored to operational.");
    }
    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
              DEMO SCENARIO // HIGH-MIX MANUFACTURING
            </Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Front Range Architectural Products
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Front Range Precision Walkthrough
          </h1>
          <p className="text-sm text-muted-foreground">
            End-to-end interactive journey from customer RFQ intake to job release, shopfloor traveler execution, FAI quality, and shipping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDisruption}
            className={`font-mono text-xs ${disruptionActive ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "hover:border-primary/40"}`}
          >
            {disruptionActive ? (
              <>
                <Wrench className="mr-1.5 size-3.5" /> Resolve Disruption
              </>
            ) : (
              <>
                <AlertTriangle className="mr-1.5 size-3.5 text-yellow-400" /> Trigger Disruption Test
              </>
            )}
          </Button>
        </div>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 rounded-lg border p-3 text-xs font-mono ${
          disruptionActive ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-primary/40 bg-primary/10 text-primary"
        }`}>
          {disruptionActive ? <ShieldAlert className="size-4 shrink-0" /> : <CheckCircle2 className="size-4 shrink-0" />}
          <span>{feedback}</span>
        </div>
      )}

      {/* Disruption Alert Banner */}
      {disruptionActive && (
        <Card className="border-red-500/50 bg-red-500/[0.04]">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold">
                <AlertTriangle className="size-4 shrink-0" />
                <span>UNSCHEDULED DOWNTIME EVENT IN PROGRESS: {FRONT_RANGE_FIXTURE_DATA.disruption.title}</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {FRONT_RANGE_FIXTURE_DATA.disruption.symptomDescription}
              </p>
              <p className="font-mono text-[11px] text-foreground">
                <strong className="text-red-400">Corrective Action:</strong> {FRONT_RANGE_FIXTURE_DATA.disruption.correctiveAction}
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={toggleDisruption}
              className="font-mono text-xs shrink-0"
            >
              Authorize Return to Service
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Persona Role Switcher */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-primary">
            <User className="size-5" />
            <CardTitle className="text-base">Operational Personas & Duty Segregation</CardTitle>
          </div>
          <CardDescription>Select a persona to view their contextual responsibilities and station permissions.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FRONT_RANGE_FIXTURE_DATA.personas.map((p) => {
              const isSelected = p.id === selectedPersona;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPersona(p.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/[0.05] ring-1 ring-primary/40 shadow-sm"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-foreground">
                        {p.avatarInitials}
                      </div>
                      <div>
                        <h4 className="font-mono text-xs font-bold text-foreground">{p.name}</h4>
                        <p className="font-mono text-[10px] text-muted-foreground">{p.roleTitle}</p>
                      </div>
                    </div>
                    {isSelected && <Badge variant="default" className="font-mono text-[8px]">ACTIVE</Badge>}
                  </div>

                  <ul className="mt-3 space-y-1 border-t border-border pt-2 font-mono text-[10px] text-muted-foreground">
                    {p.keyResponsibilities.map((resp, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-primary">&bull;</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/[0.03] p-3 font-mono text-xs text-foreground">
            <div className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              <span>
                Active Session Persona: <strong className="text-primary">{currentPersona.name}</strong> ({currentPersona.roleTitle})
              </span>
            </div>
            <Badge variant="outline" className="font-mono text-[9px] uppercase">
              Role: {currentPersona.membershipRole}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* End-to-End Walkthrough Stages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            Complete Quote-to-Ship Flow Stages
          </h2>
          <span className="font-mono text-xs text-muted-foreground">4 Sequential Checkpoints</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stage 1 */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-primary">STAGE 1</span>
                <Badge variant="outline" className="font-mono text-[8px]">QuoteFlow</Badge>
              </div>
              <CardTitle className="text-sm">RFQ Intake & Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">
                RFQ for 48x Architectural Facade Panels (Skyline Tower). Computed cost: $25,920, Price: $38,400 (32.5% margin).
              </p>
              <div className="rounded bg-muted/40 p-2 font-mono text-[10px] space-y-1">
                <div className="flex justify-between"><span>Quote No:</span><strong className="text-foreground">{FRONT_RANGE_FIXTURE_DATA.seededRecords.quoteNumber}</strong></div>
                <div className="flex justify-between"><span>Material:</span><strong className="text-foreground">5052-H32 Alum</strong></div>
              </div>
              <Link
                href="/quotes"
                className="inline-flex w-full items-center justify-between rounded border border-border bg-card px-3 py-2 font-mono text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                <span>Open QuoteFlow</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Stage 2 */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-primary">STAGE 2</span>
                <Badge variant="outline" className="font-mono text-[8px]">ShopFloor</Badge>
              </div>
              <CardTitle className="text-sm">Digital Traveler Execution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">
                Routing: Laser Cut (WC-LASER-01) &rarr; CNC Brake Form (WC-BRAKE-01) &rarr; TIG Weld (WC-WELD-01) &rarr; Powder Coat.
              </p>
              <div className="rounded bg-muted/40 p-2 font-mono text-[10px] space-y-1">
                <div className="flex justify-between"><span>Traveler:</span><strong className="text-foreground">{FRONT_RANGE_FIXTURE_DATA.seededRecords.travelerNumber}</strong></div>
                <div className="flex justify-between"><span>Active Cell:</span><strong className="text-foreground">Laser Fiber 4kW</strong></div>
              </div>
              <Link
                href="/shopfloor"
                className="inline-flex w-full items-center justify-between rounded border border-border bg-card px-3 py-2 font-mono text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                <span>Open Shopfloor Station</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Stage 3 */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-primary">STAGE 3</span>
                <Badge variant="outline" className="font-mono text-[8px]">Quality</Badge>
              </div>
              <CardTitle className="text-sm">First Article Inspection & NCR</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">
                Verified 5-point dimensional tolerance check. Controlled disposition of edge-burr NCR with segregation of duties.
              </p>
              <div className="rounded bg-muted/40 p-2 font-mono text-[10px] space-y-1">
                <div className="flex justify-between"><span>NCR Record:</span><strong className="text-foreground">{FRONT_RANGE_FIXTURE_DATA.seededRecords.ncrNumber}</strong></div>
                <div className="flex justify-between"><span>First Pass Yield:</span><strong className="text-primary font-bold">99.2%</strong></div>
              </div>
              <Link
                href="/quality"
                className="inline-flex w-full items-center justify-between rounded border border-border bg-card px-3 py-2 font-mono text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                <span>Open Quality Station</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Stage 4 */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-primary">STAGE 4</span>
                <Badge variant="outline" className="font-mono text-[8px]">Shipping</Badge>
              </div>
              <CardTitle className="text-sm">Pallet Load & Dispatch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">
                Packed into wooden A-frame pallet PAL-2026-042 (1,240 lbs). Manifest dispatched with Bill of Lading.
              </p>
              <div className="rounded bg-muted/40 p-2 font-mono text-[10px] space-y-1">
                <div className="flex justify-between"><span>Manifest:</span><strong className="text-foreground">{FRONT_RANGE_FIXTURE_DATA.seededRecords.manifestNumber}</strong></div>
                <div className="flex justify-between"><span>Carrier:</span><strong className="text-foreground">Freight Direct Express</strong></div>
              </div>
              <Link
                href="/shipping"
                className="inline-flex w-full items-center justify-between rounded border border-border bg-card px-3 py-2 font-mono text-xs font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                <span>Open Load Builder</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
