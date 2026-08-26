import { apiErrorResponse } from "@/lib/api-error-response";
import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { jobRepository } from "@/modules/jobs/infrastructure/job-repository";
import { jobService } from "@/modules/jobs/application/job-service";
import { JobStatus } from "@/modules/jobs/domain/types";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required").max(200),
  customerId: z.string().min(1, "Customer ID is required"),
  customerName: z.string().min(1, "Customer name is required").max(100),
  priority: z.enum(["standard", "rush", "critical"]).optional().default("standard"),
  targetDueDate: z.string().min(1, "Target due date is required"),
  estimatedLaborHours: z.number().int().min(1).max(500).optional().default(10),
  notes: z.string().max(1000).optional(),
});

export async function GET(request: Request) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status") as JobStatus | null;

  try {
    if (sessionContext.activeOrganization.isDemo) {
      const jobs = jobService.listJobs(sessionContext, statusFilter || undefined);
      return NextResponse.json({ jobs, organizationId: sessionContext.activeOrganization.id });
    }

    const jobs = await jobRepository.listJobs(sessionContext, statusFilter || undefined);
    return NextResponse.json({ jobs, organizationId: sessionContext.activeOrganization.id });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.jobs" });
  }
}

export async function POST(request: Request) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) {
    return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const jobNumber = `JOB-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (sessionContext.activeOrganization.isDemo) {
      const job = jobService.createJob(sessionContext, parsed.data);
      return NextResponse.json({ job }, { status: 201 });
    }

    const job = await jobRepository.createJob(sessionContext, {
      ...parsed.data,
      jobNumber,
    });
    return NextResponse.json({ job }, { status: 201 });
  } catch (err: unknown) {
    return apiErrorResponse(err, { action: "api.jobs" });
  }
}
