import { describe, expect, it, beforeEach } from "bun:test";
import { PacketIntelligenceService } from "../modules/packet-intelligence/application/packet-intelligence-service";
import { IdentityService } from "../modules/core/application/identity-service";

describe("Job Packet Intelligence Module (Checkpoint 3)", () => {
  let packetService: PacketIntelligenceService;
  let identityService: IdentityService;

  beforeEach(() => {
    packetService = new PacketIntelligenceService();
    identityService = new IdentityService();
  });

  it("ingests engineering documents and extracts structured metadata", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const doc = packetService.ingestDocument(session, {
      jobId: "job_105",
      jobNumber: "JOB-2026-105",
      fileName: "BRACKET-DWG-REV-B.pdf",
      fileSizeBytes: 1850000,
      mimeType: "application/pdf",
      documentType: "engineering_drawing",
      fileStorageKey: "vault/factory-a/job_105/drawing.pdf",
    });

    expect(doc.id).toBeDefined();
    expect(doc.extractionStatus).toBe("pending");

    // Run extraction with no discrepancies
    const extracted = packetService.extractPacketData(session, doc.id, {
      expectedRevision: "B",
      expectedQuantity: 100,
    });

    expect(extracted.extractionStatus).toBe("extracted");
    expect(extracted.inconsistencies.length).toBe(0);
    expect(extracted.extractedEntities.length).toBeGreaterThan(0);
  });

  it("flags revision and quantity mismatches without silently altering job truth", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const doc = packetService.ingestDocument(session, {
      jobId: "job_106",
      jobNumber: "JOB-2026-106",
      fileName: "FLANGE-DWG-REV-B.pdf",
      fileSizeBytes: 2100000,
      mimeType: "application/pdf",
      documentType: "engineering_drawing",
      fileStorageKey: "vault/factory-a/job_106/drawing.pdf",
    });

    // Inconsistency: Job expects Rev A, but drawing is Rev B
    const flagged = packetService.extractPacketData(session, doc.id, {
      expectedRevision: "A",
      expectedQuantity: 50,
    });

    expect(flagged.extractionStatus).toBe("flagged_inconsistency");
    expect(flagged.inconsistencies.length).toBe(2);
    expect(flagged.inconsistencies[0].severity).toBe("critical_mismatch");

    // Human review approves with explicit override
    const approved = packetService.approveExtraction(session, doc.id, {
      revision: "B",
    });

    expect(approved.extractionStatus).toBe("approved");
    expect(approved.humanReviewerId).toBe(owner.id);
    expect(approved.inconsistencies.length).toBe(0);
  });

  it("assembles tailored department packets for shopfloor, qa, and purchasing", () => {
    const { user: owner } = identityService.bootstrapOwner({
      email: "owner@yorkstead.com",
      name: "Owner",
      organizationName: "Factory A",
      organizationSlug: "factory-a",
    });

    const session = identityService.getSessionContext(owner.id);

    const shopfloorPacket = packetService.assembleDepartmentPacket(session, "job_104", "shopfloor");
    expect(shopfloorPacket.department).toBe("shopfloor");
    expect(shopfloorPacket.checklist.length).toBe(3);

    const qaPacket = packetService.assembleDepartmentPacket(session, "job_104", "quality");
    expect(qaPacket.department).toBe("quality");
  });
});
