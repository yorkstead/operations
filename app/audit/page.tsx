import { AuditAssessmentView } from "@/components/audit/audit-assessment-view";

export const metadata = {
  title: "Workflow Audit Diagnostic | Yorkstead Operations",
  description: "Internal operational friction evaluation and phased recommendation engine.",
};

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AuditAssessmentView />
    </div>
  );
}
