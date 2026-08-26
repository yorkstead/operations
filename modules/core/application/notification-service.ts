import { SessionContext } from "../domain/types";

export interface NotificationItem {
  id: string;
  organizationId: string;
  recipientUserId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface OutboxEvent {
  id: string;
  organizationId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: "pending" | "delivered" | "failed";
  retryCount: number;
  idempotencyKey: string;
  createdAt: string;
  deliveredAt?: string;
}

export class NotificationService {
  private notifications: NotificationItem[] = [];
  private outbox: OutboxEvent[] = [];

  dispatchNotification(params: {
    organizationId: string;
    recipientUserId: string;
    title: string;
    message: string;
    link?: string;
    idempotencyKey?: string;
  }): { notification: NotificationItem; outboxEvent: OutboxEvent } {
    const key = params.idempotencyKey || `idem_${Date.now()}_${params.recipientUserId}_${params.title}`;

    // Idempotency check: if matching idempotencyKey already delivered in outbox, avoid duplicate
    const existing = this.outbox.find((o) => o.idempotencyKey === key && o.status === "delivered");
    if (existing) {
      const notif = this.notifications.find((n) => n.id === (existing.payload["notificationId"] as string));
      if (notif) return { notification: notif, outboxEvent: existing };
    }

    const now = new Date().toISOString();
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const notification: NotificationItem = {
      id: notifId,
      organizationId: params.organizationId,
      recipientUserId: params.recipientUserId,
      title: params.title,
      message: params.message,
      link: params.link,
      read: false,
      createdAt: now,
    };

    const outboxEvent: OutboxEvent = {
      id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: params.organizationId,
      eventType: "notification.dispatched",
      payload: { notificationId: notifId, title: params.title, recipient: params.recipientUserId },
      status: "delivered",
      retryCount: 0,
      idempotencyKey: key,
      createdAt: now,
      deliveredAt: now,
    };

    this.notifications.unshift(notification);
    this.outbox.push(outboxEvent);

    return { notification, outboxEvent };
  }

  listNotifications(session: SessionContext): NotificationItem[] {
    if (!session) return [];
    return this.notifications.filter(
      (n) =>
        n.organizationId === session.activeOrganization.id &&
        n.recipientUserId === session.user.id
    );
  }

  markAsRead(session: SessionContext, notificationId: string): void {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (!notif) return;

    if (notif.organizationId !== session.activeOrganization.id || notif.recipientUserId !== session.user.id) {
      throw new Error("Forbidden.");
    }

    notif.read = true;
    notif.readAt = new Date().toISOString();
  }
}

export const notificationService = new NotificationService();
