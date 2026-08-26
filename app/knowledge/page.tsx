import { KnowHowWorkspace } from "@/components/knowledge/knowhow-workspace";

export const metadata = {
  title: "KnowHow & Standard Procedures | Yorkstead Operations",
  description: "Standard operating procedures, versioned knowledge articles, and citation-backed shopfloor guidance.",
};

export default function KnowledgePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <KnowHowWorkspace />
    </div>
  );
}
