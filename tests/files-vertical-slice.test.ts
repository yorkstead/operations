import { describe, expect, it } from "bun:test";
import { FileService } from "../modules/core/application/file-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const fileService = new FileService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "cad_engineer@acme.com",
  name: "CAD Engineer",
  organizationName: "Acme Manufacturing",
  organizationSlug: "acme-mfg",
});

identityService.createOrganization(userA.id, "Rival Factory", "rival-factory");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("File Storage & Document Vault Vertical Slice: Presigned Uploads, Expiring URLs & IDOR", () => {
  let createdFileId: string;

  it("prepares a presigned upload URL and creates clean file record in vault", async () => {
    const { fileRecord, uploadUrl, expiresAt } = await fileService.prepareUpload(tenantA, {
      filename: "bracket-3d-model.step",
      mimeType: "application/step",
      sizeBytes: 5242880, // 5MB
    });

    createdFileId = fileRecord.id;
    expect(fileRecord.id).toContain("fil_");
    expect(fileRecord.filename).toBe("bracket-3d-model.step");
    expect(fileRecord.status).toBe("clean");
    expect(uploadUrl).toContain("https://storage.synthetic.ops.yorkstead.com/upload");
    expect(expiresAt).toBeDefined();
  });

  it("generates authorized expiring download URL for clean file", async () => {
    const { downloadUrl, expiresAt, filename } = await fileService.getAuthorizedDownloadUrl(tenantA, createdFileId);
    expect(downloadUrl).toContain("https://storage.synthetic.ops.yorkstead.com/download");
    expect(filename).toBe("bracket-3d-model.step");
    expect(expiresAt).toBeDefined();
  });

  it("quarantines file and blocks download attempts with security exception", async () => {
    const quarantined = fileService.quarantineFile(tenantA, createdFileId, "Malicious script signature detected in drawing payload");
    expect(quarantined.status).toBe("quarantined");

    expect(async () => {
      await fileService.getAuthorizedDownloadUrl(tenantA, createdFileId);
    }).toThrow("File access blocked: Quarantined");
  });

  it("strictly enforces tenant boundary and denies cross-tenant file lookups (IDOR)", async () => {
    expect(async () => {
      await fileService.getAuthorizedDownloadUrl(tenantB, createdFileId);
    }).toThrow("Cross-Tenant File Access Forbidden");
  });
});
