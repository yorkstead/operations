'use client';

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, ShieldCheck, ArrowRight, ArrowLeft, ExternalLink, CheckCircle2, Sparkles, Factory, Wrench, Zap, Car } from "lucide-react";
import { FrontRangeWalkthrough } from "@/components/demo/front-range-walkthrough";
import { SummitFacilityWalkthrough } from "@/components/demo/summit-facility-walkthrough";
import { SignworksWalkthrough } from "@/components/demo/signworks-walkthrough";
import { MobileDetailWalkthrough } from "@/components/demo/mobile-detail-walkthrough";
import { SalesPresenterCockpit } from "@/components/demo/sales-presenter-cockpit";

export function DemoHub() {
  const [activeScenario, setActiveScenario] = React.useState("front-range-manufacturing");
  const [resetState, setResetState] = React.useState<string | null>(null);
  const [isResetting, setIsResetting] = React.useState(false);

  const scenarios = [
    {
      slug: "front-range-manufacturing",
      name: "Front Range Precision Manufacturing",
      industry: "Precision Sheet Metal & CNC Machining",
      icon: Factory,
      description: "High-mix contract manufacturing with laser cutting, CNC press brake forming, welding, and first-article quality inspections.",
      jobsCount: 12,
      wipValue: "$142,500",
      onTimeRate: "98.7%",
      steps: [
        { name: "Quote Estimating", link: "/quotes", desc: "Evaluate margin guardrails and convert RFQ to live job" },
        { name: "Shopfloor Traveler", link: "/shopfloor", desc: "Execute operations on 6kW Laser Cell with QR scans" },
        { name: "FAI Quality Check", link: "/quality", desc: "Perform dimensional inspection and NCR containment" },
        { name: "Pallet Shipping", link: "/shipping", desc: "Build pallet load, compute gross weight, and dispatch" },
      ],
    },
    {
      slug: "summit-facility-services",
      name: "Summit Facility Services",
      industry: "Commercial HVAC & Plant Maintenance",
      icon: Wrench,
      description: "Multi-site facility operations managing capital chillers, air handlers, and preventive maintenance work orders.",
      jobsCount: 8,
      wipValue: "$68,200",
      onTimeRate: "97.4%",
      steps: [
        { name: "Fleet Telemetry", link: "/maintenance", desc: "Inspect equipment runtime and downtime intervals" },
        { name: "LOTO Safety Log", link: "/maintenance", desc: "Authorize return-to-service with verified checklists" },
        { name: "KnowHow SOPs", link: "/knowledge", desc: "Search citation-backed chiller troubleshooting guides" },
        { name: "Analytics Pulse", link: "/analytics", desc: "Review executive uptime KPIs and capacity signals" },
      ],
    },
    {
      slug: "mile-high-signworks",
      name: "Mile High Signworks",
      industry: "Architectural Signage & Crane Rigging",
      icon: Zap,
      description: "Custom illuminated LED channel letters, vector revision lock, UL electrical permitting, and 45ft boom crane installations.",
      jobsCount: 14,
      wipValue: "$96,400",
      onTimeRate: "98.2%",
      steps: [
        { name: "Vector Art Lock", link: "/shopfloor", desc: "Enforce client revision signoff before releasing to CNC" },
        { name: "UL Permitting", link: "/files", desc: "Track electrical inspector approvals and permits" },
        { name: "Shop Fabrication", link: "/shopfloor", desc: "Route aluminum backs, acrylic faces, and LED wiring" },
        { name: "Crane Rigging", link: "/shipping", desc: "Boom crane dispatch and illuminated proof-of-work closeout" },
      ],
    },
    {
      slug: "peak-mobile-detail",
      name: "Peak Mobile Detail",
      industry: "Mobile Detailing & Ceramic Quartz",
      icon: Car,
      description: "On-demand mobile detailing vans, ultrasonic paint depth telemetry, on-site add-on consent, and simulated payment capture.",
      jobsCount: 6,
      wipValue: "$4,200",
      onTimeRate: "99.8%",
      steps: [
        { name: "Intake Telemetry", link: "/shopfloor", desc: "Measure ultrasonic paint depth and paint condition" },
        { name: "Mobile Checklist", link: "/quality", desc: "Execute multi-stage wash, decon, and ceramic cure" },
        { name: "Add-On Consent", link: "/quotes", desc: "Capture client digital approval for engine bay steam" },
        { name: "Simulated Payment", link: "/analytics", desc: "Capture payment with zero external side effects" },
      ],
    },
  ];

  const current = scenarios.find((s) => s.slug === activeScenario) || scenarios[0];

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      setIsResetting(false);
      setResetState("Demo organization successfully reset to golden state. All synthetic work orders, stock levels, and inspection sheets restored.");
      setTimeout(() => setResetState(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Return to Yorkstead Public Site & Walkthrough Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 font-mono text-xs text-muted-foreground">
        <a
          href="https://yorkstead.com"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return to yorkstead.com</span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href={`https://yorkstead.com/demos/${current.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition"
          >
            <span>Read {current.name} Walkthrough</span>
            <ExternalLink className="size-3 opacity-80" />
          </a>
          <span className="text-border">|</span>
          <span className="text-[10px] text-amber-500 font-bold uppercase">
            Synthetic Sandbox
          </span>
        </div>
      </div>

      {/* Demo Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              DEMO MODE // SYNTHETIC DATA
            </Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Isolated Sandbox Environments
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Deterministic Demo Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore live, interactive operational workflows populated with deterministic synthetic fixtures and zero external side effects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
            className="font-mono text-xs border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
          >
            <RotateCcw className={`mr-1.5 size-3.5 ${isResetting ? "animate-spin" : ""}`} />
            {isResetting ? "Resetting..." : "Reset Golden Snapshot"}
          </Button>
        </div>
      </div>

      {resetState && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{resetState}</span>
        </div>
      )}

      {/* Guided Sales Presenter Cockpit */}
      <SalesPresenterCockpit
        currentScenarioSlug={activeScenario}
        onScenarioChange={(slug) => setActiveScenario(slug)}
      />

      {/* Scenario Selector */}
      <div className="grid gap-4 sm:grid-cols-2">
        {scenarios.map((sc) => {
          const ScIcon = sc.icon;
          const isSelected = sc.slug === activeScenario;
          return (
            <Card
              key={sc.slug}
              onClick={() => setActiveScenario(sc.slug)}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30 shadow-lg"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-md p-2 ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <ScIcon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-foreground">{sc.name}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground">{sc.industry}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="font-mono text-[9px]">ACTIVE</Badge>
                  )}
                </div>

                <p className="font-mono text-xs text-muted-foreground leading-relaxed">{sc.description}</p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border font-mono text-[10px]">
                  <div>
                    <span className="text-muted-foreground block">Active Jobs</span>
                    <span className="font-bold text-foreground">{sc.jobsCount} Orders</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">WIP Value</span>
                    <span className="font-bold text-foreground">{sc.wipValue}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">On-Time Rate</span>
                    <span className="font-bold text-primary">{sc.onTimeRate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Guided Walkthrough Storyline */}
      {activeScenario === "front-range-manufacturing" ? (
        <FrontRangeWalkthrough />
      ) : activeScenario === "summit-facility-services" ? (
        <SummitFacilityWalkthrough />
      ) : activeScenario === "mile-high-signworks" ? (
        <SignworksWalkthrough />
      ) : activeScenario === "peak-mobile-detail" ? (
        <MobileDetailWalkthrough />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Guided Story Walkthrough: {current.name}</CardTitle>
                  <CardDescription>Step-by-step interactive workflow through the live system.</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {current.steps.length} INTERACTIVE STAGES
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {current.steps.map((st, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card p-4 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-primary">STAGE 0{idx + 1}</span>
                      <Badge variant="outline" className="font-mono text-[8px]">{st.name}</Badge>
                    </div>
                    <p className="font-mono text-xs font-semibold text-foreground">{st.desc}</p>
                  </div>

                  <Link
                    href={st.link}
                    className="mt-3 inline-flex items-center justify-between rounded border border-border bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] text-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  >
                    <span>Launch Workspace</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Guardrails Security Summary */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="size-5" />
            <CardTitle className="text-sm">Sandbox Guardrails & Interception Enforced</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-3 font-mono text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <strong className="text-foreground block">Zero SMTP Leakage</strong>
                Outbound emails routed to in-memory preview.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <strong className="text-foreground block">Isolated Partition</strong>
                Demo records cannot read production tenant data.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <strong className="text-foreground block">Instant Golden Reset</strong>
                One-click idempotent restore to baseline snapshot.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
