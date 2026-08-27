import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { backgroundJobRepository } from "@/modules/jobs/infrastructure/background-job-repository";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  const job = await backgroundJobRepository.getForSession(sessionContext, (await params).id);
  return job ? NextResponse.json({ job }) : NextResponse.json({ error: "Job not found." }, { status: 404 });
}
