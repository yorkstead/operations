import { SessionContext } from "../domain/types";

export interface ActivityEvent {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  entityType: "organization" | "membership" | "file" | "audit" | "job" | "system";
  entityId: string;
  action: string;
  summary: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export class ActivityService {
  private events: ActivityEvent[] = [];

  logActivity(params: {
    organizationId: string;
    actorId: string;
    actorName: string;
    entityType: ActivityEvent["entityType"];
    entityId: string;
    action: string;
    summary: string;
    metadata?: Record<string, unknown>;
  }): ActivityEvent {
    // Sanitize metadata to avoid logging secrets, credentials, or document blobs
    const sanitizedMetadata = params.metadata ? { ...params.metadata } : undefined;
    if (sanitizedMetadata) {
      delete sanitizedMetadata["password"];
      delete sanitizedMetadata["secret"];
      delete sanitizedMetadata["token"];
    }

    const event: ActivityEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: params.organizationId,
      actorId: params.actorId,
      actorName: params.actorName,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      summary: params.summary,
      metadata: sanitizedMetadata,
      createdAt: new Date().toISOString(),
    };

    this.events.unshift(event); // most recent first
    return event;
  }

  listActivity(session: SessionContext, limit = 50): ActivityEvent[] {
    if (!session || !session.activeOrganization) {
      throw new Error("Session required.");
    }

    return this.events
      .filter((e) => e.organizationId === session.activeOrganization.id)
      .slice(0, limit);
  }
}

export const activityService = new ActivityService();
