import { redirect } from "next/navigation";
import { FileManager } from "@/components/files/file-manager";
import { ownerLoginPath } from "@/lib/owner-routes";
import { resolveOwnerSession } from "@/modules/core/application/server-session";

export const metadata = {
  title: "Private File Storage | Yorkstead Operations",
  description: "Secure tenant storage with expiring presigned download links.",
};

export default async function FilesPage() {
  const { sessionContext } = await resolveOwnerSession();
  if (!sessionContext) redirect(ownerLoginPath("/files"));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FileManager />
    </div>
  );
}
