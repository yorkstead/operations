'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, CheckCircle2, Plus, Scale, X, Layers } from "lucide-react";
import { PackagingUnit, PackagingMetricsSummary, ContainerType } from "@/modules/packaging/domain/types";

export function PackagingWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [packages, setPackages] = React.useState<PackagingUnit[]>([]);
  const [metrics, setMetrics] = React.useState<PackagingMetricsSummary>({
    activePackagesCount: 0,
    readyForShipmentCount: 0,
    totalWeightPackedLbs: 0,
  });

  // Modal State
  const [createOpen, setCreateOpen] = React.useState(false);
  const [containerType, setContainerType] = React.useState<ContainerType>("box");
  const [maxCapacity, setMaxCapacity] = React.useState("50.0");
  const [tareWeight, setTareWeight] = React.useState("2.0");

  const [packModalOpen, setPackModalOpen] = React.useState(false);
  const [selectedPackage, setSelectedPackage] = React.useState<PackagingUnit | null>(null);
  const [partDesc, setPartDesc] = React.useState("Precision Laser Cut Flanges - 0.25in 304 SS");
  const [packQty, setPackQty] = React.useState(25);
  const [unitWeight, setUnitWeight] = React.useState("0.85");
  const [lotNumber, setLotNumber] = React.useState("LOT-2026-SS1");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchPackagingData = React.useCallback(async () => {
    try {
      const [pkgRes, metricsRes] = await Promise.all([
        fetch("/api/packaging/containers"),
        fetch("/api/packaging/metrics"),
      ]);

      if (pkgRes.ok) {
        const data = await pkgRes.json();
        setPackages(data.packages || []);
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics || {
          activePackagesCount: 0,
          readyForShipmentCount: 0,
          totalWeightPackedLbs: 0,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load packaging registry." });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchPackagingData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchPackagingData]);

  const handleSealPackage = async (pkgNumber: string) => {
    try {
      const res = await fetch(`/api/packaging/containers/${pkgNumber}/seal`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to seal container");
      }
      setFeedback({ type: "success", message: `Container ${pkgNumber} sealed. Shipping label barcode generated.` });
      fetchPackagingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Seal failed" });
    }
  };

  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/packaging/containers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          containerType,
          maxCapacityLbs: parseFloat(maxCapacity || "50.0"),
          tareWeightLbs: parseFloat(tareWeight || "2.0"),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create container");
      }

      setFeedback({ type: "success", message: `Packaging container created.` });
      setCreateOpen(false);
      fetchPackagingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Creation failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/packaging/containers/${selectedPackage.packageNumber}/pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partDescription: partDesc,
          quantity: packQty,
          unitWeightLbs: parseFloat(unitWeight || "1.0"),
          lotNumber,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to pack item");
      }

      setFeedback({ type: "success", message: `Packed ${packQty} parts into ${selectedPackage.packageNumber}.` });
      setPackModalOpen(false);
      fetchPackagingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Pack failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">OPERATIONS//PACKAGING</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Container Specifications & Weight Controls
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Packaging & Palletization
          </h1>
          <p className="text-sm text-muted-foreground">
            Container specifications, tare/gross weight rollups, and tamper-evident sealing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            New Container
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border p-3 font-mono text-xs ${
            feedback.type === "success"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFeedback(null)} className="size-6 p-0">
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Active Containers In-Pack</span>
            <Box className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.activePackagesCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Sealed Ready for Shipping</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.readyForShipmentCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Total Packed Gross Weight</span>
            <Scale className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            {metrics.totalWeightPackedLbs.toLocaleString(undefined, { minimumFractionDigits: 1 })} lbs
          </p>
        </Card>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Layers className="size-5" />
            <CardTitle className="text-base">Packaging Units & Pallet Registry</CardTitle>
          </div>
          <CardDescription>Container weight capacity monitoring, part contents, and tamper sealing.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex min-h-[25vh] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading packaging registry...</span>
              </div>
            </div>
          ) : packages.length === 0 ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
              <Box className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">Zero Packaging Units</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Create packaging units to box or palletize finished goods for outbound shipment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {packages.map((pkg) => {
                const capacityPercent = pkg.maxCapacityLbs > 0 ? Math.round((pkg.grossWeightLbs / pkg.maxCapacityLbs) * 100) : 0;
                return (
                  <div key={pkg.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{pkg.packageNumber}</span>
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">
                          {pkg.containerType} ({pkg.dimensionsInches.length}x{pkg.dimensionsInches.width}x{pkg.dimensionsInches.height} in)
                        </Badge>
                        <Badge
                          variant={pkg.status === "sealed_ready_for_shipping" ? "default" : "outline"}
                          className="font-mono text-[9px] uppercase"
                        >
                          {pkg.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {pkg.items.length > 0
                          ? pkg.items.map((i) => `${i.quantityPacked}x ${i.partDescription}`).join(", ")
                          : "Empty container (tare weight only)"}
                      </p>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                        <span>Gross: <strong className="text-foreground">{pkg.grossWeightLbs} lbs</strong> / {pkg.maxCapacityLbs} lbs max ({capacityPercent}%)</span>
                        <span>&bull;</span>
                        <span>Net: {pkg.netWeightLbs} lbs</span>
                        <span>&bull;</span>
                        <span>Tare: {pkg.tareWeightLbs} lbs</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {pkg.status === "in_pack" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPackage(pkg);
                              setPackModalOpen(true);
                            }}
                            className="font-mono text-xs"
                          >
                            <Plus className="mr-1.5 size-3.5" />
                            Pack Parts
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSealPackage(pkg.packageNumber)}
                            className="font-mono text-xs"
                          >
                            <CheckCircle2 className="mr-1.5 size-3.5" />
                            Seal Container
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Container Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">New Packaging Unit</h2>
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateContainer} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Container Type</label>
                <select
                  value={containerType}
                  onChange={(e) => {
                    const ct = e.target.value as ContainerType;
                    setContainerType(ct);
                    if (ct === "pallet") {
                      setMaxCapacity("2000.0");
                      setTareWeight("40.0");
                    } else if (ct === "crate") {
                      setMaxCapacity("800.0");
                      setTareWeight("25.0");
                    } else {
                      setMaxCapacity("50.0");
                      setTareWeight("2.0");
                    }
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="box">Corrugated Box</option>
                  <option value="pallet">Wood Pallet</option>
                  <option value="crate">Wood Crate</option>
                  <option value="tote">Plastic Tote</option>
                  <option value="bundle">Steel Banded Bundle</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Max Capacity (lbs)</label>
                  <input
                    type="text"
                    required
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Tare Weight (lbs)</label>
                  <input
                    type="text"
                    required
                    value={tareWeight}
                    onChange={(e) => setTareWeight(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Unit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pack Parts Modal */}
      {packModalOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Pack Parts into Container</h2>
                <p className="font-mono text-xs text-muted-foreground">{selectedPackage.packageNumber} ({selectedPackage.grossWeightLbs} / {selectedPackage.maxCapacityLbs} lbs)</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPackModalOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handlePackItemSubmit} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Part Description</label>
                <input
                  type="text"
                  required
                  value={partDesc}
                  onChange={(e) => setPartDesc(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Quantity Packed</label>
                  <input
                    type="number"
                    min={1}
                    value={packQty}
                    onChange={(e) => setPackQty(parseInt(e.target.value, 10))}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Unit Weight (lbs)</label>
                  <input
                    type="text"
                    value={unitWeight}
                    onChange={(e) => setUnitWeight(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Lot / Batch Number</label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setPackModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Packing..." : "Add to Container"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
