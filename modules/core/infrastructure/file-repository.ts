import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { fileVaultRecords, auditEvents } from "@/db/schema";
import { StoredFile, FileStatus } from "../domain/ports/file-storage-port";
import { SessionContext } from "../domain/types";

export interface FileMetricsSummary {
  totalFilesCount: number;
  cleanFilesCount: number;
  quarantinedFilesCount: number;
  totalStorageBytes: number;
}

export class FileRepository {
  async ensureSeededData(session: SessionContext): Promise<void> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const existing = await db
      .select({ id: fileVaultRecords.id })
      .from(fileVaultRecords)
      .where(eq(fileVaultRecords.organizationId, orgId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(fileVaultRecords).values([
        {
          id: `fil_${Date.now()}_1`,
          organizationId: orgId,
          uploadedByUserId: session.user.id,
          uploadedByName: session.user.name,
          filename: "front-range-laser-cutting-cad.dxf",
          mimeType: "application/dxf",
          sizeBytes: 4404019, // 4.2 MB
          storageKey: `tenants/${orgId}/vault/seed_front-range-laser-cutting-cad.dxf`,
          status: "pending_scan",
          entityType: "job",
          entityId: "job_104",
        },
        {
          id: `fil_${Date.now()}_2`,
          organizationId: orgId,
          uploadedByUserId: session.user.id,
          uploadedByName: session.user.name,
          filename: "work-center-capacity-study.csv",
          mimeType: "text/csv",
          sizeBytes: 348160, // 340 KB
          storageKey: `tenants/${orgId}/vault/seed_work-center-capacity-study.csv`,
          status: "clean",
        },
      ]);
    }
  }

  // 1. List Files
  async listFiles(
    session: SessionContext,
    options?: { status?: string; entityType?: string; entityId?: string; limit?: number; offset?: number }
  ): Promise<StoredFile[]> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    let query = db
      .select()
      .from(fileVaultRecords)
      .where(
        and(
          eq(fileVaultRecords.organizationId, orgId),
          sql`${fileVaultRecords.status} != 'deleted'`
        )
      )
      .orderBy(desc(fileVaultRecords.createdAt))
      .limit(limit)
      .offset(offset);

