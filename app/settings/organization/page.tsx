import { OrganizationWorkspace } from "@/components/identity/organization-workspace";

export const metadata = {
  title: "Organization & Memberships | Yorkstead Operations",
  description: "Manage tenant organizations, memberships, roles, and invitation security.",
};

export default function OrganizationSettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <OrganizationWorkspace />
    </div>
  );
}
