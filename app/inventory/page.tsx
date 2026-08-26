import { InventoryWorkspace } from "@/components/inventory/inventory-workspace";

export const metadata = {
  title: "Inventory & Material Ledger | Yorkstead Operations",
  description: "Immutable transaction ledger, negative stock policy, receiving, and lot traceability.",
};

export default function InventoryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <InventoryWorkspace />
    </div>
  );
}