    if (options?.status) {
      query = db
        .select()
        .from(fileVaultRecords)
        .where(
          and(
            eq(fileVaultRecords.organizationId, orgId),
            eq(fileVaultRecords.status, options.status)
          )
        )
        .orderBy(desc(fileVaultRecords.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const rows = await query;
    return rows.map(this.mapFile);
  }

  // 2. Get Single File
  async getFile(session: SessionContext, id: string): Promise<StoredFile> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(fileVaultRecords)
      .where(
        and(
          eq(fileVaultRecords.organizationId, orgId),
          eq(fileVaultRecords.id, id)
        )
      )
      .limit(1);

    if (rows.length === 0) {
      throw new Error(`File '${id}' not found in active organization.`);
    }

    return this.mapFile(rows[0]);
  }

  // 3. Save Uploaded File Record
  async saveFileRecord(
    session: SessionContext,
    params: {
      filename: string;
      mimeType: string;
      sizeBytes: number;
      storageKey: string;
      checksumSha256?: string;
      entityType?: string;
      entityId?: string;
    }
  ): Promise<StoredFile> {
    const db = getDb();
    const orgId = session.activeOrganization.id;
    const id = `fil_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return await db.transaction(async (tx) => {
      const [record] = await tx
        .insert(fileVaultRecords)
        .values({
          id,
          organizationId: orgId,
          uploadedByUserId: session.user.id,
          uploadedByName: session.user.name,
          filename: params.filename,
          mimeType: params.mimeType,
          sizeBytes: params.sizeBytes,
          storageKey: params.storageKey,
          checksumSha256: params.checksumSha256 || null,
          status: "clean",
          entityType: params.entityType || null,
          entityId: params.entityId || null,
        })
        .returning();

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "file",
        entityId: id,
        action: "file.upload_prepared",
        summary: `Prepared upload for ${params.filename} (${(params.sizeBytes / 1024 / 1024).toFixed(2)} MB)`,
        metadata: { filename: params.filename, sizeBytes: params.sizeBytes, storageKey: params.storageKey },
      });

      return this.mapFile(record);
    });
  }

  async completeUpload(params: {
    organizationId: string;
    fileId: string;
    storageKey: string;
    sizeBytes: number;
    mimeType: string;
  }): Promise<void> {
    const db = getDb();
    await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(fileVaultRecords)
        .where(and(eq(fileVaultRecords.organizationId, params.organizationId), eq(fileVaultRecords.id, params.fileId)))
        .for("update");
      const file = rows[0];
      if (!file || file.status !== "pending_scan") throw new Error("Upload record is missing or no longer pending.");
      if (file.storageKey !== params.storageKey || file.sizeBytes !== params.sizeBytes || file.mimeType !== params.mimeType) {
        throw new Error("Uploaded object metadata does not match the authorized file record.");
      }
      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: params.organizationId,
        actorId: file.uploadedByUserId,
        actorName: file.uploadedByName,
        entityType: "file",
        entityId: file.id,
        action: "file.upload_completed",
        summary: `Completed private upload for ${file.filename}; malware scan remains pending.`,
        metadata: { filename: file.filename, sizeBytes: file.sizeBytes, storageKey: file.storageKey },
      });
    });
  }

  // 4. Quarantine File
  async quarantineFile(
    session: SessionContext,
    id: string,
    reason: string
  ): Promise<StoredFile> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(fileVaultRecords)
        .where(
          and(
            eq(fileVaultRecords.organizationId, orgId),
            eq(fileVaultRecords.id, id)
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`File '${id}' not found.`);
      }

      const file = rows[0];
      const now = new Date();

      const [updated] = await tx
        .update(fileVaultRecords)
        .set({
          status: "quarantined",
          quarantineReason: reason.trim(),
          updatedAt: now,
        })
        .where(eq(fileVaultRecords.id, file.id))
        .returning();

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: file.id,
        action: "file.quarantined",
        summary: `Quarantined file ${file.filename} (Reason: ${reason})`,
        metadata: { filename: file.filename, reason },
      });

      return this.mapFile(updated);
    });
  }

  // 5. Soft Delete File
  async deleteFile(session: SessionContext, id: string): Promise<boolean> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    return await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(fileVaultRecords)
        .where(
          and(
            eq(fileVaultRecords.organizationId, orgId),
            eq(fileVaultRecords.id, id)
          )
        )
        .for("update");

      if (rows.length === 0) {
        throw new Error(`File '${id}' not found.`);
      }

      const file = rows[0];
      const now = new Date();

      await tx
        .update(fileVaultRecords)
        .set({
          status: "deleted",
          updatedAt: now,
        })
        .where(eq(fileVaultRecords.id, file.id));

      await tx.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: orgId,
        actorId: session.user.id,
        actorName: session.user.name,
        entityType: "job",
        entityId: file.id,
        action: "file.deleted",
        summary: `Deleted file ${file.filename}`,
        metadata: { filename: file.filename },
      });

      return true;
    });
  }

  // 6. Metrics Summary
  async getMetrics(session: SessionContext): Promise<FileMetricsSummary> {
    const db = getDb();
    const orgId = session.activeOrganization.id;

    const rows = await db
      .select()
      .from(fileVaultRecords)
      .where(
        and(
          eq(fileVaultRecords.organizationId, orgId),
          sql`${fileVaultRecords.status} != 'deleted'`
        )
      );

    const clean = rows.filter((r) => r.status === "clean");
    const quarantined = rows.filter((r) => r.status === "quarantined");
    const totalBytes = rows.reduce((acc, r) => acc + r.sizeBytes, 0);

    return {
      totalFilesCount: rows.length,
      cleanFilesCount: clean.length,
      quarantinedFilesCount: quarantined.length,
      totalStorageBytes: totalBytes,
    };
  }

  private mapFile(f: typeof fileVaultRecords.$inferSelect): StoredFile {
    return {
      id: f.id,
      organizationId: f.organizationId,
      uploadedByUserId: f.uploadedByUserId,
      filename: f.filename,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
      storageKey: f.storageKey,
      status: f.status as FileStatus,
      quarantineReason: f.quarantineReason || undefined,
      createdAt: f.createdAt.toISOString(),
    };
  }
}

export const fileRepository = new FileRepository();
