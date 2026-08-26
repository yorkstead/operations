import { MasterDataWorkspace } from "@/components/master-data/master-data-workspace";

export const metadata = {
  title: "Customers, Vendors & Facilities | Yorkstead Operations",
  description: "Shared master records for customer accounts, suppliers, contacts, and facility locations.",
};

export default function DirectoryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <MasterDataWorkspace />
    </div>
  );
}
