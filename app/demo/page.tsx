import { DemoHub } from "@/components/demo/demo-hub";

export const metadata = {
  title: "Deterministic Demo Environments | Yorkstead Operations",
  description: "Explore interactive operational demo scenarios with deterministic synthetic fixtures.",
};

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DemoHub />
    </div>
  );
}
