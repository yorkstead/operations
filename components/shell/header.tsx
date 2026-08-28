'use client';

import * as React from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { YorksteadMark } from "@/components/brand/yorkstead-logo";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/shell/mobile-nav";
import { OrgSwitcher } from "@/components/shell/org-switcher";
import { NotificationsDrawer } from "@/components/shell/notifications-drawer";
import { Settings, ChevronDown } from "lucide-react";

export function Header() {
  const [moreOpen, setMoreOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" className="inline-flex items-center gap-2" aria-label={brand.name}>
            <YorksteadMark size={22} />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.2em] text-foreground">
              {brand.wordmark}<span className="text-primary hidden sm:inline">.{brand.domainSuffix}</span>
            </span>
            <span className="hidden border-l border-border pl-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground xl:inline-block">
              {brand.systemName}
            </span>
          </Link>
          <Badge variant="default" className="hidden 2xl:inline-flex text-[9px] px-1.5 py-0">v{brand.version}</Badge>
        </div>

        {/* Primary Desktop Navigation (Visible on lg+ screens) */}
        <nav className="hidden items-center gap-4 xl:gap-6 lg:flex" aria-label="Main Navigation">
          <Link href="/" className="text-xs font-mono uppercase tracking-wider text-primary font-semibold transition hover:text-foreground">
            Cockpit
          </Link>
          <Link href="/infrastructure" className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
            Cloud Ops
          </Link>
          <Link href="/jobs" className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
            Jobs
          </Link>
          <Link href="/shopfloor" className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
            Shopfloor
          </Link>
          <Link href="/inventory" className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
            Inventory
          </Link>
          <Link href="/quotes" className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
            Quotes
          </Link>
          <Link href="/purchasing" className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
            Purchasing
          </Link>
          <Link href="/quality" className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
            Quality
          </Link>
          <Link href="/analytics" className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground">
            Analytics
          </Link>

          {/* More Operations Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground transition hover:text-foreground focus:outline-none"
              aria-expanded={moreOpen}
            >
              <span>Modules</span>
              <ChevronDown className={`size-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card/98 p-2.5 shadow-2xl backdrop-blur-md z-50">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border mb-1.5">
                  Factory Operations
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Link
                    href="/maintenance"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Maintenance
                  </Link>
                  <Link
                    href="/packaging"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Packaging
                  </Link>
                  <Link
                    href="/shipping"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Shipping
                  </Link>
                  <Link
                    href="/job-packets"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Job Packets
                  </Link>
                  <Link
                    href="/knowledge"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    KnowHow
                  </Link>
                  <Link
                    href="/directory"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Directory
                  </Link>
                </div>

                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border my-1.5">
                  Platform & Tools
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <Link
                    href="/audit"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Audit Engine
                  </Link>
                  <Link
                    href="/files"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    File Vault
                  </Link>
                  <Link
                    href="/activity"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Activity Log
                  </Link>
                  <Link
                    href="/demo"
                    onClick={() => setMoreOpen(false)}
                    className="rounded px-2 py-1.5 text-xs font-mono text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Demo Orgs
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Shell Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <OrgSwitcher />
          <NotificationsDrawer />
          <Link
            href="/settings/organization"
            aria-label="Organization Settings"
            className="hidden rounded-lg border border-border p-2 text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:inline-flex"
          >
            <Settings className="size-4" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
