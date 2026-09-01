'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2, Plus, Send, X } from "lucide-react";
import { ShippingManifest, ShippingMetricsSummary, CarrierType } from "@/modules/shipping/domain/types";

const SAMPLE_MANIFESTS: ShippingManifest[] = [
  {
    id: "shp_yorkstead_088",
    organizationId: "org_yorkstead_systems",
    manifestNumber: "SHP-2026-088",
    carrierType: "ltl_freight",
    carrierName: "Old Dominion Freight Line",
    trackingOrProNumber: "ODFL-982341109",
    driverName: "Hank Kowalski",
    trailerOrPlateNumber: "TR-8814",
    stops: [
      {
        stopSequence: 1,
        destinationCustomerName: "Alpine Aerospace Systems",
        destinationAddress: "1200 Space Technology Blvd, Longmont, CO 80501",
        packageNumbers: ["PKG-2026-042"],
        contactPerson: "Marcus Vance (Receiving Lead)",
        contactPhone: "(303) 555-0192",
        deliveryNotes: "Dock #3. First article paperwork and Certificate of Conformance included.",
        status: "delivered",
        signedBy: "M. Vance",
        deliveredAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
    ],
    packageNumbers: ["PKG-2026-042"],
    totalPackages: 1,
    totalGrossWeightLbs: 405.0,
    status: "delivered",
    billOfLadingBarcode: "BOL-2026-088-YS",
    dispatchedAt: new Date(Date.now() - 86400000).toISOString(),
    dispatchedByUserId: "usr_brandon_operator",
    dispatchedByName: "Brandon",
    deliveredAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "shp_yorkstead_089",
    organizationId: "org_yorkstead_systems",
    manifestNumber: "SHP-2026-089",
    carrierType: "hotshot_courier",
    carrierName: "Front Range Express Logistics",
    trackingOrProNumber: "FREX-44019",
    driverName: "Elena Gomez",
    trailerOrPlateNumber: "VAN-2201",
    stops: [
      {
        stopSequence: 1,
        destinationCustomerName: "Summit Architectural Glass",
        destinationAddress: "4820 Valmont Rd, Boulder, CO 80301",
        packageNumbers: ["PKG-2026-043"],
        contactPerson: "Elena Gomez (Site Supervisor)",
        contactPhone: "(303) 555-0144",
        deliveryNotes: "Deliver to Contractor Gate B. Side-door fork unload.",
        status: "pending",
      },
    ],
    packageNumbers: ["PKG-2026-043"],
    totalPackages: 1,
    totalGrossWeightLbs: 123.5,
    status: "staged_for_loading",
    billOfLadingBarcode: "BOL-2026-089-YS",
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];

const SAMPLE_SHIP_METRICS: ShippingMetricsSummary = {
  activeShipmentsCount: 1,
  shipmentsDeliveredCount: 1,
  totalWeightInTransitLbs: 123.5,
  onTimeDeliveryPercentage: 98.4,
};

export function ShippingWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [manifests, setManifests] = React.useState<ShippingManifest[]>(SAMPLE_MANIFESTS);
  const [metrics, setMetrics] = React.useState<ShippingMetricsSummary>(SAMPLE_SHIP_METRICS);

  // Modal State
  const [createBolOpen, setCreateBolOpen] = React.useState(false);
  const [carrierType, setCarrierType] = React.useState<CarrierType>("ltl_freight");
  const [carrierName, setCarrierName] = React.useState("Old Dominion Freight Line");
  const [customerName, setCustomerName] = React.useState("Alpine Aerospace Systems");
  const [address, setAddress] = React.useState("7420 Innovation Way, Longmont, CO 80503");
  const [pkgNumber, setPkgNumber] = React.useState("PKG-2026-081");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchShippingData = React.useCallback(async () => {
    try {
      const [manRes, metricsRes] = await Promise.all([
        fetch("/api/shipping/manifests"),
        fetch("/api/shipping/metrics"),
      ]);

      if (manRes.ok) {
        const data = await manRes.json();
        if (data.manifests && data.manifests.length > 0) setManifests(data.manifests);
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      // Keep sample shipping state
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchShippingData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchShippingData]);

  const handleDispatch = async (manifestNumber: string) => {
    try {
      const res = await fetch(`/api/shipping/manifests/${manifestNumber}/dispatch`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to dispatch manifest");
      }
      setFeedback({ type: "success", message: `Manifest ${manifestNumber} dispatched in transit.` });
      fetchShippingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Dispatch failed" });
    }
  };

  const handleConfirmDelivery = async (manifestNumber: string) => {
    try {
      const res = await fetch(`/api/shipping/manifests/${manifestNumber}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stopSequence: 1,
          signedBy: "Receiving Dock Mgr: A. Smith",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to confirm delivery");
      }
      setFeedback({ type: "success", message: `Proof of Delivery (POD) confirmed for ${manifestNumber}.` });
      fetchShippingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Delivery confirmation failed" });
    }
  };

  const handleCreateManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/shipping/manifests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrierType,
          carrierName,
          stops: [
            {
              stopSequence: 1,
              destinationCustomerName: customerName,
              destinationAddress: address,
              packageNumbers: [pkgNumber],
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create manifest");
      }

      const data = await res.json();
      // Assign package
      await fetch(`/api/shipping/manifests/${data.manifest.manifestNumber}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageNumbers: [pkgNumber],
          weightPerPkgLbs: 45.0,
        }),
      });

      setFeedback({ type: "success", message: `Bill of Lading ${data.manifest.manifestNumber} created and staged.` });
      setCreateBolOpen(false);
      fetchShippingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Manifest creation failed" });
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
            <Badge variant="default">LOGISTICS//SHIPPING</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Outbound Manifest & Proof of Delivery
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Shipping & Outbound Logistics
          </h1>
          <p className="text-sm text-muted-foreground">
            Bill of Lading manifests, multi-stop routes, driver dispatching, and digital POD sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={() => setCreateBolOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Create Bill of Lading
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Active Shipments</span>
            <Truck className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.activeShipmentsCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Delivered Shipments</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.shipmentsDeliveredCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Weight in Transit</span>
            <Truck className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            {metrics.totalWeightInTransitLbs.toLocaleString(undefined, { minimumFractionDigits: 1 })} lbs
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">On-Time Performance</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.onTimeDeliveryPercentage}%</p>
        </Card>
      </div>

      {/* Manifests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Truck className="size-5" />
            <CardTitle className="text-base">Outbound Shipping Manifests</CardTitle>
          </div>
          <CardDescription>Bill of Lading registry, driver dispatch stamps, and customer proof-of-delivery.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex min-h-[25vh] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading shipping manifests...</span>
              </div>
            </div>
          ) : manifests.length === 0 ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
              <Truck className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">Zero Shipping Manifests</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Create bill of lading manifests to dispatch sealed packages and pallets to customers.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {manifests.map((m) => (
                <div key={m.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{m.manifestNumber}</span>
                      <Badge variant="outline" className="font-mono text-[9px] uppercase">
                        {m.carrierName}
                      </Badge>
                      <Badge
                        variant={m.status === "delivered" ? "default" : "outline"}
                        className="font-mono text-[9px] uppercase"
                      >
                        {m.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      Destination: {m.stops.map((s) => `${s.destinationCustomerName} (${s.destinationAddress})`).join(", ")}
                    </p>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                      <span>Packages: {m.packageNumbers.join(", ") || "None staged"}</span>
                      <span>&bull;</span>
                      <span>Gross Weight: {m.totalGrossWeightLbs} lbs</span>
                      <span>&bull;</span>
                      <span>PRO / Tracking: {m.trackingOrProNumber}</span>
                      {m.driverName && (
                        <>
                          <span>&bull;</span>
                          <span>Driver: {m.driverName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {m.status === "staged_for_loading" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDispatch(m.manifestNumber)}
                        className="font-mono text-xs"
                      >
                        <Send className="mr-1.5 size-3.5" />
                        Dispatch Shipment
                      </Button>
                    )}
                    {m.status === "dispatched_in_transit" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleConfirmDelivery(m.manifestNumber)}
                        className="font-mono text-xs"
                      >
                        <CheckCircle2 className="mr-1.5 size-3.5" />
                        Confirm Delivery (POD)
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create BOL Modal */}
      {createBolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Create Bill of Lading (BOL)</h2>
              <Button variant="ghost" size="sm" onClick={() => setCreateBolOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateManifest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Carrier Type</label>
                  <select
                    value={carrierType}
                    onChange={(e) => setCarrierType(e.target.value as CarrierType)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="ltl_freight">LTL Freight</option>
                    <option value="dedicated_flatbed">Dedicated Flatbed</option>
                    <option value="parcel_express">Parcel Express</option>
                    <option value="customer_will_call">Customer Will Call</option>
                    <option value="hotshot_courier">Hotshot Courier</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Carrier Name</label>
                  <input
                    type="text"
                    required
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Customer Destination</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Package Number / Container SKU</label>
                <input
                  type="text"
                  required
                  value={pkgNumber}
                  onChange={(e) => setPkgNumber(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateBolOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Generating..." : "Generate Bill of Lading"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
