import * as React from "react";
import { redirect } from "next/navigation";
import { ProjectManagementDashboard } from "@/components/projects/project-management-dashboard";
import { Badge } from "@/components/ui/badge";
import { ownerLoginPath } from "@/lib/owner-routes";
import { resolveOwnerSession } from "@/modules/core/application/server-session";

export const metadata = {
  title: "Projects & Delivery Command Center | Yorkstead Operations",
  description: "Comprehensive operational project management dashboard, milestone tracking, staging environments, and client deliverables.",
};

export default async function ProjectsPage() {
  const { sessionContext } = await resolveOwnerSession();
  if (!sessionContext) redirect(ownerLoginPath("/projects"));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono text-[9px] uppercase tracking-widest">
              COMMAND CENTER
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">Yorkstead Project Portfolio</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground mt-1">
            Projects & Delivery Command Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time project health, milestone checklists, capital deployment tracking, and direct staging links.
          </p>
        </div>
      </div>

      <ProjectManagementDashboard />
    </div>
  );
}
