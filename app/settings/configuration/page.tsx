import { ConfigurationWorkspace } from "@/components/config/configuration-workspace";

export const metadata = {
  title: "Configuration & Entitlements | Yorkstead Operations",
  description: "Versioned organization settings, module entitlements, terminology mappings, and workflow policies.",
};

export default function ConfigurationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ConfigurationWorkspace />
    </div>
  );
}
