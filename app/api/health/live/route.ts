import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "LIVE",
      service: "yorkstead-operations",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
