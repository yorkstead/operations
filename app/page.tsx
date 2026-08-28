import * as React from "react";
import { FocusBriefing } from "@/components/cockpit/focus-briefing";
import { TaskDeliveryEngine } from "@/components/cockpit/task-delivery-engine";
import { PressureMap } from "@/components/cockpit/pressure-map";
import { OperatorEmailHub } from "@/components/cockpit/operator-email-hub";
import { CloudInfrastructureHub } from "@/components/cockpit/cloud-infrastructure-hub";

export const metadata = {
  title: "Yorkstead Operations | Executive Cockpit",
  description: "Proprietary command center and ERP for Yorkstead Systems software solutions and automated workflows.",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* 1. Operator Focus Briefing */}
      <FocusBriefing operatorName="Brandon" />

      {/* 2. Operator Email Hub */}
      <OperatorEmailHub email="brandon@yorkstead.com" />

      {/* 3. Task Delivery Engine & Velocity Pressure Map */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskDeliveryEngine />
        </div>
        <div>
          <PressureMap />
        </div>
      </div>

      {/* 4. Cloud Infrastructure & DevOps Hub */}
      <CloudInfrastructureHub />
    </div>
  );
}
