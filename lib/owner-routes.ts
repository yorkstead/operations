const OWNER_ROUTE_ROOTS = [
  "/",
  "/projects",
  "/engagements",
  "/knowledge",
  "/directory",
  "/infrastructure",
  "/audit",
  "/files",
  "/activity",
] as const;

export function isOwnerRoute(pathname: string): boolean {
  return OWNER_ROUTE_ROOTS.some((root) =>
    root === "/" ? pathname === root : pathname === root || pathname.startsWith(`${root}/`)
  );
}

export function safePostLoginPath(value: string | null | undefined, fallback = "/jobs"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return isOwnerRoute(value) ? value : fallback;
}

export function ownerLoginPath(pathname: string): string {
  return `/login?next=${encodeURIComponent(pathname)}`;
}
