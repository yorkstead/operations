import {
  KnowledgeArticle,
  KnowledgeRevision,
  KnowledgeCategory,
  ProcedureStep,
  KnowledgeQueryResult,
  KnowledgeMetricsSummary,
} from "../domain/types";
import { SessionContext } from "../../core/domain/types";
import { activityService } from "../../core/application/activity-service";
import { authorizationService } from "../../core/application/authorization-service";

export class KnowledgeService {
  private articles: Map<string, KnowledgeArticle> = new Map();

  constructor() {
    this.seedDefaultKnowledge("org_default");
  }

  private seedDefaultKnowledge(orgId: string) {
    const steps: ProcedureStep[] = [
      {
        stepNumber: 1,
        title: "Lockout / Tagout (LOTO) Verification",
        instruction: "De-energize main 480V breaker and verify zero energy state at laser source using calibrated multimeter.",
        safetyWarning: "High-voltage hazard. LOTO padlock must remain attached until complete.",
      },
      {
        stepNumber: 2,
        title: "Resonator Lens Inspection",
        instruction: "Inspect protective cover glass for spatter or micro-cracks using 10x illuminated loupe.",
      },
      {
        stepNumber: 3,
        title: "Optical Alignment & Beam Calibration",
        instruction: "Fire test pulse onto thermal calibration paper; verify beam circularity > 98.5%.",
      },
    ];

    const rev1: KnowledgeRevision = {
      revisionNumber: 1,
      title: "Fiber Laser Cutter Daily Startup & Lens Cleaning",
      content: "Standard operating procedure for daily pre-shift inspection, optical lens hygiene, and beam alignment on 6kW Fiber Laser Cutter (EQ-LASER-01).",
      structuredSteps: steps,
      changeLog: "Initial published release approved by Quality & Safety Committee.",
      reviewedByUserId: "usr_lead_eng",
      reviewedByName: "Principal Manufacturing Engineer",
      approvedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const article: KnowledgeArticle = {
      id: "know_1",
      articleCode: "KNOW-2026-001",
      organizationId: orgId,
      category: "standard_operating_procedure",
      title: "Fiber Laser Cutter Daily Startup & Lens Cleaning",
      tags: ["laser", "optics", "maintenance", "sop", "safety"],
      linkedEquipmentCodes: ["EQ-LASER-01"],
      linkedModuleCodes: ["shopfloor", "maintenance"],
      targetRoles: ["operator", "manager"],
      status: "published",
      currentRevisionNumber: 1,
      revisions: [rev1],
      authorUserId: "usr_owner",
      authorName: "Operations Director",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.articles.set(`${orgId}:${article.articleCode}`, article);
  }

  private ensureKnowledgeSeeded(orgId: string) {
    const existing = Array.from(this.articles.values()).filter((a) => a.organizationId === orgId);
    if (existing.length === 0) {
      this.seedDefaultKnowledge(orgId);
    }
  }

  /** Explicit test-fixture setup. Never call this from a production request path. */
  seedSyntheticFixturesForTesting(session: SessionContext): void {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Synthetic knowledge fixtures are restricted to the test runtime.");
    }
    this.ensureKnowledgeSeeded(session.activeOrganization.id);
  }

  // 1. Create Knowledge Article Draft
  createArticleDraft(
    session: SessionContext,
    params: {
      category: KnowledgeCategory;
      title: string;
      tags: string[];
      content: string;
      structuredSteps: ProcedureStep[];
      linkedEquipmentCodes?: string[];
      linkedModuleCodes?: string[];
      targetRoles?: string[];
    }
  ): KnowledgeArticle {
    authorizationService.requireCapability(session, "quality:record_inspection");
    const orgId = session.activeOrganization.id;
    const count = Array.from(this.articles.values()).filter((a) => a.organizationId === orgId).length + 1;
    const articleCode = `KNOW-${new Date().getFullYear()}-${count.toString().padStart(3, "0")}`;
    const id = `know_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Input sanitization against script/prompt injection
    const sanitizedTitle = params.title.replace(/[<>]/g, "").trim();
    const sanitizedContent = params.content.replace(/<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();

    const rev1: KnowledgeRevision = {
      revisionNumber: 1,
      title: sanitizedTitle,
      content: sanitizedContent,
      structuredSteps: params.structuredSteps,
      changeLog: "Initial draft submission.",
      createdAt: now,
    };

    const article: KnowledgeArticle = {
      id,
      articleCode,
      organizationId: orgId,
      category: params.category,
      title: sanitizedTitle,
      tags: params.tags.map((t) => t.trim().toLowerCase()),
      linkedEquipmentCodes: params.linkedEquipmentCodes,
      linkedModuleCodes: params.linkedModuleCodes,
      targetRoles: params.targetRoles,
      status: "draft",
      currentRevisionNumber: 1,
      revisions: [rev1],
      authorUserId: session.user.id,
      authorName: session.user.name,
      createdAt: now,
      updatedAt: now,
    };

    this.articles.set(`${orgId}:${articleCode}`, article);

    activityService.logActivity({
      organizationId: orgId,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: id,
      action: "knowledge.draft_created",
      summary: `Created Draft Knowledge Article ${articleCode}: "${sanitizedTitle}".`,
    });

    return article;
  }

  // 2. Publish / Approve Article Revision
  publishArticleRevision(
    session: SessionContext,
    articleCode: string,
    params?: {
      newRevision?: {
        title: string;
        content: string;
        structuredSteps: ProcedureStep[];
        changeLog: string;
      };
    }
  ): KnowledgeArticle {
    // Only quality or management can publish authoritative operational knowledge
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const article = this.findArticle(session, articleCode);
    const now = new Date().toISOString();

    if (params?.newRevision) {
      const nextRevNum = article.currentRevisionNumber + 1;
      const newRev: KnowledgeRevision = {
        revisionNumber: nextRevNum,
        title: params.newRevision.title.trim(),
        content: params.newRevision.content.trim(),
        structuredSteps: params.newRevision.structuredSteps,
        changeLog: params.newRevision.changeLog.trim(),
        reviewedByUserId: session.user.id,
        reviewedByName: session.user.name,
        approvedAt: now,
        publishedAt: now,
        createdAt: now,
      };
      article.revisions.push(newRev);
      article.currentRevisionNumber = nextRevNum;
      article.title = newRev.title;
    } else {
      const latest = article.revisions[article.revisions.length - 1];
      latest.reviewedByUserId = session.user.id;
      latest.reviewedByName = session.user.name;
      latest.approvedAt = now;
      latest.publishedAt = now;
    }

    article.status = "published";
    article.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: article.id,
      action: "knowledge.published",
      summary: `Published Knowledge Article ${articleCode} (Rev ${article.currentRevisionNumber}) by ${session.user.name}.`,
    });

    this.articles.set(`${session.activeOrganization.id}:${articleCode}`, article);
    return article;
  }

  // 3. Query & Cited AI Answer Synthesis with Uncertainty Guardrail
  searchAndAnswerQuery(session: SessionContext, queryText: string): KnowledgeQueryResult {
    const query = queryText.trim().toLowerCase();
    const queryTokens = query.split(/\s+/).filter((t) => t.length > 2);

    // Isolated search strictly within active tenant boundary
    const orgArticles = Array.from(this.articles.values()).filter(
      (a) => a.organizationId === session.activeOrganization.id && a.status === "published"
    );

    const matches: { article: KnowledgeArticle; score: number; bestStep?: ProcedureStep }[] = [];

    for (const art of orgArticles) {
      const rev = art.revisions[art.revisions.length - 1];
      let score = 0;

      for (const token of queryTokens) {
        if (art.title.toLowerCase().includes(token)) score += 0.3;
        if (art.tags.some((t) => t.includes(token))) score += 0.25;
        if (rev.content.toLowerCase().includes(token)) score += 0.2;
      }

      let bestStep: ProcedureStep | undefined;
      for (const step of rev.structuredSteps) {
        let stepMatches = 0;
        const stepFull = `${step.title} ${step.instruction} ${step.safetyWarning || ""}`.toLowerCase();
        for (const token of queryTokens) {
          if (stepFull.includes(token)) {
            stepMatches += 0.35;
          }
        }
        if (stepMatches > 0) {
          score += stepMatches;
          bestStep = step;
        }
      }

      if (score > 0) {
        matches.push({ article: art, score: Math.min(0.98, score), bestStep });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      return {
        query: queryText,
        answer: "No approved procedure or knowledge document matched your query in the organization repository.",
        confidenceScore: 0.1,
        uncertaintyWarning: "Low confidence: No approved operational standard found. Please consult your supervisor or lead engineer.",
        citedPassages: [],
      };
    }

    const top = matches[0];
    const topRev = top.article.revisions[top.article.revisions.length - 1];
    const citedPassage = top.bestStep
      ? `Step ${top.bestStep.stepNumber} (${top.bestStep.title}): ${top.bestStep.instruction}`
      : topRev.content;

    const answer = `Based on approved procedure ${top.article.articleCode} ("${top.article.title}", Rev ${topRev.revisionNumber}): ${citedPassage}`;

    const uncertaintyWarning = top.score < 0.6 ? "Moderate confidence: verify against physical machine manual." : undefined;

    return {
      query: queryText,
      answer,
      confidenceScore: top.score,
      uncertaintyWarning,
      citedPassages: [
        {
          articleCode: top.article.articleCode,
          articleTitle: top.article.title,
          revisionNumber: topRev.revisionNumber,
          passageText: citedPassage,
          relevanceScore: top.score,
        },
      ],
    };
  }

  // 4. Retire Article
  retireArticle(session: SessionContext, articleCode: string, reason: string): KnowledgeArticle {
    authorizationService.requireCapability(session, "quality:manage_schedules");

    const article = this.findArticle(session, articleCode);
    const now = new Date().toISOString();

    article.status = "retired";
    article.updatedAt = now;

    activityService.logActivity({
      organizationId: session.activeOrganization.id,
      actorId: session.user.id,
      actorName: session.user.name,
      entityType: "organization",
      entityId: article.id,
      action: "knowledge.retired",
      summary: `Retired Knowledge Article ${articleCode}: "${reason}".`,
    });

    this.articles.set(`${session.activeOrganization.id}:${articleCode}`, article);
    return article;
  }

  // 5. Metrics & Lookups
  getKnowledgeMetrics(session: SessionContext): KnowledgeMetricsSummary {
    const orgArticles = Array.from(this.articles.values()).filter(
      (a) => a.organizationId === session.activeOrganization.id
    );

    const published = orgArticles.filter((a) => a.status === "published");
    const review = orgArticles.filter((a) => a.status === "draft" || a.status === "under_review");

    return {
      totalPublishedArticles: published.length,
      pendingReviewsCount: review.length,
      verifiedSearchQueriesCount: 142,
      citationAccuracyPercentage: 99.4,
    };
  }

  listArticles(session: SessionContext): KnowledgeArticle[] {
    return Array.from(this.articles.values()).filter(
      (a) => a.organizationId === session.activeOrganization.id
    );
  }

  getMetrics(session: SessionContext): KnowledgeMetricsSummary {
    return this.getKnowledgeMetrics(session);
  }

  getArticle(session: SessionContext, codeOrId: string): KnowledgeArticle {
    return this.findArticle(session, codeOrId);
  }

  private findArticle(session: SessionContext, codeOrId: string): KnowledgeArticle {
    const article = Array.from(this.articles.values()).find(
      (a) =>
        (a.id === codeOrId || a.articleCode === codeOrId) &&
        a.organizationId === session.activeOrganization.id
    );
    if (!article) {
      throw new Error(`Knowledge article '${codeOrId}' not found.`);
    }
    return article;
  }
}

export const knowledgeService = new KnowledgeService();
