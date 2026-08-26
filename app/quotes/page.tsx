import { QuoteFlowWorkspace } from "@/components/quoting/quoteflow-workspace";

export const metadata = {
  title: "QuoteFlow & Estimating | Yorkstead Operations",
  description: "Cost breakdown modeling, margin governance, revisions, and one-click quote-to-job conversion.",
};

export default function QuotesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <QuoteFlowWorkspace />
    </div>
  );
}
