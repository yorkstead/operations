import { NextResponse } from "next/server";
import { applicationMetadata } from "@/lib/infrastructure/observability/app-metadata";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      version: applicationMetadata.version,
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
