import * as React from "react";
import { engagementService } from "@/modules/engagements/application/engagement-service";
import { EngagementsListView } from "@/components/engagements/engagements-list-view";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Client Engagements | Yorkstead Operations",
  description: "Client software solution projects, architecture reviews, and automated workflow delivery.",
};

export default async function EngagementsPage() {
  const sessionResult = await resolveServerSession();
  const session = sessionResult.sessionContext;

  const engagements = session
    ? engagementService.listEngagements(session)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono text-[9px] uppercase">
              CONSULTING & DELIVERY
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">Yorkstead Systems Client Engagements</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground mt-1">
            Client Engagements & Software Delivery
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage custom software projects, architecture scoping, staging deployments, and SOW milestone checklists.
          </p>
        </div>
      </div>

      <EngagementsListView initialEngagements={engagements} />
    </div>
  );
}
