import { KnowledgeHub } from "@/components/knowledge/knowledge-hub";

export const metadata = {
  title: "Knowledge Vault & KnowHow | Yorkstead Operations",
  description: "Live Obsidian knowledge vault, client dossiers, daily activity logs, and shopfloor procedures.",
};

export default function KnowledgePage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      <KnowledgeHub />
    </div>
  );
}
