import { NextRequest, NextResponse } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PUBLIC_PAGES = new Set(["/login", "/demo"]);
const DEMO_ORGANIZATIONS = new Set([
  "org_front_range_mfg",
  "demo_front_range_manufacturing",
  "demo_summit_facility_services",
  "demo_mile_high_signworks",
  "demo_peak_mobile_detail",
]);

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

function protectApiMutation(request: NextRequest) {
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

export function isPublicOperationsPage(pathname: string): boolean {
  return PUBLIC_PAGES.has(pathname);
}

export function hasAllowlistedDemoSession(request: NextRequest): boolean {
  const demoOrganization = request.cookies.get("yorkstead_demo_org")?.value;
  return Boolean(demoOrganization && DEMO_ORGANIZATIONS.has(demoOrganization));
}

async function protectPage(request: NextRequest) {
  if (isPublicOperationsPage(request.nextUrl.pathname) || hasAllowlistedDemoSession(request)) {
    return NextResponse.next();
  }

  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user) return NextResponse.next();
  } catch {
    // Authentication failures use the same non-sensitive login redirect.
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return protectApiMutation(request);
  }
  return protectPage(request);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|apple-icon|icon|manifest.webmanifest).*)",
  ],
};
