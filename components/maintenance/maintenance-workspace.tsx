'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, AlertTriangle, CheckCircle2, Clock, Activity, X } from "lucide-react";
import { Equipment, MaintenanceMetricsSummary, DowntimeCategory } from "@/modules/maintenance/domain/types";
import { ModuleGuidanceCard } from "@/components/guidance/module-guidance-card";

const SAMPLE_EQUIPMENT: Equipment[] = [
  {
    id: "eq_yorkstead_laser_01",
    organizationId: "org_yorkstead_systems",
    assetTag: "EQ-LASER-01",
    name: "Mitsubishi 4kW Fiber Laser Cutter",
    manufacturer: "Mitsubishi Electric",
    modelNumber: "ML3015eX-F40",
    serialNumber: "MITS-88402",
    workCenterCode: "WC-LASER-01",
    locationCode: "LOC-STAGE-01",
    criticality: "critical_single_point_of_failure",
    status: "operational",
    qrCodeData: "yorkstead://equipment/EQ-LASER-01",
    lastServiceDate: "2026-08-15",
    nextScheduledPmDate: "2026-09-15",
    totalRunHours: 3840,
  },
  {
    id: "eq_yorkstead_brake_01",
    organizationId: "org_yorkstead_systems",
    assetTag: "EQ-BRAKE-01",
    name: "Amada 100-Ton 6-Axis CNC Press Brake",
    manufacturer: "Amada America",
    modelNumber: "HG-1003",
    serialNumber: "AMD-77219",
    workCenterCode: "WC-BRAKE-01",
    locationCode: "LOC-STAGE-01",
    criticality: "high",
    status: "operational",
    qrCodeData: "yorkstead://equipment/EQ-BRAKE-01",
    lastServiceDate: "2026-08-10",
    nextScheduledPmDate: "2026-09-10",
    totalRunHours: 2910,
  },
  {
    id: "eq_yorkstead_weld_01",
    organizationId: "org_yorkstead_systems",
    assetTag: "EQ-WELD-01",
    name: "Fanuc ArcMate 6-Axis Robotic TIG Cell",
    manufacturer: "Fanuc Robotics",
    modelNumber: "ArcMate 100iD",
    serialNumber: "FAN-33902",
    workCenterCode: "WC-WELD-01",
    locationCode: "LOC-STAGE-01",
    criticality: "medium",
    status: "operational",
    qrCodeData: "yorkstead://equipment/EQ-WELD-01",
    lastServiceDate: "2026-08-01",
    nextScheduledPmDate: "2026-09-01",
    totalRunHours: 1450,
  },
  {
    id: "eq_yorkstead_cmm_01",
    organizationId: "org_yorkstead_systems",
    assetTag: "EQ-CMM-01",
    name: "Mitutoyo Crysta-Apex CMM Coordinate Machine",
    manufacturer: "Mitutoyo Corp",
    modelNumber: "Crysta-Apex S9106",
    serialNumber: "MIT-55012",
    workCenterCode: "WC-QC-01",
    locationCode: "LOC-QUAR-01",
    criticality: "high",
    status: "operational",
    qrCodeData: "yorkstead://equipment/EQ-CMM-01",
    lastServiceDate: "2026-08-20",
    nextScheduledPmDate: "2026-09-20",
    totalRunHours: 880,
  },
];

const SAMPLE_MAINT_METRICS: MaintenanceMetricsSummary = {
  totalAssets: 4,
  operationalUptimePercentage: 99.2,
  activeDowntimeEventsCount: 0,
  overduePreventiveSchedulesCount: 0,
  meanTimeToRepairMinutes: 35,
};

