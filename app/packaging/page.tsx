import { PackagingWorkspace } from "@/components/packaging/packaging-workspace";

export const metadata = {
  title: "Packaging & Palletization | Yorkstead Operations",
  description: "Packaging specifications, container packing, gross weight capacity, and shipping readiness.",
};

export default function PackagingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PackagingWorkspace />
    </div>
  );
}
