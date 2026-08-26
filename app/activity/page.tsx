import { ActivityFeed } from "@/components/activity/activity-feed";

export const metadata = {
  title: "Activity & Audit Logs | Yorkstead Operations",
  description: "Tenant-scoped immutable operational activity history.",
};

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ActivityFeed />
    </div>
  );
}
