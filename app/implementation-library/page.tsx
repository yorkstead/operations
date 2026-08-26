import { ImplementationLibraryView } from "@/components/implementation-library/library-view";

export const metadata = {
  title: "Implementation Library | Yorkstead Operations",
  description: "Reusable discovery scoping, workflow maps, acceptance checklists, rate schemas, and operational runbooks.",
};

export default function ImplementationLibraryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ImplementationLibraryView />
    </div>
  );
}
