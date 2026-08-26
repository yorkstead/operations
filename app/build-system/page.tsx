import { BuildYourSystemView } from "@/components/sales/build-your-system-view";

export const metadata = {
  title: "Build Your Operational System | Yorkstead Operations",
  description: "Interactive system configurator to evaluate modules, roles, integrations, and phased implementation blueprints.",
};

export default function BuildSystemPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <BuildYourSystemView />
    </div>
  );
}
