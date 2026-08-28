'use client';

import * as React from "react";
import {
  Cloud,
  Database,
  Globe,
  ExternalLink,
  Cpu,
  Mail,
  Shield,
  Layers,
  CheckCircle2,
  HardDrive,
  GitBranch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface InfrastructureLink {
  title: string;
  category: "Cloud Compute" | "Database & Storage" | "Edge & Networking" | "Communications" | "CI/CD & Delivery";
  description: string;
  href: string;
  icon: React.ElementType;
  badge: string;
  status: "Operational" | "Managed" | "Active";
}

export const CLOUD_SERVICES: InfrastructureLink[] = [
  {
    title: "Cloudflare Edge & DNS",
    category: "Edge & Networking",
    description: "DNS routing, SSL/TLS certificates, DDoS shield, and Web Application Firewall.",
    href: "https://dash.cloudflare.com",
    icon: Globe,
    badge: "Edge",
    status: "Operational",
  },
  {
    title: "Google Cloud Run",
    category: "Cloud Compute",
    description: "Serverless container compute hosting operations, worker runners, and microservices.",
    href: "https://console.cloud.google.com/run",
    icon: Cpu,
    badge: "Containers",
    status: "Active",
  },
  {
    title: "Neon PostgreSQL",
    category: "Database & Storage",
    description: "Serverless relational database with point-in-time recovery and instant branching.",
    href: "https://console.neon.tech",
    icon: Database,
    badge: "Postgres",
    status: "Operational",
  },
  {
    title: "Cloudflare R2 Storage",
    category: "Database & Storage",
    description: "Zero-egress object storage for client deliverables, CAD drawings, and media vaults.",
    href: "https://dash.cloudflare.com/?to=/:account/r2",
    icon: HardDrive,
    badge: "S3 Compatible",
    status: "Active",
  },
  {
    title: "GitHub Workflows & CI/CD",
    category: "CI/CD & Delivery",
    description: "Automated test suites, container builds, and branch verification pipelines.",
    href: "https://github.com/Yorkstead-Systems/yorkstead/actions",
    icon: GitBranch,
    badge: "Actions",
    status: "Active",
  },
  {
    title: "Resend Email Infrastructure",
    category: "Communications",
    description: "Transactional notifications, deliverability telemetry, and API key provisioning.",
    href: "https://resend.com",
    icon: Mail,
    badge: "API Mail",
    status: "Operational",
  },
  {
    title: "Spaceship Console & Spacemail",
    category: "Communications",
    description: "Domain DNS authority and brandon@yorkstead.com founder mailbox management.",
    href: "https://www.spaceship.com/application/sp-launchpad/",
    icon: Shield,
    badge: "Spacemail",
    status: "Active",
  },
  {
    title: "Cloudflare Pages & Edge",
    category: "Edge & Networking",
    description: "Serverless edge hosting for yorkstead.com and ops.yorkstead.com with zero egress fees.",
    href: "https://dash.cloudflare.com/?to=/:account/pages",
    icon: Cloud,
    badge: "Edge Deploy",
    status: "Active",
  },
];

export function CloudInfrastructureHub() {
  const [filter, setFilter] = React.useState<string>("All");

  const categories = ["All", "Cloud Compute", "Database & Storage", "Edge & Networking", "Communications", "CI/CD & Delivery"];

  const filtered = filter === "All"
    ? CLOUD_SERVICES
    : CLOUD_SERVICES.filter((s) => s.category === filter);

  return (
    <Card className="border-border bg-card/80 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <CardTitle className="text-base font-bold tracking-tight">
                Cloud Infrastructure & DevOps Hub
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Direct access to live cloud consoles, serverless databases, edge networks, and deployments.
            </CardDescription>
          </div>

          <Badge variant="outline" className="w-fit gap-1.5 border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            <span>All Systems Green</span>
          </Badge>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-2.5 py-1 font-mono text-[10px] transition ${
                filter === cat
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((service) => {
          const Icon = service.icon;
          return (
            <a
              key={service.title}
              href={service.href}
              target="_blank"
              rel="noreferrer"
              className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-background/50 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-background/80 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-4" />
                  </div>
                  <Badge variant="secondary" className="font-mono text-[9px]">
                    {service.badge}
                  </Badge>
                </div>

                <div className="mt-3 font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {service.status}
                </span>
                <span className="inline-flex items-center gap-0.5 text-primary opacity-0 transition group-hover:opacity-100">
                  Launch <ExternalLink className="size-3" />
                </span>
              </div>
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}
