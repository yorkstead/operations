import { describe, expect, it } from "bun:test";
import { calculateAuditReport } from "../modules/audit/domain/scoring";
import { AuditService } from "../modules/audit/application/audit-service";

describe("Workflow Audit Domain & Scoring Engine", () => {
  it("calculates baseline score and separates measured facts from estimates", () => {
    const report = calculateAuditReport(
      "test_audit_1",
      "Front Range Metalworks",
      "Architectural Metal",
      "2026-08-25",
      {
        q_intake_1: {
          questionId: "q_intake_1",
          score: 2,
          factType: "measured_fact",
          evidenceNotes: "Spreadsheet quote delay",
          estimatedHoursLostWeekly: 5,
          severity: "high",
        },
        q_shopfloor_1: {
          questionId: "q_shopfloor_1",
          score: 2,
          factType: "operator_estimate",
          evidenceNotes: "Paper traveler loss",
          estimatedHoursLostWeekly: 10,
          severity: "critical",
        },
      }
    );

    expect(report.engagementId).toBe("test_audit_1");
    expect(report.clientName).toBe("Front Range Metalworks");
    expect(report.totalMeasuredWeeklyWasteHours).toBe(5);
    expect(report.totalEstimatedWeeklyWasteHours).toBe(10);
    expect(report.totalAnnualWasteHours).toBe(15 * 50); // 750 hrs
    expect(report.overallEfficiencyScore).toBeGreaterThan(0);
    expect(report.overallFrictionScore).toBe(100 - report.overallEfficiencyScore);
    expect(report.topOpportunities.length).toBeGreaterThan(0);
  });

  it("handles empty answers gracefully with neutral fallbacks", () => {
    const report = calculateAuditReport(
      "test_audit_empty",
      "New Facility",
      "Manufacturing",
      "2026-08-25",
      {}
    );

    expect(report.overallEfficiencyScore).toBe(60); // Neutral score (3/5)
    expect(report.totalMeasuredWeeklyWasteHours).toBe(0);
    expect(report.totalEstimatedWeeklyWasteHours).toBe(0);
    expect(report.totalAnnualWasteHours).toBe(0);
  });

  it("verifies AuditService engagement lifecycle", () => {
    const engagement = AuditService.createEngagement({
      organizationId: "org_synth_1",
      clientName: "Summit Facility Services",
      industry: "Commercial Cleaning",
      leadAuditor: "Principal Engineer",
    });

    expect(engagement.id).toBeDefined();
    expect(engagement.status).toBe("in_progress");

    const updated = AuditService.saveAnswer(engagement.id, {
      questionId: "q_intake_1",
      score: 1,
      factType: "measured_fact",
      evidenceNotes: "Manual phone bookings lost",
      estimatedHoursLostWeekly: 8,
      severity: "critical",
    });

    expect(updated.answers["q_intake_1"].score).toBe(1);

    const report = AuditService.generateReport(engagement.id);
    expect(report.clientName).toBe("Summit Facility Services");
    expect(report.totalMeasuredWeeklyWasteHours).toBe(8);
  });
});
