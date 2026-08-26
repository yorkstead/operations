import { FileManager } from "@/components/files/file-manager";

export const metadata = {
  title: "Private File Storage | Yorkstead Operations",
  description: "Secure tenant storage with expiring presigned download links.",
};

export default function FilesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FileManager />
    </div>
  );
}
