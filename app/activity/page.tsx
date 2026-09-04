import { redirect } from "next/navigation";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { ownerLoginPath } from "@/lib/owner-routes";
import { resolveOwnerSession } from "@/modules/core/application/server-session";

export const metadata = {
  title: "Activity & Audit Logs | Yorkstead Operations",
  description: "Tenant-scoped immutable operational activity history.",
};

export default async function ActivityPage() {
  const { sessionContext } = await resolveOwnerSession();
  if (!sessionContext) redirect(ownerLoginPath("/activity"));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ActivityFeed />
    </div>
  );
}
