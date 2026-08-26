import { describe, expect, it } from "bun:test";
import {
  AuditDeliverableService,
  syntheticFrontRangeBriefing
} from "../modules/audit/application/audit-deliverable-service";

describe("Workflow Audit Sales Deliverable & Client Briefing Engine", () => {
  it("retrieves coherent synthetic client briefing for Front Range Precision Manufacturing", () => {
    const briefing = AuditDeliverableService.getSyntheticBriefing();
    expect(briefing.clientName).toBe("Front Range Precision Manufacturing");
    expect(briefing.version).toContain("DELIVERABLE");
    expect(briefing.status).toBe("client_delivered");
    expect(briefing.currentStateMap.length).toBe(5);
    expect(briefing.opportunityRankings.length).toBe(3);
    expect(briefing.implementationMilestones.length).toBe(2);
  });

  it("ensures all observed evidence points distinguish measured vs estimated vs unknown facts", () => {
    const briefing = AuditDeliverableService.getSyntheticBriefing();

    const types = briefing.currentStateMap.map((n) => n.evidenceType);
    expect(types).toContain("measured_fact");
    expect(types).toContain("operator_estimate");
    expect(types).toContain("unverified_unknown");

    for (const node of briefing.currentStateMap) {
      expect(node.stageTitle.length).toBeGreaterThan(5);
      expect(node.currentTool.length).toBeGreaterThan(5);
      expect(node.observedFriction.length).toBeGreaterThan(15);
      expect(node.evidenceNotes.length).toBeGreaterThan(10);
    }
  });

  it("sanitizes deliverable by excluding confidential internal notes", () => {
    const sanitized = AuditDeliverableService.sanitizeClientBriefing(syntheticFrontRangeBriefing);
    expect(sanitized.internalNotes).toBeUndefined();
    expect(sanitized.clientName).toBe("Front Range Precision Manufacturing");
    expect(sanitized.executiveSummary.length).toBeGreaterThan(30);
  });

  it("enforces integer-cents price ranges on all implementation milestones", () => {
    const briefing = AuditDeliverableService.getSyntheticBriefing();

    for (const ms of briefing.implementationMilestones) {
      expect(ms.priceRangeCents.min).toBeGreaterThan(100000); // > $1,000
      expect(ms.priceRangeCents.max).toBeGreaterThan(ms.priceRangeCents.min);
      expect(Number.isInteger(ms.priceRangeCents.min)).toBe(true);
      expect(Number.isInteger(ms.priceRangeCents.max)).toBe(true);
      expect(ms.deliverables.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("updates deliverable status through the approval gate", () => {
    const updated = AuditDeliverableService.updateStatus(
      syntheticFrontRangeBriefing.engagementId,
      "accepted",
      "VP Operations Signature"
    );
    expect(updated.status).toBe("accepted");
    expect(updated.approvedBy).toBe("VP Operations Signature");
  });
});
