import { PacketWorkspace } from "@/components/packet-intelligence/packet-workspace";

export const metadata = {
  title: "Job Packet Intelligence | Yorkstead Operations",
  description: "Secure job document ingestion, revision inconsistency detection, and department packet assembly.",
};

export default function JobPacketsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PacketWorkspace />
    </div>
  );
}
