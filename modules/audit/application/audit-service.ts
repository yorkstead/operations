import { AuditDiagnosticReport, AuditEngagement, AuditAnswerInput } from "../domain/types";
import { calculateAuditReport } from "../domain/scoring";

// In-memory store for synthetic local development and verified testing
const engagementsStore: Map<string, AuditEngagement> = new Map();

export const AuditService = {
  createEngagement(data: {
    organizationId: string;
    clientName: string;
    industry: string;
    leadAuditor: string;
    notes?: string;
  }): AuditEngagement {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const engagement: AuditEngagement = {
      id,
      organizationId: data.organizationId,
      clientName: data.clientName,
      industry: data.industry,
      leadAuditor: data.leadAuditor,
      status: "in_progress",
      notes: data.notes || "",
      createdAt: now,
      updatedAt: now,
      answers: {},
    };
    engagementsStore.set(id, engagement);
    return engagement;
  },

  getEngagement(id: string): AuditEngagement | null {
    return engagementsStore.get(id) || null;
  },

  listEngagements(organizationId: string): AuditEngagement[] {
    return Array.from(engagementsStore.values()).filter(
      (e) => e.organizationId === organizationId
    );
  },

  saveAnswer(
    engagementId: string,
    answer: AuditAnswerInput
  ): AuditEngagement {
    const engagement = engagementsStore.get(engagementId);
    if (!engagement) {
      throw new Error(`Audit engagement ${engagementId} not found.`);
    }

    engagement.answers[answer.questionId] = answer;
    engagement.updatedAt = new Date().toISOString();
    engagementsStore.set(engagementId, engagement);
    return engagement;
  },

  generateReport(engagementId: string): AuditDiagnosticReport {
    const engagement = engagementsStore.get(engagementId);
    if (!engagement) {
      throw new Error(`Audit engagement ${engagementId} not found.`);
    }

    return calculateAuditReport(
      engagement.id,
      engagement.clientName,
      engagement.industry,
      engagement.updatedAt.split("T")[0],
      engagement.answers
    );
  },
};
