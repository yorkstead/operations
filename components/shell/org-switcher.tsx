'use client';

import * as React from "react";
import {
  Building2,
  Check,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  EyeOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface WorkspaceOption {
  id: string;
  name: string;
  scenarioSlug?: string;
  type: "production" | "demo";
  role: string;
  industry: string;
  description: string;
}

const WORKSPACES: WorkspaceOption[] = [
  {
    id: "org_yorkstead_systems",
    name: "Yorkstead Systems",
    type: "production",
    role: "Super-Admin",
    industry: "Software & Automation Consulting",
    description: "Internal business operations, client contracts, and cloud infrastructure.",
  },
  {
    id: "demo_mile_high_signworks",
    name: "Mile High Signworks",
    scenarioSlug: "mile-high-signworks",
    type: "demo",
    role: "Demo Operator",
    industry: "Industrial ERP & Architectural Signage",
    description: "CAD vector approvals, CNC routing, and field crane dispatch.",
  },
  {
    id: "demo_summit_facility",
    name: "Summit Facility Services",
    scenarioSlug: "summit-facility-services",
    type: "demo",
    role: "Demo Manager",
    industry: "Field Operations & Maintenance",
    description: "Multi-site facility inspection, mobile checklist, and asset maintenance.",
  },
  {
    id: "demo_front_range_mfg",
    name: "Front Range Precision MFG",
    scenarioSlug: "front-range-manufacturing",
    type: "demo",
    role: "Demo Owner",
    industry: "Precision Manufacturing & CNC",
    description: "Digital travelers, QR station scanning, and first-article inspections.",
  },
];

export function OrgSwitcher() {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState<string>("org_yorkstead_systems");
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState<string | null>(null);

  const activeWorkspace = WORKSPACES.find((w) => w.id === activeWorkspaceId) || WORKSPACES[0];
  const isDemoMode = activeWorkspace.type === "demo";

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResetDemo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDemoMode) return;

    setIsResetting(true);
    setResetMessage(null);

    try {
      // Simulate / perform deterministic reset to golden snapshot
      await new Promise((resolve) => setTimeout(resolve, 600));
      setResetMessage(`Reset ${activeWorkspace.name} to golden initial baseline.`);
      setTimeout(() => setResetMessage(null), 4000);
    } catch {
      setResetMessage("Reset failed.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Switch Active Workspace or Demo Scenario"
        className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
          isDemoMode
            ? "border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
            : "border-border bg-card/80 text-foreground hover:border-primary/40 hover:bg-card"
        }`}
      >
        {isDemoMode ? (
          <Sparkles className="size-3.5 text-amber-400 shrink-0" />
        ) : (
          <Building2 className="size-3.5 text-primary shrink-0" />
        )}

        <div className="flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-[200px]">
          <span className="font-mono text-[11px] sm:text-xs font-semibold truncate">
            {activeWorkspace.name}
          </span>
        </div>

        <Badge
          variant={isDemoMode ? "outline" : "secondary"}
          className={`hidden sm:inline-flex text-[9px] px-1.5 py-0 shrink-0 font-mono ${
            isDemoMode ? "border-amber-500/40 text-amber-400 bg-amber-500/10" : ""
          }`}
        >
          {isDemoMode ? "Demo Sandbox" : "Internal"}
        </Badge>

        <ChevronDown className="size-3 text-muted-foreground shrink-0" />
      </button>

      {/* Demo Mode Top Floating Status Notice */}
      {resetMessage && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-primary/40 bg-card p-2 text-center font-mono text-xs text-primary shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
          {resetMessage}
        </div>
      )}

      {/* Switcher Dropdown Modal */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card p-2 shadow-2xl backdrop-blur-md z-50 space-y-1">
          <div className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/80 flex items-center justify-between">
            <span>Workspace & Sales Pitch Mode</span>
            <span title="Redaction Active in Demo"><EyeOff className="size-3 text-muted-foreground" /></span>
          </div>

          <div className="space-y-1 pt-1">
            {WORKSPACES.map((ws) => {
              const isSelected = ws.id === activeWorkspaceId;
              const isWsDemo = ws.type === "demo";

              return (
                <div
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setOpen(false);
                  }}
                  className={`group relative flex flex-col rounded-xl p-2.5 transition cursor-pointer ${
                    isSelected
                      ? isWsDemo
                        ? "bg-amber-500/10 border border-amber-500/30"
                        : "bg-primary/10 border border-primary/30"
                      : "hover:bg-accent/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isWsDemo ? (
                        <Sparkles className="size-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="size-3.5 text-primary shrink-0" />
                      )}
                      <span className="font-mono text-xs font-semibold text-foreground truncate">
                        {ws.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[8px] px-1 py-0 font-mono ${
                          isWsDemo
                            ? "border-amber-500/40 text-amber-400"
                            : "border-primary/40 text-primary"
                        }`}
                      >
                        {isWsDemo ? "Demo" : "Internal"}
                      </Badge>
                      {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                    </div>
                  </div>

                  <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                    {ws.description}
                  </p>

                  {/* Reset Button for Active Demo */}
                  {isSelected && isWsDemo && (
                    <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-between">
                      <span className="font-mono text-[9px] text-amber-400/80">
                        Isolated in-memory sandbox
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleResetDemo}
                        disabled={isResetting}
                        className="h-6 px-2 font-mono text-[9px] gap-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                      >
                        <RotateCcw className={`size-2.5 ${isResetting ? "animate-spin" : ""}`} />
                        <span>{isResetting ? "Resetting..." : "Reset Demo"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
