import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { jobRepository } from "@/modules/jobs/infrastructure/job-repository";
import { jobService } from "@/modules/jobs/application/job-service";
import { JobStatus } from "@/modules/jobs/domain/types";
import { z } from "zod";

const transitionSchema = z.object({
  targetStatus: z.enum([
    "draft",
    "intake_review",
    "engineering_ready",
    "released_to_shopfloor",
    "in_progress",
    "quality_hold",
    "completed",
    "closed",
  ]),
  reason: z.string().max(300).optional(),
  expectedVersion: z.number().int().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const job = jobService.getJob(sessionContext, id);
      return NextResponse.json({ job });
    }

    const job = await jobRepository.getJob(sessionContext, id);
    if (!job) {
      return NextResponse.json({ error: "Job not found in active organization" }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.jobs.[id]" });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    if (sessionContext.activeOrganization.isDemo) {
      const updated = jobService.transitionJobStatus(
        sessionContext,
        id,
        parsed.data.targetStatus as JobStatus,
        parsed.data.reason,
        parsed.data.expectedVersion
      );
      return NextResponse.json({ job: updated });
    }

    const updated = await jobRepository.transitionJobStatus(
      sessionContext,
      id,
      parsed.data.targetStatus as JobStatus,
      parsed.data.reason,
      parsed.data.expectedVersion
    );

    return NextResponse.json({ job: updated });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.jobs.transition" });
  }
}
