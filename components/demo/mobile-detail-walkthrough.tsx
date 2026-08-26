'use client';

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Car,
  Sparkles,
  CheckCircle2,
  CheckSquare,
  Square,
  ArrowRight,
  CreditCard,
  Camera,
  PlusCircle,
} from "lucide-react";
import { MOBILE_DETAIL_FIXTURE_DATA } from "@/modules/demo/domain/mobile-detail-scenario";

export function MobileDetailWalkthrough() {
  const [appointment, setAppointment] = React.useState(MOBILE_DETAIL_FIXTURE_DATA.appointment);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const handleToggleChecklist = (id: string) => {
    setAppointment((prev) => ({
      ...prev,
      checklist: prev.checklist.map((c) => (c.id === id ? { ...c, isCompleted: !c.isCompleted } : c)),
    }));
  };

  const handleToggleAddon = (id: string) => {
    setAppointment((prev) => {
      const updatedAddOns = prev.addOns.map((a) =>
        a.id === id
          ? {
              ...a,
              isApproved: !a.isApproved,
              approvedBy: !a.isApproved ? `${prev.clientName} (SMS Consent)` : undefined,
              approvedAt: !a.isApproved ? new Date().toISOString() : undefined,
            }
          : a
      );
      const totalAddons = updatedAddOns.filter((a) => a.isApproved).reduce((s, a) => s + a.priceCents, 0);
      const updatedTotal = prev.basePriceCents + totalAddons;

      return {
        ...prev,
        addOns: updatedAddOns,
        payment: {
          ...prev.payment,
          amountCents: updatedTotal,
        },
      };
    });
    setStatusMessage("Add-on consent updated. Total invoice recalculated.");
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSimulatePayment = () => {
    setAppointment((prev) => ({
      ...prev,
      status: "completed",
      payment: {
        ...prev.payment,
        status: "simulated_captured",
        timestamp: new Date().toISOString(),
      },
    }));
    setStatusMessage(`Simulated card charge of $${(appointment.payment.amountCents / 100).toFixed(2)} captured. Zero external side effects.`);
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const completedChecklist = appointment.checklist.filter((c) => c.isCompleted).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
              DEMO SCENARIO // MOBILE ON-DEMAND FLEET
            </Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Peak Mobile Detail
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Phone-First Mobile Detailing & Ceramic Quartz
          </h1>
          <p className="text-sm text-muted-foreground">
            Fast technician workflow spanning vehicle intake, ultrasonic paint depth telemetry, before/after gloss evidence, add-on consent, and simulated payment capture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/40">
            {MOBILE_DETAIL_FIXTURE_DATA.metrics.dailyVanUtilization} Van Utilization
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {MOBILE_DETAIL_FIXTURE_DATA.metrics.averageTicketValue} Avg Ticket
          </Badge>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Vehicle Intake & Telemetry Banner */}
      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Car className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm font-bold text-foreground">
                    {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                  </h3>
                  <Badge variant="secondary" className="font-mono text-[9px]">{appointment.vehicle.color}</Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  Client: <strong className="text-foreground">{appointment.clientName}</strong> &bull; {appointment.locationAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs shrink-0">
              <div className="rounded border border-border bg-muted/20 px-3 py-1.5 text-right">
                <span className="text-muted-foreground block text-[9px] uppercase">Paint Depth Safe</span>
                <strong className="text-primary font-bold">{appointment.vehicle.paintDepthMicrons} &micro;m</strong>
              </div>
              <div className="rounded border border-border bg-muted/20 px-3 py-1.5 text-right">
                <span className="text-muted-foreground block text-[9px] uppercase">Mirror Gloss</span>
                <strong className="text-primary font-bold">{appointment.evidence.paintGlossScoreGu} GU</strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Optimized 2-Column Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Mobile Checklist & Before/After Evidence */}
        <div className="space-y-6 lg:col-span-2">
          {/* Technician Execution Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="size-5" />
                  <CardTitle className="text-base">Technician Execution Checklist</CardTitle>
                </div>
                <Badge variant="default" className="font-mono text-xs">
                  {completedChecklist}/{appointment.checklist.length} Complete
                </Badge>
              </div>
              <CardDescription>Technician: {appointment.technicianName} &bull; Rig: {appointment.vanAssigned}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 font-mono text-xs">
              <div className="divide-y divide-border rounded-lg border border-border bg-card">
                {appointment.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/40 transition"
                  >
                    <button type="button" className="mt-0.5 text-primary shrink-0">
                      {item.isCompleted ? <CheckSquare className="size-4" /> : <Square className="size-4 text-muted-foreground" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-xs block ${item.isCompleted ? "line-through text-muted-foreground" : "text-foreground font-semibold"}`}>
                        {item.description}
                      </span>
                      <Badge variant="outline" className="font-mono text-[8px] uppercase mt-1">
                        {item.category.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* On-Site Add-On Approvals */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <PlusCircle className="size-5" />
                <CardTitle className="text-base">On-Site Customer Add-On Upgrades</CardTitle>
              </div>
              <CardDescription>Technician identified opportunities approved on-site via digital customer consent.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 font-mono text-xs">
              {appointment.addOns.map((add) => (
                <div
                  key={add.id}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3 transition ${
                    add.isApproved ? "border-primary/50 bg-primary/[0.04]" : "border-border bg-card"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-foreground text-xs">{add.name}</strong>
                      <Badge variant={add.isApproved ? "default" : "outline"} className="text-[9px]">
                        +${(add.priceCents / 100).toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-snug">{add.description}</p>
                    {add.isApproved && (
                      <p className="text-primary text-[10px]">
                        &bull; Approved by: {add.approvedBy}
                      </p>
                    )}
                  </div>

                  <Button
                    variant={add.isApproved ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleAddon(add.id)}
                    className="font-mono text-xs shrink-0"
                  >
                    {add.isApproved ? "Approved" : "+ Add Service"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Evidence & Payment */}
        <div className="space-y-6">
          {/* Photographic Evidence Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <Camera className="size-5" />
                <CardTitle className="text-base">Photo Evidence & Gloss</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                <div className="rounded border border-border bg-muted/20 p-2.5">
                  <span className="text-muted-foreground block text-[9px]">Before Intake</span>
                  <strong className="text-foreground">{appointment.evidence.beforePhotosCount} High-Res Shots</strong>
                </div>
                <div className="rounded border border-border bg-muted/20 p-2.5">
                  <span className="text-muted-foreground block text-[9px]">After Quartz Coating</span>
                  <strong className="text-primary font-bold">{appointment.evidence.afterPhotosCount} 4K Shots</strong>
                </div>
              </div>
              <div className="rounded bg-muted/30 p-2.5 text-[10px] text-muted-foreground text-center">
                All photos timestamped & watermarked with GPS coordinates in File Vault.
              </div>
            </CardContent>
          </Card>

          {/* Checkout & Simulated Payment Capture */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="size-5" />
                <CardTitle className="text-base">Simulated Payment Capture</CardTitle>
              </div>
              <CardDescription>External merchant charge intercepted safely in sandbox.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4 font-mono text-xs">
              <div className="space-y-1.5 border-b border-border pb-3">
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Base Package:</span>
                  <span className="text-foreground">${(appointment.basePriceCents / 100).toFixed(2)}</span>
                </div>
                {appointment.addOns
                  .filter((a) => a.isApproved)
                  .map((a) => (
                    <div key={a.id} className="flex justify-between text-xs text-primary">
                      <span>+ {a.name}:</span>
                      <span>${(a.priceCents / 100).toFixed(2)}</span>
                    </div>
                  ))}
                <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                  <span>Total Amount Due:</span>
                  <span className="text-primary">${(appointment.payment.amountCents / 100).toFixed(2)}</span>
                </div>
              </div>

              {appointment.status === "completed" ? (
                <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Payment Simulated & Captured</span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">
                    Card: &bull;&bull;&bull;&bull; {appointment.payment.cardLast4} &bull; Ref: {appointment.payment.simulatedReceiptId}
                  </p>
                </div>
              ) : (
                <Button size="sm" onClick={handleSimulatePayment} className="w-full font-mono text-xs">
                  Capture Payment (${(appointment.payment.amountCents / 100).toFixed(2)})
                </Button>
              )}

              <Link
                href="/analytics"
                className="inline-flex w-full items-center justify-between rounded border border-border bg-card px-3 py-2 font-mono text-xs text-foreground transition hover:border-primary hover:text-primary"
              >
                <span>View Fleet Analytics</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
