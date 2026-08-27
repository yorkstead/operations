import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { logger } from "@/lib/infrastructure/observability/logger";

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

export function apiErrorResponse(error: unknown, context: ApiErrorContext) {
  const correlationId = randomUUID();
  const classified = classifyError(error);
  const logContext = {
    correlationId,
    action: context.action,
    organizationId: context.organizationId,
    userId: context.userId,
    statusCode: classified.status,
    errorCode: classified.code,
  };
  if (classified.status === 401 || classified.status === 403) {
    logger.security("authentication.failure", "Authentication or authorization failed", logContext);
  } else if (classified.status >= 500) {
    logger.error("api.failure", "API request failed", error, logContext);
  } else {
    logger.warn("api.rejected", "API request was rejected", logContext);
  }
  return NextResponse.json(
    { error: classified.message, code: classified.code, correlationId },
    { status: classified.status, headers: { "x-correlation-id": correlationId } }
  );
}
