import { PurchasingWorkspace } from "@/components/purchasing/purchasing-workspace";

export const metadata = {
  title: "Purchasing & Material Sourcing | Yorkstead Operations",
  description: "Material shortage signals, purchase orders, spend approval thresholds, and receiving handoffs.",
};

export default function PurchasingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PurchasingWorkspace />
    </div>
  );
}
