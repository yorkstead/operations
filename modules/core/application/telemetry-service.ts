export type LogLevel = "info" | "warn" | "error" | "security";

export interface LogContext {
  traceId: string;
  organizationId?: string;
  userId?: string;
  action: string;
  [key: string]: unknown;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  traceId: string;
  organizationId?: string;
  userId?: string;
  action: string;
  message: string;
  payload: Record<string, unknown>;
}

export class TelemetryService {
  private static sensitiveKeys = [
    "password",
    "token",
    "secret",
    "authorization",
    "apikey",
    "passcode",
    "creditcard",
    "ssn",
    "cad_binary",
  ];

  static redactPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(payload)) {
      if (this.sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        clean[key] = "[REDACTED]";
      } else if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        clean[key] = this.redactPayload(val as Record<string, unknown>);
      } else {
        clean[key] = val;
      }
    }

    return clean;
  }

  static createEntry(
    level: LogLevel,
    message: string,
    context: LogContext,
    extraPayload: Record<string, unknown> = {}
  ): StructuredLogEntry {
    const { traceId, organizationId, userId, action, ...rest } = context;
    const combined = { ...rest, ...extraPayload };

    return {
      timestamp: new Date().toISOString(),
      level,
      traceId: traceId || `trc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      userId,
      action,
      message,
      payload: this.redactPayload(combined),
    };
  }
}
