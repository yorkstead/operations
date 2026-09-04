import { KnowledgeHub } from "@/components/knowledge/knowledge-hub";

export const metadata = {
  title: "Notion Knowledge OS & Shopfloor KnowHow | Yorkstead Operations",
  description: "Live Yorkstead Knowledge OS, Notion workspace sync, CRM client dossiers, product specs, and shopfloor procedures.",
};

export default function KnowledgePage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      <KnowledgeHub />
    </div>
  );
}
