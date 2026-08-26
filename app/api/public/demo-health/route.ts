import { NextResponse } from "next/server";
import { publicSiteContractService } from "@/modules/public-contract/application/public-site-contract-service";

export async function GET() {
  const manifest = publicSiteContractService.getPublicDemoHealthManifest();

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "https://yorkstead.com",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-Yorkstead-Platform": "Yorkstead Operations",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://yorkstead.com",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
