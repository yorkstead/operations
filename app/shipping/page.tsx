import { ShippingWorkspace } from "@/components/shipping/shipping-workspace";

export const metadata = {
  title: "Shipping & Load Builder | Yorkstead Operations",
  description: "Shipment manifests, carrier assignment, bills of lading, and proof of delivery tracking.",
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ShippingWorkspace />
    </div>
  );
}
