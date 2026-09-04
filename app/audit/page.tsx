import { redirect } from "next/navigation";
import { AuditAssessmentView } from "@/components/audit/audit-assessment-view";
import { ownerLoginPath } from "@/lib/owner-routes";
import { resolveOwnerSession } from "@/modules/core/application/server-session";

export const metadata = {
  title: "Workflow Audit Diagnostic | Yorkstead Operations",
  description: "Internal operational friction evaluation and phased recommendation engine.",
};

export default async function AuditPage() {
  const { sessionContext } = await resolveOwnerSession();
  if (!sessionContext) redirect(ownerLoginPath("/audit"));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AuditAssessmentView />
    </div>
  );
}
