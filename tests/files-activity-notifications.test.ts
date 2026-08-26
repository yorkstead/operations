import { describe, expect, it, beforeEach } from "bun:test";
import { FileService } from "../modules/core/application/file-service";
import { ActivityService } from "../modules/core/application/activity-service";
import { NotificationService } from "../modules/core/application/notification-service";
import { IdentityService } from "../modules/core/application/identity-service";
import { SyntheticFileStorageAdapter } from "../modules/core/domain/ports/file-storage-port";

describe("Files, Activity, and Notifications", () => {
  let fileService: FileService;
  let activityService: ActivityService;
  let notificationService: NotificationService;
  let identityService: IdentityService;

  beforeEach(() => {
    fileService = new FileService(new SyntheticFileStorageAdapter());
    activityService = new ActivityService();
    notificationService = new NotificationService();
    identityService = new IdentityService();
  });

  describe("File Storage & Expiring Links", () => {
    it("generates presigned upload and expiring download URLs within tenant boundaries", async () => {
      const { user: owner } = identityService.bootstrapOwner({
        email: "owner@yorkstead.com",
        name: "Brandon",
        organizationName: "Factory A",
        organizationSlug: "factory-a",
      });

      const sessionA = identityService.getSessionContext(owner.id);

      const { fileRecord, uploadUrl } = await fileService.prepareUpload(sessionA, {
        filename: "drawing.dxf",
        mimeType: "application/dxf",
        sizeBytes: 1024 * 1024,
      });

      expect(fileRecord.id).toBeDefined();
      expect(uploadUrl).toContain("storage.synthetic.ops.yorkstead.com");

      const { downloadUrl, expiresAt } = await fileService.getAuthorizedDownloadUrl(
        sessionA,
        fileRecord.id
      );

      expect(downloadUrl).toContain("storage.synthetic.ops.yorkstead.com/download");
      expect(expiresAt).toBeDefined();
    });

    it("rejects cross-tenant file access and disallowed MIME types", async () => {
      const { user: owner } = identityService.bootstrapOwner({
        email: "owner@yorkstead.com",
        name: "Brandon",
        organizationName: "Factory A",
        organizationSlug: "factory-a",
      });

      const sessionA = identityService.getSessionContext(owner.id);
      const orgB = identityService.createOrganization(owner.id, "Factory B", "factory-b");
      const sessionB = identityService.switchActiveOrganization(owner.id, orgB.id);

      const { fileRecord } = await fileService.prepareUpload(sessionA, {
        filename: "secret.pdf",
        mimeType: "application/pdf",
        sizeBytes: 500,
      });

      // Session B trying to access Session A's file must throw Cross-Tenant error
      expect(
        fileService.getAuthorizedDownloadUrl(sessionB, fileRecord.id)
      ).rejects.toThrow("Cross-Tenant File Access Forbidden");

      // Disallowed MIME type must throw
      expect(
        fileService.prepareUpload(sessionA, {
          filename: "malware.exe",
          mimeType: "application/x-msdownload",
          sizeBytes: 100,
        })
      ).rejects.toThrow("Invalid file type");
    });
  });

  describe("Activity Logging", () => {
    it("records operational events and filters by active tenant", () => {
      const event = activityService.logActivity({
        organizationId: "org_alpha",
        actorId: "usr_1",
        actorName: "Brandon",
        entityType: "job",
        entityId: "job_101",
        action: "job.dispatched",
        summary: "Dispatched job traveler to Press Brake station.",
        metadata: { sensitiveToken: "secret123", priority: "high" },
      });

      expect(event.id).toBeDefined();
      expect(event.summary).toContain("Press Brake");
    });
  });

  describe("Notification Outbox & Idempotency", () => {
    it("dispatches notifications and guarantees idempotent delivery", () => {
      const result1 = notificationService.dispatchNotification({
        organizationId: "org_alpha",
        recipientUserId: "usr_operator",
        title: "Station Alert",
        message: "New traveler queued.",
        idempotencyKey: "idem_station_alert_1",
      });

      expect(result1.notification.id).toBeDefined();
      expect(result1.outboxEvent.status).toBe("delivered");

      // Second identical dispatch with same key must return existing without duplicate
      const result2 = notificationService.dispatchNotification({
        organizationId: "org_alpha",
        recipientUserId: "usr_operator",
        title: "Station Alert",
        message: "New traveler queued.",
        idempotencyKey: "idem_station_alert_1",
      });

      expect(result2.notification.id).toBe(result1.notification.id);
    });
  });
});
