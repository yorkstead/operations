'use client';

import * as React from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  timeAgo: string;
}

export function NotificationsDrawer() {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: "notif_1",
      title: "Workflow Audit Completed",
      message: "Diagnostic briefing generated for Front Range Manufacturing.",
      link: "/audit",
      read: false,
      timeAgo: "10m ago",
    },
    {
      id: "notif_2",
      title: "Team Invitation Dispatched",
      message: "Invitation sent to shopfloor operator via neutral email port.",
      link: "/settings/organization",
      read: false,
      timeAgo: "25m ago",
    },
    {
      id: "notif_3",
      title: "Platform Shell Initialized",
      message: "ADR-0002 platform foundation verified and deployed.",
      link: "/",
      read: true,
      timeAgo: "1h ago",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

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
        aria-label="View Notifications"
        className="relative rounded-lg border border-border p-2 text-muted-foreground transition hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary font-mono text-[8px] font-bold text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm rounded-xl border border-border bg-card p-3 shadow-2xl backdrop-blur-md z-50">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && <Badge variant="default" className="text-[9px] px-1 py-0">{unreadCount} new</Badge>}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
              >
                <Check className="size-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-border pt-1 max-h-72 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className={`py-2.5 ${!n.read ? "bg-primary/5 -mx-3 px-3" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-foreground">{n.title}</span>
                  <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{n.timeAgo}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{n.message}</p>
                {n.link && (
                  <a
                    href={n.link}
                    onClick={() => setOpen(false)}
                    className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
                  >
                    View details <ExternalLink className="size-2.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
