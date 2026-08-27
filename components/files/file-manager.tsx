'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileUp, FileText, Download, ShieldAlert, CheckCircle2, HardDrive, X } from "lucide-react";
import { StoredFile } from "@/modules/core/domain/ports/file-storage-port";

export function FileManager() {
  const [files, setFiles] = React.useState<StoredFile[]>([]);
  const [metrics, setMetrics] = React.useState({
    totalFilesCount: 0,
    cleanFilesCount: 0,
    quarantinedFilesCount: 0,
    totalStorageBytes: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchFiles = React.useCallback(async () => {
    try {
      const [fRes, mRes] = await Promise.all([
        fetch("/api/files"),
        fetch("/api/files/metrics"),
      ]);

      if (fRes.ok) {
        const data = await fRes.json();
        setFiles(data.files || []);
      }
      if (mRes.ok) {
        const data = await mRes.json();
        setMetrics(data.metrics || {
          totalFilesCount: 0,
          cleanFilesCount: 0,
          quarantinedFilesCount: 0,
          totalStorageBytes: 0,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load document vault." });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void fetchFiles(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchFiles]);

  const handleDownload = async (file: StoredFile) => {
    try {
      const res = await fetch(`/api/files/${file.id}/download`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate download URL");
      }
      const downloadLink = document.createElement("a");
      downloadLink.href = `/api/files/${file.id}/download`;
      downloadLink.download = file.filename;
      downloadLink.click();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Download failed" });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const checksumSha256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await file.arrayBuffer())))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          checksumSha256,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload preparation failed");
      }

      const prepared = await res.json();
      const uploadResponse = await fetch(prepared.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("Object storage rejected the upload.");
      const completionResponse = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: prepared.fileRecord.id }),
      });
      if (!completionResponse.ok) throw new Error("Upload completion verification failed.");

      setFeedback({ type: "success", message: `File ${file.name} uploaded. Security scan is pending.` });
      fetchFiles();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Upload failed" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">OPERATIONS//DOCUMENT_VAULT</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Technical Drawings, Job Packets & Certified Attachments
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            File Storage & Document Vault
          </h1>
          <p className="text-sm text-muted-foreground">
            Encrypted object storage, authorized expiring signed URLs, and tenant-isolated attachments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleUpload} />
            <span className="inline-flex items-center justify-center rounded-md text-xs font-mono font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3">
              <FileUp className="mr-1.5 size-3.5" />
              Upload Document
            </span>
          </label>
        </div>
      </div>

      {/* Notification Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg border p-3 font-mono text-xs ${
            feedback.type === "success"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFeedback(null)} className="size-6 p-0">
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Total Files Stored</span>
            <FileText className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.totalFilesCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Clean / Active Files</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">{metrics.cleanFilesCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">Vault Storage Consumed</span>
            <HardDrive className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            {(metrics.totalStorageBytes / 1024 / 1024).toFixed(2)} MB
          </p>
        </Card>
      </div>

      {/* File Registry Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <HardDrive className="size-5" />
            <CardTitle className="text-base">Document Vault Registry</CardTitle>
          </div>
          <CardDescription>All stored technical drawings, certificates, and job attachments.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex min-h-[25vh] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Loading document vault...</span>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex min-h-[20vh] flex-col items-center justify-center p-8 text-center">
              <FileText className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-sm text-foreground">Zero Files in Vault</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Upload CAD drawings, PDF job specifications, or material test reports to begin.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {files.map((file) => (
                <div key={file.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <span className="font-mono text-xs font-bold text-foreground">{file.filename}</span>
                      <Badge variant="outline" className="font-mono text-[9px] uppercase">
                        {file.mimeType}
                      </Badge>
                      <Badge
                        variant={file.status === "clean" ? "default" : "outline"}
                        className={`font-mono text-[9px] uppercase ${
                          file.status === "quarantined" ? "border-destructive text-destructive" : ""
                        }`}
                      >
                        {file.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground pt-1">
                      <span>Size: {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                      <span>&bull;</span>
                      <span>Key: {file.storageKey}</span>
                      <span>&bull;</span>
                      <span>Uploaded: {file.createdAt.split("T")[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant={file.status === "quarantined" ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={file.status === "quarantined"}
                      className="font-mono text-xs"
                    >
                      {file.status === "quarantined" ? (
                        <>
                          <ShieldAlert className="mr-1.5 size-3.5 text-destructive" />
                          Quarantined
                        </>
                      ) : (
                        <>
                          <Download className="mr-1.5 size-3.5" />
                          Expiring URL
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
