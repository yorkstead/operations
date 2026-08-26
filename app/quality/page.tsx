import { QualityWorkspace } from "@/components/quality/quality-workspace";

export const metadata = {
  title: "Quality Assurance & NCR | Yorkstead Operations",
  description: "Inspection plans, pass/fail capture, non-conformance reports, and yield analytics.",
};

export default function QualityPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <QualityWorkspace />
    </div>
  );
}
