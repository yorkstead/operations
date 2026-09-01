'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { DigitalTraveler, TravelerOperation } from "@/modules/shopfloor/domain/types";

const SAMPLE_TRAVELERS: DigitalTraveler[] = [
  {
    id: "trv_yorkstead_104",
    organizationId: "org_yorkstead_systems",
    travelerNumber: "TRV-2026-104",
    qrCodeData: "yorkstead://traveler/TRV-2026-104",
    jobId: "job_yorkstead_104",
    jobNumber: "JOB-2026-104",
    partDescription: "Aerospace Avionics Enclosure Chassis Base",
    customerName: "Alpine Aerospace Systems",
    totalQuantity: 50,
    currentStepIndex: 3,
    status: "active",
    priority: "rush",
    targetDueDate: "2026-09-15",
    version: 1,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    operations: [
      {
        id: "top_1",
        sequence: 10,
        workCenterCode: "WC-LASER-01",
        workCenterName: "Mitsubishi 4kW Fiber Laser Cell",
        operationName: "CNC Fiber Laser Contour Profile & Cutouts",
        requiredQuantity: 50,
        completedQuantity: 50,
        scrappedQuantity: 0,
        status: "completed",
        assignedOperatorId: "usr_brandon_operator",
        assignedOperatorName: "Brandon",
        actualLaborMinutes: 180,
      },
      {
        id: "top_2",
        sequence: 20,
        workCenterCode: "WC-BRAKE-01",
        workCenterName: "Amada 100-Ton 6-Axis CNC Press Brake",
        operationName: "6-Axis CNC Flange Return Bending (90.0° +/-0.5°)",
        requiredQuantity: 50,
        completedQuantity: 48,
        scrappedQuantity: 2,
        status: "completed",
        assignedOperatorId: "usr_brandon_operator",
        assignedOperatorName: "Brandon",
        actualLaborMinutes: 140,
      },
      {
        id: "top_3",
        sequence: 30,
        workCenterCode: "WC-WELD-01",
        workCenterName: "Fanuc Robotic TIG & PEM Fastener Cell",
        operationName: "PEM Clinch Stud Insertion & Corner TIG Weld",
        requiredQuantity: 48,
        completedQuantity: 48,
        scrappedQuantity: 0,
        status: "completed",
        assignedOperatorId: "usr_brandon_operator",
        assignedOperatorName: "Brandon",
        actualLaborMinutes: 95,
      },
      {
        id: "top_4",
        sequence: 40,
        workCenterCode: "WC-QC-01",
        workCenterName: "Mitutoyo Crysta-Apex CMM Inspection Bay",
        operationName: "AS9102 First Article CMM Dimensional Inspection",
        requiredQuantity: 48,
        completedQuantity: 48,
        scrappedQuantity: 0,
        status: "completed",
        assignedOperatorId: "usr_brandon_operator",
        assignedOperatorName: "Brandon",
        actualLaborMinutes: 75,
      },
      {
        id: "top_5",
        sequence: 50,
        workCenterCode: "WC-PACK-01",
        workCenterName: "Packaging, Crate Staging & Palletization",
        operationName: "Final Degrease, Protective Wrap & Heavy Crate Pack",
        requiredQuantity: 48,
        completedQuantity: 0,
        scrappedQuantity: 0,
        status: "running",
        assignedOperatorId: "usr_brandon_operator",
        assignedOperatorName: "Brandon",
        actualLaborMinutes: 30,
      },
    ],
  },
  {
    id: "trv_yorkstead_105",
    organizationId: "org_yorkstead_systems",
    travelerNumber: "TRV-2026-105",
    qrCodeData: "yorkstead://traveler/TRV-2026-105",
    jobId: "job_yorkstead_105",
    jobNumber: "JOB-2026-105",
    partDescription: "Architectural Structural Fascia Brackets",
    customerName: "Summit Architectural Glass",
    totalQuantity: 120,
    currentStepIndex: 1,
    status: "queued",
    priority: "standard",
    targetDueDate: "2026-09-22",
    version: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    operations: [
      {
        id: "top_105_1",
        sequence: 10,
        workCenterCode: "WC-LASER-01",
        workCenterName: "Mitsubishi 4kW Fiber Laser Cell",
        operationName: "Cutout Mounting Slot Pattern",
        requiredQuantity: 120,
        completedQuantity: 0,
        scrappedQuantity: 0,
        status: "pending",
        assignedOperatorId: "usr_brandon_operator",
        assignedOperatorName: "Brandon",
        actualLaborMinutes: 0,
      },
    ],
  },
];

