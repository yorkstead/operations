import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const commitSha =
    process.env.NEXT_PUBLIC_COMMIT_SHA ||
    process.env.RELEASE_SHA ||
    process.env.COMMIT_SHA ||
    "local-development";

  return NextResponse.json(
    {
      service: "yorkstead-operations",
      commitSha,
      environment: process.env.NODE_ENV || "development",
      platform: "google-cloud-run",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Yorkstead-Service": "operations",
      },
    },
  );
}
