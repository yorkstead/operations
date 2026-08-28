import * as React from "react";
import { notFound } from "next/navigation";
import { engagementService } from "@/modules/engagements/application/engagement-service";
import { EngagementWorkspace } from "@/components/engagements/engagement-workspace";
import { resolveServerSession } from "@/modules/core/application/server-session";

export const metadata = {
  title: "Client Engagement Workspace | Yorkstead Operations",
  description: "Detailed client software project deliverable checklist, staging environment, and file vault.",
};

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionResult = await resolveServerSession();
  const session = sessionResult.sessionContext;

  if (!session) {
    notFound();
  }

  let engagement;
  try {
    engagement = engagementService.getEngagementById(session, id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <EngagementWorkspace engagement={engagement} />
    </div>
  );
}
