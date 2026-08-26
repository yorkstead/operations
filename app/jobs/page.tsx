import { JobsListWorkspace } from "@/components/jobs/jobs-list-workspace";

export const metadata = {
  title: "Jobs & Work Orders | Yorkstead Operations",
  description: "Work order aggregate, revisions, customer links, and guarded workflow progression.",
};

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JobsListWorkspace />
    </div>
  );
}
