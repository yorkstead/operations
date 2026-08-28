'use client';

import * as React from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Inbox,
  Mail,
  Send,
  Server,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function OperatorEmailHub({
  email = "brandon@yorkstead.com",
}: {
  email?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [showConfig, setShowConfig] = React.useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Card className="border-border bg-card/80 shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Email Identity & Status */}
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm">
              <Mail className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
                  {email}
                </span>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[9px] uppercase tracking-wider text-emerald-400"
                >
                  Spaceship Spacemail
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyAddress}
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  title="Copy address to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Official founder and executive mailbox hosted on Spaceship Spacemail.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="h-9 gap-1.5 bg-primary font-medium text-primary-foreground shadow transition hover:bg-primary/90"
              asChild
            >
              <a
                href="https://www.spacemail.com/login/"
                target="_blank"
                rel="noreferrer"
                title="Launch Spacemail Webmail login in new tab"
              >
                <Inbox className="size-4" />
                <span>Launch Webmail</span>
                <ArrowUpRight className="size-3 opacity-70" />
              </a>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 border-border bg-card/60 hover:bg-accent hover:text-foreground"
              asChild
            >
              <a href={`mailto:${email}`} title="Compose email with default client">
                <Send className="size-3.5 text-primary" />
                <span>Compose</span>
              </a>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              asChild
            >
              <a
                href="https://www.spaceship.com/application/sp-launchpad/"
                target="_blank"
                rel="noreferrer"
                title="Open Spaceship Launchpad & Mailbox Manager"
              >
                <ExternalLink className="size-3.5" />
                <span className="hidden sm:inline">Spaceship Console</span>
              </a>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Server className="size-3.5" />
              <span>{showConfig ? "Hide Ports" : "Connection Ports"}</span>
              {showConfig ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </Button>
          </div>
        </div>

        {/* Collapsible Connection Details */}
        {showConfig && (
          <div className="mt-4 border-t border-border/80 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                Spaceship Email Client Settings (IMAP / POP3 / SMTP)
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {/* IMAP */}
              <div className="rounded-lg border border-border/70 bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-primary">IMAP (Incoming)</span>
                  <Badge variant="secondary" className="font-mono text-[9px]">SSL / TLS</Badge>
                </div>
                <div className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                  <div>Host: <span className="text-foreground">mail.spaceship.com</span></div>
                  <div>Port: <span className="font-semibold text-emerald-400">993</span></div>
                </div>
              </div>

              {/* POP3 */}
              <div className="rounded-lg border border-border/70 bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-primary">POP3 (Incoming)</span>
                  <Badge variant="secondary" className="font-mono text-[9px]">SSL / TLS</Badge>
                </div>
                <div className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                  <div>Host: <span className="text-foreground">mail.spaceship.com</span></div>
                  <div>Port: <span className="font-semibold text-emerald-400">995</span></div>
                </div>
              </div>

              {/* SMTP */}
              <div className="rounded-lg border border-border/70 bg-background/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-primary">SMTP (Outgoing)</span>
                  <Badge variant="secondary" className="font-mono text-[9px]">SSL / TLS</Badge>
                </div>
                <div className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
                  <div>Host: <span className="text-foreground">mail.spaceship.com</span></div>
                  <div>Port: <span className="font-semibold text-emerald-400">465</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
