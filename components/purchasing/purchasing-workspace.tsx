'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle2, AlertTriangle, Plus, DollarSign, X, ArrowUpRight } from "lucide-react";
import { PurchaseOrder, PurchasingMetricsSummary, MaterialShortageSignal } from "@/modules/purchasing/domain/types";

const SAMPLE_POS: PurchaseOrder[] = [
  {
    id: "po_yorkstead_042",
    organizationId: "org_yorkstead_systems",
    poNumber: "PO-2026-042",
    vendorId: "vend_yorkstead_apex",
    vendorName: "Apex Raw Materials & Mill Supply",
    vendorEmail: "orders@apexrawmaterials.com",
    status: "received_complete",
    lineItems: [
      {
        id: "poli_1",
        lineNumber: 1,
        itemCode: "MAT-AL-5052-090",
        description: "5052-H32 Aluminum Sheet 0.090in x 48in x 96in with Certified MTR",
        quantityOrdered: 8,
        quantityReceived: 8,
        uom: "SHEET",
        unitCostCents: 48000,
        totalCostCents: 384000,
        linkedJobId: "job_yorkstead_104",
        linkedJobNumber: "JOB-2026-104",
      },
    ],
    subtotalCostCents: 384000,
    shippingCostCents: 15000,
    taxCostCents: 0,
    totalCostCents: 399000,
    approvalThresholdCents: 500000,
    requiresManagerApproval: false,
    approvedByUserId: "usr_brandon_operator",
    approvedByName: "Brandon",
    approvedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    expectedDeliveryDate: "2026-08-25",
    issuedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "po_yorkstead_043",
    organizationId: "org_yorkstead_systems",
    poNumber: "PO-2026-043",
    vendorId: "vend_yorkstead_rocky",
    vendorName: "Rocky Mountain Fasteners & Hardware",
    vendorEmail: "sales@rockymountainfasteners.com",
    status: "sent_to_vendor",
    lineItems: [
      {
        id: "poli_2",
        lineNumber: 1,
        itemCode: "HRD-PEM-M4-12",
        description: "M4-0.7 Clinch Studs 12mm Zinc-Plated Steel (Pack of 1000)",
        quantityOrdered: 4,
        quantityReceived: 0,
        uom: "BOX",
        unitCostCents: 18000,
        totalCostCents: 72000,
        linkedJobId: "job_yorkstead_105",
        linkedJobNumber: "JOB-2026-105",
      },
    ],
    subtotalCostCents: 72000,
    shippingCostCents: 2500,
    taxCostCents: 0,
    totalCostCents: 74500,
    approvalThresholdCents: 500000,
    requiresManagerApproval: false,
    approvedByUserId: "usr_brandon_operator",
    approvedByName: "Brandon",
    approvedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expectedDeliveryDate: "2026-09-03",
    issuedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SAMPLE_SHORTAGES: MaterialShortageSignal[] = [
  {
    id: "sh_1",
    jobId: "job_yorkstead_106",
    jobNumber: "JOB-2026-106",
    itemCode: "MAT-SS-304-060",
    description: "304-2B Stainless Steel Sheet 0.060in x 48in x 120in",
    requiredQuantity: 6,
    onHandQuantity: 2,
    shortageQuantity: 4,
    uom: "SHEET",
    neededByDate: "2026-09-10",
    urgency: "critical_line_down",
  },
];

const SAMPLE_PURCH_METRICS: PurchasingMetricsSummary = {
  activePurchaseOrdersCount: 2,
  openShortagesCount: 1,
  totalOpenCommittedSpendCents: 473500,
  onTimeSupplierDeliveryPercentage: 98.2,
};

export function PurchasingWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>(SAMPLE_POS);
  const [shortages, setShortages] = React.useState<MaterialShortageSignal[]>(SAMPLE_SHORTAGES);
  const [metrics, setMetrics] = React.useState<PurchasingMetricsSummary>(SAMPLE_PURCH_METRICS);

  // Modal State
  const [createPoOpen, setCreatePoOpen] = React.useState(false);
  const [vendorName, setVendorName] = React.useState("Apex Raw Materials & Mill Supply");
  const [vendorEmail, setVendorEmail] = React.useState("orders@apexrawmaterials.com");
  const [itemCode, setItemCode] = React.useState("MAT-SS-304-060");
  const [itemDesc, setItemDesc] = React.useState("304-2B Stainless Steel Sheet 0.060in x 48in x 120in");
  const [qty, setQty] = React.useState(6);
  const [unitCost, setUnitCost] = React.useState("95.00");
  const [deliveryDate, setDeliveryDate] = React.useState("2026-09-08");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchPurchasingData = React.useCallback(async () => {
    try {
      const [poRes, shRes, metricsRes] = await Promise.all([
        fetch("/api/purchasing/orders"),
        fetch("/api/purchasing/shortages"),
        fetch("/api/purchasing/metrics"),
      ]);

      if (poRes.ok) {
        const data = await poRes.json();
        if (data.purchaseOrders && data.purchaseOrders.length > 0) setPurchaseOrders(data.purchaseOrders);
      }
      if (shRes.ok) {
        const data = await shRes.json();
        if (data.shortages && data.shortages.length > 0) setShortages(data.shortages);
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      // Keep sample purchasing state
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchPurchasingData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchPurchasingData]);

  const handleApprovePO = async (poNumber: string) => {
    try {
      const res = await fetch(`/api/purchasing/orders/${poNumber}/approve`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve PO");
      }
      setFeedback({ type: "success", message: `Purchase Order ${poNumber} approved by manager.` });
      fetchPurchasingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Approval failed" });
    }
  };

  const handleIssuePO = async (poNumber: string) => {
    try {
      const res = await fetch(`/api/purchasing/orders/${poNumber}/issue`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to issue PO");
      }
      setFeedback({ type: "success", message: `Purchase Order ${poNumber} transmitted to vendor.` });
      fetchPurchasingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Issue failed" });
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const unitCostCents = Math.round(parseFloat(unitCost || "0") * 100);
      const res = await fetch("/api/purchasing/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: "vend_ryerson",
          vendorName,
          vendorEmail,
          expectedDeliveryDate: deliveryDate,
          lineItems: [
            {
              itemCode,
              description: itemDesc,
              quantityOrdered: qty,
              uom: "SHEET",
              unitCostCents,
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create PO");
      }

      setFeedback({ type: "success", message: `Purchase order created successfully.` });
      setCreatePoOpen(false);
      fetchPurchasingData();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Creation failed" });
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
            <Badge variant="default">OPERATIONS//PURCHASING</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Material Sourcing & Spend Control
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Purchasing & Material Sourcing
          </h1>
          <p className="text-sm text-muted-foreground">
            Vendor commitments, $5,000 manager approval thresholds, and automated dock receiving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" onClick={() => setCreatePoOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Create Purchase Order
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
            <span className="font-mono text-xs text-muted-foreground">Active Committed Spend</span>
            <DollarSign className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            ${(metrics.totalOpenCommittedSpendCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Active Purchase Orders</span>
            <ShoppingCart className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.activePurchaseOrdersCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Open Material Shortages</span>
            <AlertTriangle className="size-4 text-destructive" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-destructive">{metrics.openShortagesCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Supplier On-Time Delivery</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.onTimeSupplierDeliveryPercentage}%</p>
        </Card>
      </div>

      {/* Shortages Alert Section */}
      {shortages.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="size-5" />
              <CardTitle className="text-base">Active Material Shortage Signals</CardTitle>
            </div>
            <CardDescription>Scheduled jobs waiting on vendor raw stock commitments.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              {shortages.map((s) => (
                <div key={s.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400 uppercase text-[9px]">
                      {s.urgency}
                    </Badge>
                    <span className="font-bold text-foreground">{s.itemCode}</span>
                    <span className="text-muted-foreground">{s.description}</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Shortage: <strong className="text-destructive font-bold">{s.shortageQuantity} {s.uom}</strong></span>
                    <span>Needed By: {s.neededByDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShoppingCart className="size-5" />
            <CardTitle className="text-base">Purchase Orders & Material Receipts</CardTitle>
          </div>
          <CardDescription>AS9100 material traceability, vendor spend controls, and receiving log.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex min-h-[25vh] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading purchasing ledger...</span>
              </div>
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">Zero Purchase Orders</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Create purchase orders to procure raw stock and hardware from approved vendors.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{po.poNumber}</span>
                      <Badge variant="outline" className="font-mono text-[9px] uppercase">
                        {po.vendorName}
                      </Badge>
                      <Badge
                        variant={po.status === "received_complete" ? "default" : "outline"}
                        className={`font-mono text-[9px] uppercase ${
                          po.status === "pending_approval" ? "border-destructive text-destructive" : ""
                        }`}
                      >
                        {po.status.replace(/_/g, " ")}
                      </Badge>
                      {po.requiresManagerApproval && po.status === "pending_approval" && (
                        <Badge variant="outline" className="font-mono text-[9px] uppercase border-destructive text-destructive">
                          Spend &gt; $5k Approval Required
                        </Badge>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {po.lineItems.map((l) => `${l.quantityOrdered}x ${l.itemCode}`).join(", ")}
                    </p>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                      <span>Total: <strong className="text-foreground">${(po.totalCostCents / 100).toFixed(2)}</strong></span>
                      <span>&bull;</span>
                      <span>Expected: {po.expectedDeliveryDate}</span>
                      {po.approvedByName && (
                        <>
                          <span>&bull;</span>
                          <span>Approved By: {po.approvedByName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {po.status === "pending_approval" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApprovePO(po.poNumber)}
                        className="font-mono text-xs"
                      >
                        <CheckCircle2 className="mr-1.5 size-3.5" />
                        Approve PO
                      </Button>
                    )}
                    {po.status === "approved" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleIssuePO(po.poNumber)}
                        className="font-mono text-xs"
                      >
                        <ArrowUpRight className="mr-1.5 size-3.5" />
                        Issue to Vendor
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create PO Modal */}
      {createPoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Create Purchase Order</h2>
              <Button variant="ghost" size="sm" onClick={() => setCreatePoOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleCreatePO} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Vendor Email</label>
                  <input
                    type="email"
                    required
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Item SKU</label>
                <input
                  type="text"
                  required
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Description</label>
                <input
                  type="text"
                  required
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value, 10))}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Unit Cost ($)</label>
                  <input
                    type="text"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Expected Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreatePoOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Purchase Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
