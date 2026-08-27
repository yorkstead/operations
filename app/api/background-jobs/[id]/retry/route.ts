import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { backgroundJobRepository } from "@/modules/jobs/infrastructure/background-job-repository";
import { dispatchBackgroundJob } from "@/modules/jobs/application/job-dispatcher";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  const job = await backgroundJobRepository.retry(sessionContext, (await params).id);
  if (job) await dispatchBackgroundJob(job.id);
  return job ? NextResponse.json({ job }, { status: 202 }) : NextResponse.json({ error: "Only failed jobs can be retried." }, { status: 409 });
}
