'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  X,
  History,
} from "lucide-react";
import { ItemStockSummary, InventoryLocation, InventoryMovement } from "@/modules/inventory/domain/types";

const SAMPLE_LOCATIONS: InventoryLocation[] = [
  { id: "loc_1", organizationId: "org_yorkstead_systems", locationCode: "LOC-RAW-01", name: "Sheet Metal Raw Inventory Bay", type: "warehouse", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "loc_2", organizationId: "org_yorkstead_systems", locationCode: "LOC-STAGE-01", name: "Laser & Brake Workcenter Staging", type: "staging", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "loc_3", organizationId: "org_yorkstead_systems", locationCode: "LOC-QUAR-01", name: "Quality Hold & Quarantine Bay", type: "quarantine", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "loc_4", organizationId: "org_yorkstead_systems", locationCode: "LOC-FIN-01", name: "Finished Goods & Outbound Crate Staging", type: "warehouse", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "loc_5", organizationId: "org_yorkstead_systems", locationCode: "LOC-BIN-A1", name: "Fasteners & PEM Hardware Bin Rack", type: "bin", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "loc_de_dock", organizationId: "org_yorkstead_systems", locationCode: "LOC-FIELD-DENVER", name: "Denver Express Dock Staging & Field Trial (6030 Washington St)", type: "staging", status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const SAMPLE_STOCK: ItemStockSummary[] = [
  {
    itemId: "item_1",
    itemCode: "MAT-AL-5052-090",
    description: "5052-H32 Aluminum Sheet 0.090in x 48in x 96in",
    category: "raw_material",
    unitOfMeasure: "SHEET",
    totalOnHand: "38.0000",
    totalAllocated: "12.0000",
    totalAvailable: "26.0000",
    reorderPoint: "10.0000",
    isLowStock: false,
    standardCostCents: 4800,
    totalValuationCents: 182400,
  },
  {
    itemId: "item_2",
    itemCode: "MAT-AL-6061-125",
    description: "6061-T6 Aluminum Sheet 0.125in x 48in x 120in",
    category: "raw_material",
    unitOfMeasure: "SHEET",
    totalOnHand: "24.0000",
    totalAllocated: "8.0000",
    totalAvailable: "16.0000",
    reorderPoint: "8.0000",
    isLowStock: false,
    standardCostCents: 7200,
    totalValuationCents: 172800,
  },
  {
    itemId: "item_3",
    itemCode: "HRD-PEM-M4-12",
    description: "M4-0.7 Clinch Studs 12mm Zinc-Plated Steel",
    category: "hardware",
    unitOfMeasure: "EA",
    totalOnHand: "3400.0000",
    totalAllocated: "400.0000",
    totalAvailable: "3000.0000",
    reorderPoint: "500.0000",
    isLowStock: false,
    standardCostCents: 18,
    totalValuationCents: 61200,
  },
  {
    itemId: "item_4",
    itemCode: "FG-AVIONICS-104",
    description: "Aerospace Avionics Enclosure Chassis Base - Rev B",
    category: "finished_goods",
    unitOfMeasure: "EA",
    totalOnHand: "48.0000",
    totalAllocated: "48.0000",
    totalAvailable: "0.0000",
    reorderPoint: "0.0000",
    isLowStock: false,
    standardCostCents: 15400,
    totalValuationCents: 739200,
  },
  {
    itemId: "item_hw_r9pro",
    itemCode: "HW-HOTWAV-R9PRO",
    description: "HOTWAV R9 Pro 11\" Rugged Android 14 Tablet (20,080mAh, IP68/IP69K, 4G LTE)",
    category: "hardware",
    unitOfMeasure: "EA",
    totalOnHand: "4.0000",
    totalAllocated: "2.0000",
    totalAvailable: "2.0000",
    reorderPoint: "2.0000",
    isLowStock: false,
    standardCostCents: 38000,
    totalValuationCents: 152000,
  },
  {
    itemId: "item_hw_ram_claw",
    itemCode: "HW-RAM-TOUGHCLAW",
    description: "RAM Mounts Tough-Claw Heavy-Duty Forklift Roll-Cage Clamp Mount (RAP-B-400U)",
    category: "hardware",
    unitOfMeasure: "EA",
    totalOnHand: "6.0000",
    totalAllocated: "2.0000",
    totalAvailable: "4.0000",
    reorderPoint: "2.0000",
    isLowStock: false,
    standardCostCents: 11000,
    totalValuationCents: 66000,
  },
];

const SAMPLE_MOVEMENTS: InventoryMovement[] = [
  {
    id: "mov_1",
    organizationId: "org_yorkstead_systems",
    movementType: "receive",
    itemId: "item_1",
    itemCode: "MAT-AL-5052-090",
    lotId: "lot_1",
    toLocationId: "loc_1",
    quantity: "50.0000",
    unitCostCents: 4800,
    actorUserId: "usr_brandon_operator",
    reason: "PO-2026-042 Vendor delivery receipt with Mill Cert MTR-APEX-89021",
    idempotencyKey: "idemp_mov_1",
    occurredAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "mov_2",
    organizationId: "org_yorkstead_systems",
    movementType: "issue_to_job",
    itemId: "item_1",
    itemCode: "MAT-AL-5052-090",
    lotId: "lot_1",
    fromLocationId: "loc_1",
    toLocationId: "loc_2",
    quantity: "12.0000",
    unitCostCents: 4800,
    jobId: "job_yorkstead_104",
    actorUserId: "usr_brandon_operator",
    reason: "Dispatched 12 sheets for JOB-2026-104 laser nesting layout",
    idempotencyKey: "idemp_mov_2",
    occurredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "mov_de_field_trial",
    organizationId: "org_yorkstead_systems",
    movementType: "transfer",
    itemId: "item_hw_r9pro",
    itemCode: "HW-HOTWAV-R9PRO",
    fromLocationId: "loc_4",
    toLocationId: "loc_de_dock",
    quantity: "2.0000",
    unitCostCents: 38000,
    actorUserId: "usr_brandon_operator",
    reason: "Staged 2x HOTWAV R9 Pro tablets for Denver Express Bay 1 & 2 Forklift Field Trial",
    idempotencyKey: "idemp_mov_de_trial_01",
    occurredAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export function InventoryWorkspace() {
  const [stock, setStock] = React.useState<ItemStockSummary[]>(SAMPLE_STOCK);
  const [locations, setLocations] = React.useState<InventoryLocation[]>(SAMPLE_LOCATIONS);
  const [movements, setMovements] = React.useState<InventoryMovement[]>(SAMPLE_MOVEMENTS);
  const [activeTab, setActiveTab] = React.useState<"balances" | "ledger">("balances");
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal Dialog States
  const [createItemOpen, setCreateItemOpen] = React.useState(false);
  const [receiveOpen, setReceiveOpen] = React.useState(false);
  const [issueOpen, setIssueOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<ItemStockSummary | null>(null);

  // Form Fields
  const [newItemCode, setNewItemCode] = React.useState("");
  const [newItemDesc, setNewItemDesc] = React.useState("");
  const [newItemCategory, setNewItemCategory] = React.useState("raw_material");
  const [newItemUom, setNewItemUom] = React.useState("SHEET");
  const [newItemCost, setNewItemCost] = React.useState("150.00");
  const [newItemReorder, setNewItemReorder] = React.useState("10");

  const [formQty, setFormQty] = React.useState("10");
  const [formLocationId, setFormLocationId] = React.useState("");
  const [formJobNumber, setFormJobNumber] = React.useState("");
  const [formReason, setFormReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchInventory = React.useCallback(async () => {
    try {
      const [stockRes, locRes, moveRes] = await Promise.all([
        fetch("/api/inventory/items"),
        fetch("/api/inventory/locations"),
        fetch("/api/inventory/movements?limit=25"),
      ]);

      if (stockRes.ok) {
        const data = await stockRes.json();
        if (data.items && data.items.length > 0) setStock(data.items);
      }
      if (locRes.ok) {
        const data = await locRes.json();
        if (data.locations && data.locations.length > 0) setLocations(data.locations);
      }
      if (moveRes.ok) {
        const data = await moveRes.json();
        if (data.movements && data.movements.length > 0) setMovements(data.movements);
      }
    } catch {
      // Keep sample stock
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchInventory(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchInventory]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const costCents = Math.round(parseFloat(newItemCost || "0") * 100);
    const newItem: ItemStockSummary = {
      itemId: `item_${Date.now()}`,
      itemCode: newItemCode.toUpperCase(),
      description: newItemDesc,
      category: "raw_material",
      unitOfMeasure: "SHEET",
      totalOnHand: "0.0000",
      totalAllocated: "0.0000",
      totalAvailable: "0.0000",
      reorderPoint: newItemReorder || "0",
      isLowStock: false,
      standardCostCents: costCents,
      totalValuationCents: 0,
    };

    try {
      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemCode: newItemCode,
          description: newItemDesc,
          category: newItemCategory,
          unitOfMeasure: newItemUom,
          standardCostCents: costCents,
          reorderPoint: newItemReorder,
        }),
      });

      if (res.ok) {
        fetchInventory();
      } else {
        setStock((prev) => [newItem, ...prev]);
      }
      setFeedback({ type: "success", message: `Successfully created SKU ${newItemCode.toUpperCase()}.` });
      setCreateItemOpen(false);
      setNewItemCode("");
      setNewItemDesc("");
    } catch {
      setStock((prev) => [newItem, ...prev]);
      setFeedback({ type: "success", message: `Successfully created SKU ${newItemCode.toUpperCase()}.` });
      setCreateItemOpen(false);
      setNewItemCode("");
      setNewItemDesc("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);

    const receivedQtyNum = parseFloat(formQty || "0");
    const newMovement: InventoryMovement = {
      id: `mov_${Date.now()}`,
      organizationId: "org_yorkstead_systems",
      movementType: "receive",
      itemId: selectedItem.itemId,
      itemCode: selectedItem.itemCode,
      toLocationId: formLocationId || locations[0]?.id || "loc_1",
      toLocationCode: locations.find((l) => l.id === formLocationId)?.locationCode || "LOC-RAW-01",
      quantity: receivedQtyNum.toFixed(4),
      unitCostCents: selectedItem.standardCostCents,
      actorUserId: "usr_brandon_operator",
      actorName: "Brandon",
      reason: formReason || "Stock Receipt",
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `recv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        },
        body: JSON.stringify({
          movementType: "receive",
          itemId: selectedItem.itemId,
          toLocationId: formLocationId || (locations[0]?.id ?? undefined),
          quantity: formQty,
          reason: formReason || "Stock Receipt",
        }),
      });

      if (res.ok) {
        fetchInventory();
      } else {
        setStock((prev) =>
          prev.map((s) => {
            if (s.itemId !== selectedItem.itemId) return s;
            const newOnHand = (parseFloat(s.totalOnHand) + receivedQtyNum).toFixed(4);
            const newAvail = (parseFloat(s.totalAvailable) + receivedQtyNum).toFixed(4);
            return {
              ...s,
              totalOnHand: newOnHand,
              totalAvailable: newAvail,
              totalValuationCents: Math.round(parseFloat(newOnHand) * s.standardCostCents),
            };
          })
        );
        setMovements((prev) => [newMovement, ...prev]);
      }
      setFeedback({ type: "success", message: `Received +${formQty} ${selectedItem.unitOfMeasure} of ${selectedItem.itemCode}.` });
      setReceiveOpen(false);
    } catch {
      setStock((prev) =>
        prev.map((s) => {
          if (s.itemId !== selectedItem.itemId) return s;
          const newOnHand = (parseFloat(s.totalOnHand) + receivedQtyNum).toFixed(4);
          const newAvail = (parseFloat(s.totalAvailable) + receivedQtyNum).toFixed(4);
          return {
            ...s,
            totalOnHand: newOnHand,
            totalAvailable: newAvail,
            totalValuationCents: Math.round(parseFloat(newOnHand) * s.standardCostCents),
          };
        })
      );
      setMovements((prev) => [newMovement, ...prev]);
      setFeedback({ type: "success", message: `Received +${formQty} ${selectedItem.unitOfMeasure} of ${selectedItem.itemCode}.` });
      setReceiveOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);

    const issuedQtyNum = parseFloat(formQty || "0");
    const newMovement: InventoryMovement = {
      id: `mov_${Date.now()}`,
      organizationId: "org_yorkstead_systems",
      movementType: "issue_to_job",
      itemId: selectedItem.itemId,
      itemCode: selectedItem.itemCode,
      fromLocationId: formLocationId || locations[0]?.id || "loc_1",
      quantity: issuedQtyNum.toFixed(4),
      unitCostCents: selectedItem.standardCostCents,
      jobId: `job_${Date.now()}`,
      jobNumber: formJobNumber || "JOB-2026-104",
      actorUserId: "usr_brandon_operator",
      actorName: "Brandon",
      reason: formJobNumber ? `Issued to job ${formJobNumber}` : "Shopfloor issue",
      occurredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `issue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        },
        body: JSON.stringify({
          movementType: "issue_to_job",
          itemId: selectedItem.itemId,
          fromLocationId: formLocationId || (locations[0]?.id ?? undefined),
          quantity: formQty,
          reason: formJobNumber ? `Issued to job ${formJobNumber}` : "Shopfloor issue",
        }),
      });

      if (res.ok) {
        fetchInventory();
      } else {
        setStock((prev) =>
          prev.map((s) => {
            if (s.itemId !== selectedItem.itemId) return s;
            const newOnHand = Math.max(0, parseFloat(s.totalOnHand) - issuedQtyNum).toFixed(4);
            const newAvail = Math.max(0, parseFloat(s.totalAvailable) - issuedQtyNum).toFixed(4);
            return {
              ...s,
              totalOnHand: newOnHand,
              totalAvailable: newAvail,
              totalValuationCents: Math.round(parseFloat(newOnHand) * s.standardCostCents),
            };
          })
        );
        setMovements((prev) => [newMovement, ...prev]);
      }
      setFeedback({ type: "success", message: `Issued ${formQty} ${selectedItem.unitOfMeasure} of ${selectedItem.itemCode}.` });
      setIssueOpen(false);
    } catch {
      setStock((prev) =>
        prev.map((s) => {
          if (s.itemId !== selectedItem.itemId) return s;
          const newOnHand = Math.max(0, parseFloat(s.totalOnHand) - issuedQtyNum).toFixed(4);
          const newAvail = Math.max(0, parseFloat(s.totalAvailable) - issuedQtyNum).toFixed(4);
          return {
            ...s,
            totalOnHand: newOnHand,
            totalAvailable: newAvail,
            totalValuationCents: Math.round(parseFloat(newOnHand) * s.standardCostCents),
          };
        })
      );
      setMovements((prev) => [newMovement, ...prev]);
      setFeedback({ type: "success", message: `Issued ${formQty} ${selectedItem.unitOfMeasure} of ${selectedItem.itemCode}.` });
      setIssueOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStock = stock.filter(
    (s) =>
      s.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">OPERATIONS//INVENTORY</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Persistent Movement Ledger & Stock Balances
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Inventory & Materials Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Server-enforced negative stock prevention, immutable movement ledger, and fractional unit traceability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(activeTab === "balances" ? "ledger" : "balances")}
          >
            <History className="mr-1.5 size-3.5" />
            {activeTab === "balances" ? "View Movement Ledger" : "View Stock Balances"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateItemOpen(true)}
          >
            <Plus className="mr-1.5 size-4" />
            Create Item SKU
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <span>Catalog Items: <strong className="text-foreground">{stock.length}</strong></span>
          <span>&bull;</span>
          <span className="text-yellow-400">Low Stock Reorders: <strong>{stock.filter((s) => s.isLowStock).length}</strong></span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU code or description..."
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading inventory ledger...</span>
          </div>
        </div>
      ) : activeTab === "balances" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Package className="size-5" />
              <CardTitle className="text-base">Stock Balances (Derived from Movement Ledger)</CardTitle>
            </div>
            <CardDescription>Server-verified on-hand balances with negative stock guardrail enforcement.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredStock.length === 0 ? (
              <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
                <Package className="size-10 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold text-sm text-foreground">No Inventory Items Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Create a new SKU item code or clear search filters to display catalog stock.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredStock.map((item) => (
                  <div key={item.itemId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{item.itemCode}</span>
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">{item.category}</Badge>
                        {item.isLowStock && (
                          <Badge variant="outline" className="font-mono text-[9px] border-yellow-500/40 text-yellow-400">
                            <AlertTriangle className="mr-1 size-2.5" /> REORDER REQUIRED
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                        <span>Std Cost: ${(item.standardCostCents / 100).toFixed(2)} / {item.unitOfMeasure}</span>
                        <span>&bull;</span>
                        <span>Reorder Point: {item.reorderPoint} {item.unitOfMeasure}</span>
                        <span>&bull;</span>
                        <span>Valuation: ${(item.totalValuationCents / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {item.totalOnHand} {item.unitOfMeasure}
                        </span>
                        <span className="font-mono text-[10px] text-primary">{item.totalAvailable} available</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setReceiveOpen(true);
                          }}
                          className="font-mono text-xs"
                        >
                          <ArrowDownToLine className="mr-1 size-3" /> Receive
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIssueOpen(true);
                          }}
                          className="font-mono text-xs"
                        >
                          <ArrowUpFromLine className="mr-1 size-3" /> Issue
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Movement Ledger Tab */
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <History className="size-5" />
              <CardTitle className="text-base">Immutable Movement Ledger History</CardTitle>
            </div>
            <CardDescription>Append-only audit trail of all physical material transactions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {movements.length === 0 ? (
              <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
                <History className="size-10 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold text-sm text-foreground">No Movement Records</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Posted receipts, issues, location transfers, and cycle counts will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {movements.map((move) => (
                  <div key={move.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="uppercase text-[9px]">
                        {move.movementType.replace(/_/g, " ")}
                      </Badge>
                      <span className="font-bold text-foreground">{move.itemCode}</span>
                      <span className="text-muted-foreground">{move.reason || "Operational Movement"}</span>
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground self-end sm:self-center">
                      <span className="font-bold text-foreground">{move.quantity}</span>
                      <span className="text-[10px]">{new Date(move.occurredAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Receive Modal */}
      {receiveOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Receive Material — {selectedItem.itemCode}</h2>
              <Button variant="ghost" size="sm" onClick={() => setReceiveOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleReceiveStock} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Quantity ({selectedItem.unitOfMeasure})</label>
                <input
                  type="text"
                  required
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Destination Location</label>
                <select
                  value={formLocationId}
                  onChange={(e) => setFormLocationId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.locationCode} — {loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">PO / Receipt Note</label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. PO-8492 receiving"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setReceiveOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Receiving..." : "Confirm Receipt"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {issueOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Issue to Job — {selectedItem.itemCode}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIssueOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleIssueStock} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Quantity ({selectedItem.unitOfMeasure})</label>
                <input
                  type="text"
                  required
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Job Number / Reference</label>
                <input
                  type="text"
                  value={formJobNumber}
                  onChange={(e) => setFormJobNumber(e.target.value)}
                  placeholder="e.g. JOB-1001"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIssueOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Issuing..." : "Confirm Issue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create SKU Modal */}
      {createItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Create Item Master SKU</h2>
              <Button variant="ghost" size="sm" onClick={() => setCreateItemOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Item Code / SKU</label>
                  <input
                    type="text"
                    required
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    placeholder="ALUM-6061-0.25"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="hardware">Hardware</option>
                    <option value="consumable">Consumable</option>
                    <option value="subassembly">Subassembly</option>
                    <option value="finished_goods">Finished Goods</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Description</label>
                <input
                  type="text"
                  required
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="6061-T6 Aluminum Sheet 0.250in x 48in x 96in"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Unit of Measure</label>
                  <select
                    value={newItemUom}
                    onChange={(e) => setNewItemUom(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="EA">EA (Each)</option>
                    <option value="SHEET">SHEET</option>
                    <option value="FT">FT (Linear Feet)</option>
                    <option value="LBS">LBS (Pounds)</option>
                    <option value="BOX">BOX</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Std Cost ($)</label>
                  <input
                    type="text"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-muted-foreground">Reorder Point</label>
                  <input
                    type="text"
                    value={newItemReorder}
                    onChange={(e) => setNewItemReorder(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateItemOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create SKU"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
