import { NextResponse, NextRequest } from "next/server";

// paths that should NOT be redirected (static, api, assets, marketing)
const PUBLIC_PREFIXES = ["/api", "/_next", "/static", "/public", "/favicon", "/robots", "/sitemap", "/marketing", "/(marketing)"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ignore public prefixes
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next();

  // landing page "/" → redirect to last or /paper/overview
  if (pathname === "/") {
    const last = req.cookies.get("last_route")?.value;
    const safe = last?.startsWith("/paper") || last?.startsWith("/live") ? last : "/paper/overview";
    const url = req.nextUrl.clone(); 
    url.pathname = safe; 
    url.search = ""; // drop old qs
    return NextResponse.redirect(url);
  }

  // hard-guard live routes if user flag isn't set — rely on header set by auth (or swap to a session check in route handlers)
  if (pathname.startsWith("/live")) {
    const live = req.cookies.get("live_enabled")?.value === "1";
    if (!live) {
      const url = req.nextUrl.clone(); 
      url.pathname = "/paper/overview";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // run on all pages
  matcher: ["/((?!_next|api|static|public).*)"],
};
