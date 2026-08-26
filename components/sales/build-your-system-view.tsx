'use client';

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  Printer,
  Sparkles,
  Layers,
  Cpu,
  UserCheck,
  Building2
} from "lucide-react";
import {
  SystemConfiguratorService,
  availableModules
} from "@/modules/sales-tools/application/system-configurator-service";
import type {
  ConfiguratorSelections,
  IndustryProfile,
  SystemRole,
  SystemModuleId,
  IntegrationOption
} from "@/modules/sales-tools/domain/system-configurator";

export function BuildYourSystemView() {
  const [industry, setIndustry] = React.useState<IndustryProfile>("cnc_sheet_metal");
  const [shopSize, setShopSize] = React.useState<"1_to_10" | "10_to_50" | "50_plus">("10_to_50");
  const [roles, setRoles] = React.useState<SystemRole[]>([
    "owner_executive",
    "estimator_sales",
    "shopfloor_operator",
  ]);
  const [selectedModules, setSelectedModules] = React.useState<SystemModuleId[]>([
    "quoteflow_estimating",
    "shopfloor_travelers",
    "quality_ncr",
  ]);
  const [integrations, setIntegrations] = React.useState<IntegrationOption[]>([
    "vector_cad_dxf",
    "barcode_scanners",
  ]);
  const [targetTimeline] = React.useState<"immediate_pilot" | "quarterly_rollout" | "exploratory">("immediate_pilot");
  const [primaryBottleneck] = React.useState("Drawing revision mismatches and paper traveler lost time.");

  const toggleRole = (r: SystemRole) => {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const toggleModule = (m: SystemModuleId) => {
    setSelectedModules((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const toggleIntegration = (i: IntegrationOption) => {
    setIntegrations((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const brief = React.useMemo(() => {
    const selections: ConfiguratorSelections = {
      industry,
      shopSize,
      roles,
      selectedModules,
      integrations,
      primaryBottleneck,
      targetTimeline,
    };
    return SystemConfiguratorService.generateDiscussionBrief(selections);
  }, [industry, shopSize, roles, selectedModules, integrations, primaryBottleneck, targetTimeline]);

  const industryLabels: Record<IndustryProfile, string> = {
    cnc_sheet_metal: "Precision CNC & Sheet Metal Fabrication",
    facility_maintenance: "Commercial Facility Maintenance & HVAC",
    architectural_signage: "Architectural Signage & Boom Rigging",
    mobile_detailing: "Mobile Fleet Detailing & Automotive",
    custom_manufacturing: "Custom Job Shop & Assemblies",
  };

  const roleLabels: Record<SystemRole, string> = {
    owner_executive: "Company Owner / Executive",
    estimator_sales: "Estimator / Project Manager",
    shopfloor_operator: "Shopfloor Machine Operator",
    quality_inspector: "Quality & Compliance Inspector",
    shipping_clerk: "Shipping & Logistics Lead",
    field_technician: "Mobile Field Technician",
  };

  const integrationLabels: Record<IntegrationOption, string> = {
    vector_cad_dxf: "Vector CAD / DXF Engineering Vault",
    barcode_scanners: "Shopfloor QR & Barcode Laser Scanners",
    caliper_measurement_gauges: "Digital Caliper & Measurement Gauges",
    modbus_plc_telemetry: "Modbus TCP Machine Runtime Telemetry",
    carrier_freight_bol: "Carrier Freight Bill of Lading Manifests",
    accounting_gl_export: "QuickBooks / Accounting Journal Export",
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px] uppercase bg-primary/20 text-primary border-primary/30">
              INTERACTIVE CONFIGURATOR
            </Badge>
            <span className="text-muted-foreground text-xs">Architectural Discussion Guide</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Build Your Operational System
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Configure your shop&apos;s workflow requirements, key roles, and module boundaries. Generates an evidence-backed discussion brief with zero PII required.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="font-mono text-xs gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Print Brief</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Grid: Configurator Inputs on Left, Real-Time Discussion Brief on Right */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Left Column: Interactive Selectors */}
        <div className="space-y-6">
          {/* 1. Industry & Shop Size */}
          <Card className="border-border bg-card/75">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span>1. Industry & Operational Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(industryLabels) as IndustryProfile[]).map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`rounded-lg p-2.5 text-left border transition text-[11px] ${
                      industry === ind
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-muted/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {industryLabels[ind]}
                  </button>
                ))}
              </div>

              <div>
                <span className="text-[10px] uppercase text-muted-foreground block mb-1">Facility Size</span>
                <div className="flex gap-2">
                  {[
                    { id: "1_to_10", label: "1 – 10 Team Members" },
                    { id: "10_to_50", label: "10 – 50 Team Members" },
                    { id: "50_plus", label: "50+ Enterprise Shop" },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      onClick={() => setShopSize(sz.id as "1_to_10" | "10_to_50" | "50_plus")}
                      className={`flex-1 rounded border py-1.5 px-2 text-center text-[10px] transition ${
                        shopSize === sz.id
                          ? "border-primary bg-primary/15 text-primary font-bold"
                          : "border-border bg-muted/10 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Key Human Roles */}
          <Card className="border-border bg-card/75">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="size-4 text-primary" />
                <span>2. Human Roles & Tailored Interfaces</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Select the roles that need dedicated, noise-free interfaces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(roleLabels) as SystemRole[]).map((r) => {
                  const isSelected = roles.includes(r);
                  return (
                    <button
                      key={r}
                      onClick={() => toggleRole(r)}
                      className={`flex items-center justify-between rounded-lg p-2.5 border transition text-left text-[11px] ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-muted/10 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{roleLabels[r]}</span>
                      {isSelected && <CheckCircle2 className="size-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 3. Composable Operational Modules */}
          <Card className="border-border bg-card/75">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <span>3. Operational Building Blocks</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Activate the exact modules your current operation requires.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableModules.map((mod) => {
                  const isSelected = selectedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`cursor-pointer rounded-lg p-3 border transition flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-muted/5 text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`size-3 rounded-sm border flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}>
                            {isSelected && <span className="text-[9px] font-bold">&check;</span>}
                          </span>
                          <span className="font-semibold text-xs text-foreground">{mod.name}</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-[9px]">
                          {mod.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-5">{mod.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 4. Hardware & Integrations */}
          <Card className="border-border bg-card/75">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="size-4 text-primary" />
                <span>4. Hardware & System Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(integrationLabels) as IntegrationOption[]).map((opt) => {
                  const isSelected = integrations.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleIntegration(opt)}
                      className={`flex items-center justify-between rounded-lg p-2.5 border transition text-left text-[11px] ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-muted/10 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{integrationLabels[opt]}</span>
                      {isSelected && <CheckCircle2 className="size-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Discussion Brief Blueprint */}
        <div className="space-y-6">
          <Card className="border-primary/40 bg-card/95 shadow-xl backdrop-blur sticky top-6">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-primary font-bold">
                    SYSTEM BLUEPRINT // {brief.briefId}
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground mt-0.5">
                    Architectural Discussion Brief
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="font-mono text-xs bg-primary/20 text-primary border-primary/30">
                  ${(brief.estimatedTotalScopeCents.min / 100).toLocaleString()} – ${(brief.estimatedTotalScopeCents.max / 100).toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-5 sm:p-6 text-xs">
              {/* Recommended First Milestone */}
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/[0.05] p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[10px]">
                  <Sparkles className="size-3.5" />
                  <span>Recommended Phase 1 Vertical Slice</span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{brief.recommendedFirstSlice}</h4>
                <p className="text-muted-foreground text-[11px]">
                  {brief.recommendedPhases[0]?.rationale}
                </p>
              </div>

              {/* Compatibility & Architecture Notices */}
              {brief.compatibilityNotices.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold block">
                    Architectural Boundary Notices
                  </span>
                  {brief.compatibilityNotices.map((nt, idx) => (
                    <div
                      key={idx}
                      className={`rounded border p-3 text-[11px] space-y-1 ${
                        nt.level === "warning"
                          ? "border-amber-500/40 bg-amber-500/[0.05] text-amber-300"
                          : nt.level === "recommendation"
                          ? "border-primary/40 bg-primary/[0.05] text-primary"
                          : "border-border bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[9px]">
                        {nt.level === "warning" ? <AlertTriangle className="size-3" /> : <Info className="size-3" />}
                        <span>{nt.title}</span>
                      </div>
                      <p className="text-muted-foreground text-[10px] leading-relaxed">{nt.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Phased Roadmap Table */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-muted-foreground font-bold block">
                  Phased Implementation Roadmap
                </span>
                <div className="space-y-2">
                  {brief.recommendedPhases.map((phase) => (
                    <div key={phase.phase} className="rounded border border-border bg-muted/10 p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-foreground font-semibold text-xs">
                        <span>Phase 0{phase.phase}: {phase.title}</span>
                        <span className="text-primary font-mono text-[11px]">
                          ${(phase.estimatedPriceRangeCents.min / 100).toLocaleString()} – ${(phase.estimatedPriceRangeCents.max / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Est. Duration: {phase.durationWeeks}</span>
                        <span>{phase.includedModules.length} module(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions & Next Action */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div>&bull; Bounded fixed-fee milestones in integer cents; zero unverified ROI math.</div>
                  <div>&bull; 100% test coverage and isolated tenant boundaries on deployment.</div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/audit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-mono text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
                  >
                    <span>Schedule Workflow Audit to Validate Brief</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
