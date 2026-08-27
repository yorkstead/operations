import { NextResponse } from "next/server";
import { resolveServerSession } from "@/modules/core/application/server-session";
import { backgroundJobRepository } from "@/modules/jobs/infrastructure/background-job-repository";
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { sessionContext, error } = await resolveServerSession();
  if (!sessionContext) return NextResponse.json({ error: error || "unauthenticated" }, { status: 401 });
  const job = await backgroundJobRepository.cancel(sessionContext, (await params).id);
  return job ? NextResponse.json({ job }) : NextResponse.json({ error: "Only queued jobs can be cancelled." }, { status: 409 });
}
