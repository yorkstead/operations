import * as React from "react";
import { CloudInfrastructureHub } from "@/components/cockpit/cloud-infrastructure-hub";
import { OperatorEmailHub } from "@/components/cockpit/operator-email-hub";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Cloud Infrastructure & DevOps | Yorkstead Operations",
  description: "Direct control center for Cloudflare, Cloud Run, Neon Postgres, GitHub Actions, and Spaceship email.",
};

export default function InfrastructurePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono text-[9px] uppercase">
              DEVOPS & CLOUD
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">Yorkstead Systems Control Plane</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground mt-1">
            Infrastructure & Cloud Operations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage production container compute, edge networking, relational databases, email routes, and CI/CD pipelines.
          </p>
        </div>
      </div>

      {/* Operator Email Hub */}
      <OperatorEmailHub email="brandon@yorkstead.com" />

      {/* Cloud Infrastructure Matrix */}
      <CloudInfrastructureHub />
    </div>
  );
}
