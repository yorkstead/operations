import { AnalyticsWorkspace } from "@/components/analytics/analytics-workspace";

export const metadata = {
  title: "Analytics & Operational Planning | Yorkstead Operations",
  description: "Governed factory KPIs, capacity signals, and owner needs-attention queue.",
};

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AnalyticsWorkspace />
    </div>
  );
}
