import * as React from "react";
import { redirect } from "next/navigation";
import { RunningProjectsHub } from "@/components/cockpit/running-projects-hub";
import { FocusBriefing } from "@/components/cockpit/focus-briefing";
import { QuickLinksHub } from "@/components/cockpit/quick-links-hub";
import { OperatorCalendar } from "@/components/cockpit/operator-calendar";
import { TaskDeliveryEngine } from "@/components/cockpit/task-delivery-engine";
import { PressureMap } from "@/components/cockpit/pressure-map";
import { OperatorEmailHub } from "@/components/cockpit/operator-email-hub";
import { CloudInfrastructureHub } from "@/components/cockpit/cloud-infrastructure-hub";
import { ownerLoginPath } from "@/lib/owner-routes";
import { resolveOwnerSession } from "@/modules/core/application/server-session";

export const metadata = {
  title: "Yorkstead Operations | Executive Cockpit",
  description: "Proprietary command center and ERP for Yorkstead Systems software solutions and automated workflows.",
};

export default async function HomePage() {
  const { sessionContext } = await resolveOwnerSession();
  if (!sessionContext) redirect(ownerLoginPath("/"));

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* 0. Running Projects Hub */}
      <RunningProjectsHub />

      {/* 1. Operator Focus Briefing */}
      <FocusBriefing operatorName="Brandon" />

      {/* 2. Command Center Quicklinks */}
      <QuickLinksHub />

      {/* 3. Operator Email Hub */}
      <OperatorEmailHub email="brandon@yorkstead.com" />

      {/* 4. Task Delivery Engine & Velocity Pressure Map */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskDeliveryEngine />
        </div>
        <div>
          <PressureMap />
        </div>
      </div>

      {/* 5. Operator Delivery & Milestone Calendar */}
      <OperatorCalendar />

      {/* 6. Cloud Infrastructure & DevOps Hub */}
      <CloudInfrastructureHub />
    </div>
  );
}
