import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { TelemetryService } from "@/modules/core/application/telemetry-service";

export interface ApiErrorContext {
  action: string;
  organizationId?: string;
  userId?: string;
}

function classifyError(error: unknown): { status: number; code: string; message: string } {
  const internalMessage = error instanceof Error ? error.message : "";
  const normalized = internalMessage.toLowerCase();
  if (normalized.includes("unauthorized") || normalized.includes("session required")) {
    return { status: 401, code: "UNAUTHENTICATED", message: "Authentication is required." };
  }
  if (normalized.includes("forbidden") || normalized.includes("capability required")) {
    return { status: 403, code: "FORBIDDEN", message: "You do not have permission to perform this action." };
  }
  if (normalized.includes("not found")) {
    return { status: 404, code: "NOT_FOUND", message: "The requested resource was not found." };
  }
  if (normalized.includes("negative stock")) {
    return { status: 409, code: "NEGATIVE_STOCK", message: "The inventory movement would create negative stock." };
  }
  if (normalized.includes("already") || normalized.includes("duplicate") || normalized.includes("conflict")) {
    return { status: 409, code: "CONFLICT", message: "The request conflicts with the current resource state." };
  }
  if (normalized.includes("invalid") || normalized.includes("required")) {
    return { status: 400, code: "INVALID_REQUEST", message: "The request is invalid." };
  }
  return { status: 500, code: "INTERNAL_ERROR", message: "The request could not be completed." };
}

function sanitizeInternalMessage(message: string): string {
  return message.replace(/\b(password|token|secret|authorization|api[_-]?key)\s*[=:]\s*[^\s;,]+/gi, "$1=[REDACTED]");
}

export function apiErrorResponse(error: unknown, context: ApiErrorContext) {
  const correlationId = randomUUID();
  const classified = classifyError(error);
  const internalMessage = error instanceof Error ? error.message : "Unknown error";
  const entry = TelemetryService.createEntry(
    classified.status >= 500 ? "error" : classified.status === 403 ? "security" : "warn",
    "API request failed",
    { traceId: correlationId, action: context.action, organizationId: context.organizationId, userId: context.userId },
    { errorName: error instanceof Error ? error.name : "UnknownError", internalMessage: sanitizeInternalMessage(internalMessage) }
  );
  console.error(JSON.stringify(entry));
  return NextResponse.json(
    { error: classified.message, code: classified.code, correlationId },
    { status: classified.status, headers: { "x-correlation-id": correlationId } }
  );
}
