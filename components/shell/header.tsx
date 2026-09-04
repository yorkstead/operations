'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Settings, ChevronDown, KeyRound } from "lucide-react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { isOwnerRoute } from "@/lib/owner-routes";
import { YorksteadMark } from "@/components/brand/yorkstead-logo";
import { MobileNav } from "@/components/shell/mobile-nav";
import { OrgSwitcher } from "@/components/shell/org-switcher";
import { NotificationsDrawer } from "@/components/shell/notifications-drawer";
import { ThemeToggle } from "@/components/shell/theme-toggle";

const primaryLinks = [
  { href: "/analytics", label: "Analytics Engine" },
];

const moduleGroups = [
  {
    label: "Executive & Projects",
    links: [
      { href: "/cockpit", label: "Cockpit" },
      { href: "/projects", label: "Projects" },
      { href: "/engagements", label: "Engagements" },
    ],
  },
  {
    label: "Production & Shopfloor",
    links: [
      { href: "/jobs", label: "Jobs & Routing" },
      { href: "/shopfloor", label: "Shopfloor" },
      { href: "/inventory", label: "Inventory" },
      { href: "/job-packets", label: "Job Packets" },
      { href: "/maintenance", label: "Maintenance" },
      { href: "/packaging", label: "Packaging" },
      { href: "/shipping", label: "Shipping" },
    ],
  },
  {
    label: "Sourcing & Quality",
    links: [
      { href: "/quotes", label: "Quotes" },
      { href: "/purchasing", label: "Purchasing" },
      { href: "/quality", label: "Quality" },
      { href: "/knowledge", label: "Notion OS & SOPs" },
      { href: "/directory", label: "Directory" },
    ],
  },
  {
    label: "Intelligence & Platform",
    links: [
      { href: "/infrastructure", label: "Cloud Ops" },
      { href: "/audit", label: "Audit Engine" },
      { href: "/files", label: "File Vault" },
      { href: "/activity", label: "Activity Log" },
      { href: "/demo", label: "Demo Sandboxes" },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  const activeModule = moduleGroups.flatMap((group) => group.links).find((link) => isActive(link.href));
  const navClassName = "inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 font-mono text-xs uppercase tracking-wider transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:h-16 lg:px-8">
        <Link href="/" className="inline-flex min-h-9 shrink-0 items-center gap-2" aria-label={brand.name}>
          <YorksteadMark size={22} />
          <span className="hidden font-mono text-sm font-bold tracking-[0.2em] text-foreground md:inline">
            {brand.wordmark}<span className="text-primary">.{brand.domainSuffix}</span>
          </span>
          <span className="hidden border-l border-border pl-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground lg:inline-block">
            {brand.systemName}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <OrgSwitcher />
          <NotificationsDrawer />
          <ThemeToggle />
          <Link
            href="/settings/organization"
            aria-label="Organization Settings"
            aria-current={isActive("/settings/organization") ? "page" : undefined}
            className="hidden size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-foreground aria-[current=page]:text-primary sm:inline-flex"
          >
            <Settings className="size-4" />
          </Link>
          <MobileNav />
        </div>
      </div>

      <div className="hidden border-t border-border/60 lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-2 px-8" aria-label="Main Navigation">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(navClassName, isActive(link.href)
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground")}
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu.Root key={pathname} modal={false}>
            <DropdownMenu.Trigger
              className={cn(navClassName, "group ml-auto", activeModule
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground")}
            >
              Modules{activeModule && <span className="normal-case tracking-normal">/ {activeModule.label}</span>}
              <ChevronDown className="size-3 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                collisionPadding={16}
                className="z-50 hidden max-h-[var(--radix-dropdown-menu-content-available-height)] w-64 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-xl lg:block"
              >
                {moduleGroups.map((group, index) => (
                  <DropdownMenu.Group key={group.label}>
                    {index > 0 && <DropdownMenu.Separator className="my-2 h-px bg-border" />}
                    <DropdownMenu.Label className="px-2 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {group.label}
                    </DropdownMenu.Label>
                    {group.links.map((link) => {
                      const isOwner = isOwnerRoute(link.href);
                      return (
                        <DropdownMenu.Item key={link.href} asChild>
                          <Link
                            href={link.href}
                            aria-current={isActive(link.href) ? "page" : undefined}
                            className="flex min-h-9 items-center justify-between rounded-md px-2 font-mono text-xs text-foreground outline-none data-[highlighted]:bg-accent data-[highlighted]:ring-1 data-[highlighted]:ring-inset data-[highlighted]:ring-ring aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
                          >
                            <span>{link.label}</span>
                            {isOwner && (
                              <span className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground/80" title="Passkey Protected">
                                <KeyRound className="size-3 text-primary/70" />
                              </span>
                            )}
                          </Link>
                        </DropdownMenu.Item>
                      );
                    })}
                  </DropdownMenu.Group>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>
      </div>
    </header>
  );
}
