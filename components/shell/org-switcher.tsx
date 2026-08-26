'use client';

import * as React from "react";
import { Building2, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OrgOption {
  id: string;
  name: string;
  role: string;
}

export function OrgSwitcher() {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [orgs] = React.useState<OrgOption[]>([
    { id: "org_synth_1", name: "Front Range Manufacturing", role: "Owner" },
    { id: "org_synth_2", name: "Summit Facility Services", role: "Manager" },
    { id: "org_synth_3", name: "Mile High Signworks", role: "Operator" },
  ]);
  const [activeOrgId, setActiveOrgId] = React.useState("org_synth_1");

  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Switch Active Organization"
        className="flex max-w-[140px] sm:max-w-[220px] items-center gap-1.5 sm:gap-2 rounded-lg border border-border bg-card/60 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        <Building2 className="size-3.5 text-primary shrink-0" />
        <span className="font-mono text-[11px] sm:text-xs font-semibold truncate">
          {activeOrg.name}
        </span>
        <Badge variant="secondary" className="hidden md:inline-flex text-[9px] px-1 py-0 shrink-0">
          {activeOrg.role}
        </Badge>
        <ChevronDown className="size-3 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card p-1.5 shadow-2xl backdrop-blur-md z-50">
          <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
            Switch Organization
          </div>
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setActiveOrgId(org.id);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium transition hover:bg-accent hover:text-accent-foreground ${
                org.id === activeOrgId ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <div className="flex flex-col truncate pr-2">
                <span className="font-mono text-xs text-foreground font-semibold truncate">{org.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">Role: {org.role}</span>
              </div>
              {org.id === activeOrgId && <Check className="size-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