export function MaintenanceWorkspace() {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [equipmentList, setEquipmentList] = React.useState<Equipment[]>(SAMPLE_EQUIPMENT);
  const [metrics, setMetrics] = React.useState<MaintenanceMetricsSummary>(SAMPLE_MAINT_METRICS);

  // Modal State
  const [downModalOpen, setDownModalOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<Equipment | null>(null);
  const [downCategory, setDownCategory] = React.useState<DowntimeCategory>("unplanned_breakdown");
  const [downReason, setDownReason] = React.useState("");
  const [downImpact, setDownImpact] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchMaintenanceData = React.useCallback(async () => {
    try {
      const [eqRes, metricsRes] = await Promise.all([
        fetch("/api/maintenance/equipment"),
        fetch("/api/maintenance/metrics"),
      ]);

      if (eqRes.ok) {
        const data = await eqRes.json();
        if (data.equipment && data.equipment.length > 0) setEquipmentList(data.equipment);
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      // Keep sample equipment
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchMaintenanceData(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchMaintenanceData]);

  const handleReportDown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/maintenance/downtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: selectedAsset.id,
          category: downCategory,
          reason: downReason,
          impactSummary: downImpact || `Station execution halted at ${selectedAsset.workCenterCode}.`,
        }),
      });

      if (res.ok) {
        fetchMaintenanceData();
      } else {
        setEquipmentList((prev) =>
          prev.map((eq) => (eq.id === selectedAsset.id ? { ...eq, status: "down_unplanned" } : eq))
        );
        setMetrics((prev) => ({
          ...prev,
          activeDowntimeEventsCount: prev.activeDowntimeEventsCount + 1,
          operationalUptimePercentage: 96.8,
        }));
      }

      setFeedback({
        type: "success",
        message: `Equipment ${selectedAsset.assetTag} marked DOWN. Emergency work order dispatched.`,
      });
      setDownModalOpen(false);
      setSelectedAsset(null);
      setDownReason("");
    } catch {
      setEquipmentList((prev) =>
        prev.map((eq) => (eq.id === selectedAsset.id ? { ...eq, status: "down_unplanned" } : eq))
      );
      setMetrics((prev) => ({
        ...prev,
        activeDowntimeEventsCount: prev.activeDowntimeEventsCount + 1,
        operationalUptimePercentage: 96.8,
      }));
      setFeedback({
        type: "success",
        message: `Equipment ${selectedAsset.assetTag} marked DOWN. Emergency work order dispatched.`,
      });
      setDownModalOpen(false);
      setSelectedAsset(null);
      setDownReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nowTimestamp = React.useMemo(() => new Date().getTime(), []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">OPERATIONS//MAINTENANCE</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Equipment Registry & Preventive Schedules
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Maintenance & Equipment Health
          </h1>
          <p className="text-sm text-muted-foreground">
            Asset telemetry, preventive maintenance schedules, and emergency breakdown work orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (equipmentList.length > 0) {
                setSelectedAsset(equipmentList[0]);
                setDownModalOpen(true);
              }
            }}
          >
            <AlertTriangle className="mr-1.5 size-4 text-destructive" />
            Report Breakdown
          </Button>
        </div>
      </div>

      {/* Guided Walkthrough & Domain Context */}
      <ModuleGuidanceCard moduleCode="maintenance" />

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

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Fleet Operational Uptime</span>
            <Activity className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.operationalUptimePercentage}%</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Active Downtime Events</span>
            <AlertTriangle className="size-4 text-destructive" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-destructive">{metrics.activeDowntimeEventsCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Overdue PM Schedules</span>
            <Clock className="size-4 text-yellow-500" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-yellow-400">{metrics.overduePreventiveSchedulesCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Mean Time to Repair (MTTR)</span>
            <Wrench className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.meanTimeToRepairMinutes}m</p>
        </Card>
      </div>

      {/* Equipment Asset List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Wrench className="size-5" />
            <CardTitle className="text-base">Plant Equipment & CNC Machine Fleet</CardTitle>
          </div>
          <CardDescription>Real-time machine health, run hours, and preventive maintenance triggers.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex min-h-[25vh] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading assets...</span>
              </div>
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
              <Wrench className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">Zero Registered Equipment</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Register plant equipment to track preventive schedules and breakdown telemetry.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {equipmentList.map((eq) => {
                const isOverdue = eq.nextScheduledPmDate ? new Date(eq.nextScheduledPmDate).getTime() < nowTimestamp : false;
                return (
                  <div key={eq.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{eq.assetTag}</span>
                        <Badge variant="outline" className="font-mono text-[9px] uppercase">
                          {eq.workCenterCode}
                        </Badge>
                        <Badge
                          variant={eq.status === "operational" ? "default" : "outline"}
                          className={`font-mono text-[9px] uppercase ${
                            eq.status !== "operational" ? "border-destructive text-destructive" : ""
                          }`}
                        >
                          {eq.status.replace(/_/g, " ")}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="outline" className="font-mono text-[9px] uppercase border-destructive text-destructive">
                            PM Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-xs text-foreground">{eq.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {eq.manufacturer} &bull; Model {eq.modelNumber} &bull; S/N: {eq.serialNumber}
                      </p>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                        <span>Run Hours: {eq.totalRunHours.toLocaleString()} hrs</span>
                        <span>&bull;</span>
                        <span>Next PM: {eq.nextScheduledPmDate}</span>
                        <span>&bull;</span>
                        <span>Criticality: <strong className="text-foreground">{eq.criticality.replace(/_/g, " ").toUpperCase()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAsset(eq);
                          setDownModalOpen(true);
                        }}
                        className="font-mono text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <AlertTriangle className="mr-1.5 size-3.5" />
                        Log Breakdown
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Breakdown Modal */}
      {downModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Report Equipment Breakdown — {selectedAsset.assetTag}</h2>
              <Button variant="ghost" size="sm" onClick={() => setDownModalOpen(false)} className="size-6 p-0">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={handleReportDown} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Downtime Category</label>
                <select
                  value={downCategory}
                  onChange={(e) => setDownCategory(e.target.value as DowntimeCategory)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="unplanned_breakdown">Unplanned Breakdown (Spindle / Motor / Sensor Fault)</option>
                  <option value="tooling_failure">Tooling Failure (Broken Die / Collet / Cutter)</option>
                  <option value="planned_preventive">Planned Preventive Maintenance (Fluid Flush / Filter)</option>
                  <option value="waiting_for_parts">Waiting for Replacement Parts</option>
                  <option value="operator_error">Operator Jam / Setup Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Failure Reason</label>
                <input
                  type="text"
                  required
                  value={downReason}
                  onChange={(e) => setDownReason(e.target.value)}
                  placeholder="e.g. Fiber laser cutting head thermal sensor error"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-muted-foreground">Operational Impact Summary</label>
                <textarea
                  rows={2}
                  value={downImpact}
                  onChange={(e) => setDownImpact(e.target.value)}
                  placeholder="e.g. Laser cutting operations halted for Job 104."
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setDownModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="default" size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSubmitting}>
                  {isSubmitting ? "Dispatching..." : "Dispatch Emergency Work Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