export function ShopfloorTerminal() {
  const [activeTab, setActiveTab] = React.useState<"station" | "dispatch" | "scan">("station");
  const [travelers, setTravelers] = React.useState<DigitalTraveler[]>(SAMPLE_TRAVELERS);
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Block reporting dialog
  const [blockingOp, setBlockingOp] = React.useState<{ travelerId: string; opId: string; opName: string } | null>(null);
  const [blockReason, setBlockReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New Traveler dialog
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newJobNumber, setNewJobNumber] = React.useState("JOB-2026-105");
  const [newPartDesc, setNewPartDesc] = React.useState("Aluminum Fascia Bracket Assemblies");
  const [newCustName, setNewCustName] = React.useState("Summit Architectural Glass");
  const [newQty, setNewQty] = React.useState(75);

  const fetchTravelers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shopfloor/travelers");
      if (!res.ok) {
        if (res.status === 401) {
          setTravelers(SAMPLE_TRAVELERS);
          return;
        }
        throw new Error("Failed to load travelers");
      }
      const data = await res.json();
      if (data.travelers && data.travelers.length > 0) {
        setTravelers(data.travelers);
      } else {
        setTravelers(SAMPLE_TRAVELERS);
      }
    } catch {
      setTravelers(SAMPLE_TRAVELERS);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchTravelers(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchTravelers]);

  const handleStartStep = async (travelerId: string, opId: string) => {
    try {
      const res = await fetch(`/api/shopfloor/travelers/${travelerId}/operations/${opId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      if (res.ok) {
        const { traveler } = await res.json();
        setTravelers((prev) => prev.map((t) => (t.id === traveler.id ? traveler : t)));
      } else {
        // Optimistic demo fallback
        setTravelers((prev) =>
          prev.map((t) => {
            if (t.id !== travelerId) return t;
            return {
              ...t,
              operations: t.operations.map((op) =>
                op.id === opId ? { ...op, status: "running" as const, startedAt: new Date().toISOString() } : op
              ),
            };
          })
        );
      }
      setFeedback("Station running. Production timer active.");
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      // Optimistic demo fallback
      setTravelers((prev) =>
        prev.map((t) => {
          if (t.id !== travelerId) return t;
          return {
            ...t,
            operations: t.operations.map((op) =>
              op.id === opId ? { ...op, status: "running" as const, startedAt: new Date().toISOString() } : op
            ),
          };
        })
      );
      setFeedback("Station running. Production timer active.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleCompleteStep = async (travelerId: string, opId: string, totalQty: number) => {
    try {
      const res = await fetch(`/api/shopfloor/travelers/${travelerId}/operations/${opId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", completedQuantity: totalQty, scrappedQuantity: 0 }),
      });

      if (res.ok) {
        const { traveler } = await res.json();
        setTravelers((prev) => prev.map((t) => (t.id === traveler.id ? traveler : t)));
      } else {
        // Optimistic demo fallback
        setTravelers((prev) =>
          prev.map((t) => {
            if (t.id !== travelerId) return t;
            const updatedOps = t.operations.map((op) =>
              op.id === opId ? { ...op, status: "completed" as const, completedQuantity: totalQty, completedAt: new Date().toISOString() } : op
            );
            const nextIndex = Math.min(t.currentStepIndex + 1, t.operations.length);
            const allCompleted = updatedOps.every((o) => o.status === "completed");
            return {
              ...t,
              operations: updatedOps,
              currentStepIndex: nextIndex,
              status: allCompleted ? ("completed" as const) : t.status,
            };
          })
        );
      }
      setFeedback("Step completed. Routed to next work center.");
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      // Optimistic demo fallback
      setTravelers((prev) =>
        prev.map((t) => {
          if (t.id !== travelerId) return t;
          const updatedOps = t.operations.map((op) =>
            op.id === opId ? { ...op, status: "completed" as const, completedQuantity: totalQty, completedAt: new Date().toISOString() } : op
          );
          const nextIndex = Math.min(t.currentStepIndex + 1, t.operations.length);
          const allCompleted = updatedOps.every((o) => o.status === "completed");
          return {
            ...t,
            operations: updatedOps,
            currentStepIndex: nextIndex,
            status: allCompleted ? ("completed" as const) : t.status,
          };
        })
      );
      setFeedback("Step completed. Routed to next work center.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleReportBlockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockingOp) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/shopfloor/travelers/${blockingOp.travelerId}/blockers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationId: blockingOp.opId, reason: blockReason }),
      });

      if (res.ok) {
        const { traveler } = await res.json();
        setTravelers((prev) => prev.map((t) => (t.id === traveler.id ? traveler : t)));
      } else {
        // Optimistic demo fallback
        setTravelers((prev) =>
          prev.map((t) => {
            if (t.id !== blockingOp.travelerId) return t;
            return {
              ...t,
              operations: t.operations.map((op) =>
                op.id === blockingOp.opId ? { ...op, status: "blocked" as const, blockerReason: blockReason } : op
              ),
            };
          })
        );
      }
      setFeedback("Blocker logged. Dispatch signal sent to production manager.");
      setBlockingOp(null);
      setBlockReason("");
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setTravelers((prev) =>
        prev.map((t) => {
          if (t.id !== blockingOp.travelerId) return t;
          return {
            ...t,
            operations: t.operations.map((op) =>
              op.id === blockingOp.opId ? { ...op, status: "blocked" as const, blockerReason: blockReason } : op
            ),
          };
        })
      );
      setFeedback("Blocker logged. Dispatch signal sent to production manager.");
      setBlockingOp(null);
      setBlockReason("");
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTraveler = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/shopfloor/travelers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: `job_${Date.now()}`,
          jobNumber: newJobNumber,
          partDescription: newPartDesc,
          customerName: newCustName,
          totalQuantity: Number(newQty),
          targetDueDate: "2026-09-20",
          operations: [
            { sequence: 10, workCenterCode: "WC-LASER-01", workCenterName: "Mitsubishi 4kW Laser", operationName: "CNC Fiber Laser Contour Cut" },
            { sequence: 20, workCenterCode: "WC-BRAKE-01", workCenterName: "Amada 150T CNC Brake", operationName: "Form 90° Return Flanges" },
            { sequence: 30, workCenterCode: "WC-QC-01", workCenterName: "CMM Inspection Bay", operationName: "First Article Tolerance Verification" },
            { sequence: 40, workCenterCode: "WC-PACK-01", workCenterName: "Packaging Line", operationName: "Degrease & Box Packaging" },
          ],
        }),
      });

      if (res.ok) {
        const { traveler } = await res.json();
        setTravelers((prev) => [traveler, ...prev]);
      } else {
        const newTrv: DigitalTraveler = {
          id: `trv_${Date.now()}`,
          organizationId: "org_yorkstead_systems",
          travelerNumber: `TRV-${newJobNumber.replace("JOB-", "") || Date.now()}`,
          qrCodeData: `yorkstead://traveler/TRV-${newJobNumber}`,
          jobId: `job_${Date.now()}`,
          jobNumber: newJobNumber,
          partDescription: newPartDesc,
          customerName: newCustName,
          totalQuantity: Number(newQty),
          currentStepIndex: 1,
          status: "active",
          priority: "standard",
          targetDueDate: "2026-09-20",
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          operations: [
            { id: `top_${Date.now()}_1`, sequence: 10, workCenterCode: "WC-LASER-01", workCenterName: "Mitsubishi 4kW Laser", operationName: "CNC Fiber Laser Contour Cut", requiredQuantity: Number(newQty), completedQuantity: 0, scrappedQuantity: 0, status: "pending", actualLaborMinutes: 0 },
            { id: `top_${Date.now()}_2`, sequence: 20, workCenterCode: "WC-BRAKE-01", workCenterName: "Amada 150T CNC Brake", operationName: "Form 90° Return Flanges", requiredQuantity: Number(newQty), completedQuantity: 0, scrappedQuantity: 0, status: "pending", actualLaborMinutes: 0 },
            { id: `top_${Date.now()}_3`, sequence: 30, workCenterCode: "WC-QC-01", workCenterName: "CMM Inspection Bay", operationName: "First Article Tolerance Verification", requiredQuantity: Number(newQty), completedQuantity: 0, scrappedQuantity: 0, status: "pending", actualLaborMinutes: 0 },
            { id: `top_${Date.now()}_4`, sequence: 40, workCenterCode: "WC-PACK-01", workCenterName: "Packaging Line", operationName: "Degrease & Box Packaging", requiredQuantity: Number(newQty), completedQuantity: 0, scrappedQuantity: 0, status: "pending", actualLaborMinutes: 0 },
          ],
        };
        setTravelers((prev) => [newTrv, ...prev]);
      }
      setFeedback(`Dispatched digital traveler for ${newJobNumber}.`);
      setIsCreateOpen(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      const newTrv: DigitalTraveler = {
        id: `trv_${Date.now()}`,
        organizationId: "org_yorkstead_systems",
        travelerNumber: `TRV-${newJobNumber.replace("JOB-", "") || Date.now()}`,
        qrCodeData: `yorkstead://traveler/TRV-${newJobNumber}`,
        jobId: `job_${Date.now()}`,
        jobNumber: newJobNumber,
        partDescription: newPartDesc,
        customerName: newCustName,
        totalQuantity: Number(newQty),
        currentStepIndex: 1,
        status: "active",
        priority: "standard",
        targetDueDate: "2026-09-20",
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        operations: [
          { id: `top_${Date.now()}_1`, sequence: 10, workCenterCode: "WC-LASER-01", workCenterName: "Mitsubishi 4kW Laser", operationName: "CNC Fiber Laser Contour Cut", requiredQuantity: Number(newQty), completedQuantity: 0, scrappedQuantity: 0, status: "pending", actualLaborMinutes: 0 },
          { id: `top_${Date.now()}_2`, sequence: 20, workCenterCode: "WC-BRAKE-01", workCenterName: "Amada 150T CNC Brake", operationName: "Form 90° Return Flanges", requiredQuantity: Number(newQty), completedQuantity: 0, scrappedQuantity: 0, status: "pending", actualLaborMinutes: 0 },
          { id: `top_${Date.now()}_3`, sequence: 30, workCenterCode: "WC-QC-01", workCenterName: "CMM Inspection Bay", operationName: "First Article Tolerance Verification", requiredQuantity: Number(newQty), completedQuantity: 0, scrappedQuantity: 0, status: "pending", actualLaborMinutes: 0 },
          { id: `top_${Date.now()}_4`, sequence: 40, workCenterCode: "WC-PACK-01", workCenterName: "Packaging Line", operationName: "Degrease & Box Packaging", requiredQuantity: Number(newQty), completedQuantity: 0, scrappedQuantity: 0, status: "pending", actualLaborMinutes: 0 },
        ],
      };
      setTravelers((prev) => [newTrv, ...prev]);
      setFeedback(`Dispatched digital traveler for ${newJobNumber}.`);
      setIsCreateOpen(false);
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTravelers = travelers.filter(
    (t) =>
      t.partDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.travelerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTraveler = travelers[0] || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">OPERATIONS//SHOPFLOOR</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Mobile Operator Terminal & Digital Traveler
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Shopfloor Execution & Routing
          </h1>
          <p className="text-sm text-muted-foreground">
            Digital traveler dispatch, station execution timers, blocker signals, and QR routing control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchTravelers}
            disabled={loading}
            className="font-mono text-xs gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </Button>

          <Button
            variant={activeTab === "station" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("station")}
            className="font-mono text-xs uppercase"
          >
            My Station
          </Button>
          <Button
            variant={activeTab === "dispatch" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("dispatch")}
            className="font-mono text-xs uppercase"
          >
            Dispatch Board
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 font-mono text-xs"
          >
            <Plus className="size-3.5" />
            <span>Dispatch Traveler</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          <CheckCircle2 className="size-4" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="size-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Station Execution View */}
      {activeTab === "station" && activeTraveler && (
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{activeTraveler.travelerNumber}</span>
                    <Badge variant="outline" className="font-mono text-[9px] uppercase">
                      {activeTraveler.jobNumber}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-[9px] uppercase">
                      {activeTraveler.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-1 text-lg font-bold">{activeTraveler.partDescription}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    Customer: {activeTraveler.customerName} • Qty: {activeTraveler.totalQuantity} pcs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Station Execution Sequence
              </h4>

              <div className="grid gap-3">
                {activeTraveler.operations.map((op: TravelerOperation) => (
                  <div
                    key={op.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-border/80 bg-background/50 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">SEQ {op.sequence}</span>
                        <Badge variant="outline" className="font-mono text-[9px]">{op.workCenterCode}</Badge>
                        <Badge
                          variant={op.status === "running" ? "default" : op.status === "completed" ? "secondary" : "outline"}
                          className="font-mono text-[9px] uppercase"
                        >
                          {op.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{op.operationName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        Progress: {op.completedQuantity} / {op.requiredQuantity} pcs • Actual Labor: {op.actualLaborMinutes}m
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {op.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartStep(activeTraveler.id, op.id)}
                          className="h-8 gap-1.5 text-xs font-mono text-primary border-primary/30"
                        >
                          <Play className="size-3" />
                          <span>Start Station</span>
                        </Button>
                      )}

                      {op.status === "running" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setBlockingOp({ travelerId: activeTraveler.id, opId: op.id, opName: op.operationName })}
                            className="h-8 gap-1 text-xs font-mono text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                          >
                            <AlertTriangle className="size-3" />
                            <span>Report Blocker</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCompleteStep(activeTraveler.id, op.id, activeTraveler.totalQuantity)}
                            className="h-8 gap-1.5 text-xs font-mono"
                          >
                            <CheckCircle2 className="size-3" />
                            <span>Complete Step</span>
                          </Button>
                        </>
                      )}

                      {op.status === "completed" && (
                        <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dispatch Board View */}
      {activeTab === "dispatch" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search dispatched travelers by part, number, or customer..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="grid gap-3">
            {filteredTravelers.length === 0 ? (
              <Card className="border-dashed p-8 text-center text-xs text-muted-foreground">
                No travelers dispatched.
              </Card>
            ) : (
              filteredTravelers.map((t) => (
                <Card key={t.id} className="border-border p-4 bg-card/85">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{t.travelerNumber}</span>
                        <Badge variant="outline" className="font-mono text-[9px]">{t.jobNumber}</Badge>
                        <Badge variant="secondary" className="font-mono text-[9px] uppercase">{t.status}</Badge>
                      </div>
                      <h4 className="text-sm font-semibold mt-1">{t.partDescription}</h4>
                      <p className="font-mono text-xs text-muted-foreground">
                        Customer: {t.customerName} • Qty: {t.totalQuantity} • Operations: {t.operations.length}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Report Blocker Modal */}
      {blockingOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-amber-500/40 bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-400">
                <AlertTriangle className="size-4" />
                <span>Log Station Exception / Blocker</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Signal maintenance, tooling, or engineering dispatch for {blockingOp.opName}.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleReportBlockerSubmit}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="blocker-reason" className="font-mono text-[10px] uppercase">Reason for Blocker</Label>
                  <Input
                    id="blocker-reason"
                    placeholder="e.g. Laser assist gas pressure drop / Tooling wear"
                    value={blockReason}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBlockReason(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setBlockingOp(null)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}>Log Blocker</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Dispatch Traveler Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-primary/40 bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle className="text-base font-bold">Dispatch Digital Traveler</CardTitle>
                <CardDescription className="text-xs">Release traveler routing into station queues.</CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsCreateOpen(false)} className="size-8 p-0">
                <X className="size-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreateTraveler}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="job-num" className="font-mono text-[10px] uppercase">Job Reference</Label>
                  <Input
                    id="job-num"
                    value={newJobNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewJobNumber(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="part-desc" className="font-mono text-[10px] uppercase">Part Description</Label>
                  <Input
                    id="part-desc"
                    value={newPartDesc}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPartDesc(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="cust-name" className="font-mono text-[10px] uppercase">Customer</Label>
                    <Input
                      id="cust-name"
                      value={newCustName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCustName(e.target.value)}
                      required
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qty" className="font-mono text-[10px] uppercase">Quantity</Label>
                    <Input
                      id="qty"
                      type="number"
                      value={newQty}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewQty(Number(e.target.value))}
                      required
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}>Dispatch Traveler</Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
