import { redirect } from "next/navigation";
import { KnowledgeHub } from "@/components/knowledge/knowledge-hub";
import { ownerLoginPath } from "@/lib/owner-routes";
import { resolveOwnerSession } from "@/modules/core/application/server-session";

export const metadata = {
  title: "Notion Knowledge OS & Shopfloor KnowHow | Yorkstead Operations",
  description: "Live Yorkstead Knowledge OS, Notion workspace sync, CRM client dossiers, product specs, and shopfloor procedures.",
};

export default async function KnowledgePage() {
  const { sessionContext } = await resolveOwnerSession();
  if (!sessionContext) redirect(ownerLoginPath("/knowledge"));

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      <KnowledgeHub />
    </div>
  );
}
