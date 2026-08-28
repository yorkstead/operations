import { NextRequest, NextResponse } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function trustedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>([request.nextUrl.origin]);
  for (const value of [process.env.NEXT_PUBLIC_APP_URL, process.env.BETTER_AUTH_URL]) {
    if (!value) continue;
    try {
      origins.add(new URL(value).origin);
    } catch {
      // Environment validation reports malformed application URLs at startup.
    }
  }
  return origins;
}

export function proxy(request: NextRequest) {
  if (SAFE_METHODS.has(request.method)) return NextResponse.next();

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
  }

  const originHeader = request.headers.get("origin");
  if (originHeader) {
    let origin: string;
    try {
      origin = new URL(originHeader).origin;
    } catch {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    if (!trustedOrigins(request).has(origin)) {
      return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
