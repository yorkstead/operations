import { randomUUID } from "node:crypto";
import { TelemetryService, type LogLevel } from "@/modules/core/application/telemetry-service";

export interface LogContext {
  correlationId?: string;
  jobId?: string;
  organizationId?: string;
  userId?: string;
  [key: string]: unknown;
}

function errorDetails(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { errorType: "UnknownError" };
  const errorCode = "code" in error && (typeof error.code === "string" || typeof error.code === "number") ? error.code : undefined;
  return { errorType: error.name, errorCode };
}

function write(level: LogLevel, event: string, message: string, context: LogContext = {}, error?: unknown): void {
  const { correlationId, organizationId, userId, ...payload } = context;
  const entry = TelemetryService.createEntry(
    level,
    message,
    {
      traceId: correlationId ?? randomUUID(),
      organizationId,
      userId,
      action: event,
    },
    error === undefined ? payload : { ...payload, ...errorDetails(error) },
  );
  const serialized = JSON.stringify(entry);
  if (level === "error" || level === "security") console.error(serialized);
  else if (level === "warn") console.warn(serialized);
  else console.info(serialized);
}

export const logger = {
  info: (event: string, message: string, context?: LogContext) => write("info", event, message, context),
  warn: (event: string, message: string, context?: LogContext) => write("warn", event, message, context),
  error: (event: string, message: string, error: unknown, context?: LogContext) => write("error", event, message, context, error),
  security: (event: string, message: string, context?: LogContext) => write("security", event, message, context),
};
