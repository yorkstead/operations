import { ShopfloorTerminal } from "@/components/shopfloor/shopfloor-terminal";

export const metadata = {
  title: "Shopfloor Terminal & Digital Traveler | Yorkstead Operations",
  description: "Mobile operator execution terminal, digital traveler routing, and dispatch board.",
};

export default function ShopfloorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ShopfloorTerminal />
    </div>
  );
}
