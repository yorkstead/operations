import { MaintenanceWorkspace } from "@/components/maintenance/maintenance-workspace";

export const metadata = {
  title: "Equipment Maintenance & Downtime | Yorkstead Operations",
  description: "Asset tracking, PM schedules, downtime intervals, and return-to-service authorization.",
};

export default function MaintenancePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <MaintenanceWorkspace />
    </div>
  );
}
