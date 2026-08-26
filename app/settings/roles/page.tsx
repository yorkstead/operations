import { RolesCapabilitiesWorkspace } from "@/components/identity/roles-capabilities-workspace";

export const metadata = {
  title: "Roles & Capabilities | Yorkstead Operations",
  description: "Server-side capability matrix and least-privilege authorization policies.",
};

export default function RolesSettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RolesCapabilitiesWorkspace />
    </div>
  );
}
