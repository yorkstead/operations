import { describe, expect, it } from "bun:test";
import { PacketIntelligenceService } from "../modules/packet-intelligence/application/packet-intelligence-service";
import { IdentityService } from "../modules/core/application/identity-service";

const identityService = new IdentityService();
const packetService = new PacketIntelligenceService();

const { user: userA, organization: orgA } = identityService.bootstrapOwner({
  email: "lead_engineer@acme.com",
  name: "Lead Engineer",
  organizationName: "Acme Aerospace",
  organizationSlug: "acme-aerospace",
});

identityService.createOrganization(userA.id, "Rival Factory", "rival-factory");
const tenantB = identityService.getSessionContext(userA.id);
const tenantA = identityService.switchActiveOrganization(userA.id, orgA.id);

describe("Packet Intelligence Vertical Slice: Ingestion, Discrepancy Auditing, Approval & IDOR", () => {
  let createdDocId: string;

  it("ingests technical drawing document into job packet", () => {
    const doc = packetService.ingestDocument(tenantA, {
      jobId: "job_901",
      jobNumber: "JOB-2026-901",
      fileName: "TITANIUM-BRACKET-REV-B.pdf",
      fileSizeBytes: 3200000,
      mimeType: "application/pdf",
      documentType: "engineering_drawing",
    });

    createdDocId = doc.id;
    expect(doc.id).toBeDefined();
    expect(doc.extractionStatus).toBe("pending");
  });

  it("runs AI OCR extraction and flags revision discrepancy without corrupting job baseline", () => {
    const extracted = packetService.extractPacketData(tenantA, createdDocId, {
      expectedRevision: "A",
      expectedQuantity: 50,
    });

    expect(extracted.extractionStatus).toBe("flagged_inconsistency");
    expect(extracted.inconsistencies.length).toBe(2);
    expect(extracted.inconsistencies[0].severity).toBe("critical_mismatch");
    expect(extracted.extractedEntities.length).toBe(4);
  });

  it("records human engineer approval and clears inconsistency flag", () => {
    const approved = packetService.approveExtraction(tenantA, createdDocId, {
      revision: "B",
    });

    expect(approved.extractionStatus).toBe("approved");
    expect(approved.humanReviewerId).toBe(tenantA.user.id);
    expect(approved.inconsistencies.length).toBe(0);
  });

  it("assembles tailored department packet with role-specific verification checklists", () => {
    const shopfloorPacket = packetService.assembleDepartmentPacket(tenantA, "job_901", "shopfloor");
    expect(shopfloorPacket.department).toBe("shopfloor");
    expect(shopfloorPacket.checklist.length).toBeGreaterThan(0);

    const qaPacket = packetService.assembleDepartmentPacket(tenantA, "job_901", "quality");
    expect(qaPacket.department).toBe("quality");
  });

  it("strictly enforces tenant boundary and denies cross-tenant document lookups (IDOR)", () => {
    const orgBDocs = packetService.listDocuments(tenantB, { jobId: "job_901" });
    expect(orgBDocs.some((d) => d.id === createdDocId)).toBe(false);
  });
});
