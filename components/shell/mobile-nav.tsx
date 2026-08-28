'use client';

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { YorksteadMark } from "@/components/brand/yorkstead-logo";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const panelId = "mobile-navigation-panel";

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="size-9 p-0 hover:bg-muted"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && createPortal(
        <div id={panelId} className="fixed inset-x-0 bottom-0 top-14 z-50 flex flex-col overflow-y-auto border-t border-border bg-background/98 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
            {/* Top Brand Banner inside menu */}
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <YorksteadMark size={22} />
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold tracking-[0.2em] text-foreground">
                    {brand.wordmark}<span className="text-primary">.{brand.domainSuffix}</span>
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    {brand.systemName}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="font-mono text-xs text-muted-foreground"
              >
                Close
              </Button>
            </div>

            <div className="space-y-6 pb-20">
              {/* Executive Cockpit */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold">
                  Executive Cockpit & Cloud Ops
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 p-3 font-mono text-xs text-primary font-semibold transition hover:border-primary"
                  >
                    <span>Operator Cockpit</span>
                    <ArrowRight className="size-3.5 text-primary" />
                  </Link>
                  <Link
                    href="/infrastructure"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Cloud Infrastructure</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {/* Core Workflow */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold">
                  Production Core
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    href="/jobs"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Jobs & Routing</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/shopfloor"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Shopfloor</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/inventory"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Inventory</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/job-packets"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Job Packets</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {/* Sourcing & Estimating */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold">
                  Sourcing & Estimating
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    href="/quotes"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>QuoteFlow</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/purchasing"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Purchasing</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/directory"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Directory</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/knowledge"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>KnowHow SOPs</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {/* Quality & Fulfillment */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold">
                  Quality & Logistics
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    href="/quality"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Quality / NCR</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/maintenance"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Maintenance</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/packaging"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Packaging</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/shipping"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Shipping</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {/* Intelligence & Control */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold">
                  Intelligence & Administration
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    href="/analytics"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Analytics</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/audit"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Audit Engine</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/files"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>File Vault</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/activity"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Activity Log</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Settings & Demos
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    href="/settings/organization"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="size-4 text-muted-foreground" />
                      <span>Organization Settings</span>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/demo"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3 font-mono text-xs text-foreground transition hover:border-primary/50"
                  >
                    <span>Deterministic Demo Hub</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
