import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth-constants";

function normalizeNextPath(nextValue: string | null) {
  if (!nextValue) return null;
  if (!nextValue.startsWith("/")) return null;
  if (nextValue.startsWith("//")) return null;
  return nextValue;
}

function applyNextPath(url: { pathname: string; search: string }, nextPath: string) {
  const qIndex = nextPath.indexOf("?");
  if (qIndex === -1) {
    url.pathname = nextPath;
    url.search = "";
    return;
  }
  url.pathname = nextPath.slice(0, qIndex) || "/";
  url.search = nextPath.slice(qIndex);
}

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/login" || pathname === "/register";
}

function isAuthPage(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/lessons") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/attempts")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname) && !isAuthPage(pathname)) {
    return NextResponse.next();
  }

  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value ?? null;
  const nextPath = normalizeNextPath(req.nextUrl.searchParams.get("next"));
  const hasSession = Boolean(refreshToken);

  if (isAuthPage(pathname)) {
    if (hasSession) {
      const url = req.nextUrl.clone();
      if (nextPath) applyNextPath(url, nextPath);
      else {
        url.pathname = "/lessons";
        url.search = "";
      }
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (hasSession) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
  const res = NextResponse.redirect(url);
  res.cookies.delete(ACCESS_COOKIE_NAME);
  res.cookies.delete(REFRESH_COOKIE_NAME);
  return res;
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
