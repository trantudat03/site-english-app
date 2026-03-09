import { NextResponse, type NextRequest } from "next/server";

const ACCESS_COOKIE_NAME = "accessToken";
const REFRESH_COOKIE_NAME = "refreshToken";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
};

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

function getJwtExpSeconds(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function isTokenLikelyValid(token: string) {
  const exp = getJwtExpSeconds(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp - now > 30;
}

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

async function tryRefresh(refreshToken: string) {
  const base = stripTrailingSlash(process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337");
  const res = await fetch(`${base}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as null | Record<string, unknown>;
  if (!data) return null;

  const accessToken =
    (typeof data.accessToken === "string" && data.accessToken) ||
    (typeof data.jwt === "string" && data.jwt) ||
    null;
  const nextRefreshToken = typeof data.refreshToken === "string" ? data.refreshToken : null;
  if (!accessToken) return null;

  return { accessToken, refreshToken: nextRefreshToken };
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

  const accessToken = req.cookies.get(ACCESS_COOKIE_NAME)?.value ?? null;
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value ?? null;

  const hasValidAccess = accessToken ? isTokenLikelyValid(accessToken) : false;
  const nextPath = normalizeNextPath(req.nextUrl.searchParams.get("next"));

  if (isAuthPage(pathname)) {
    if (hasValidAccess) {
      const url = req.nextUrl.clone();
      if (nextPath) applyNextPath(url, nextPath);
      else {
        url.pathname = "/";
        url.search = "";
      }
      return NextResponse.redirect(url);
    }

    if (refreshToken) {
      const rotated = await tryRefresh(refreshToken);
      if (rotated) {
        const url = req.nextUrl.clone();
        if (nextPath) applyNextPath(url, nextPath);
        else {
          url.pathname = "/lessons";
          url.search = "";
        }
        const res = NextResponse.redirect(url);
        res.cookies.set(ACCESS_COOKIE_NAME, rotated.accessToken, ACCESS_COOKIE_OPTIONS);
        if (rotated.refreshToken) {
          res.cookies.set(REFRESH_COOKIE_NAME, rotated.refreshToken, REFRESH_COOKIE_OPTIONS);
        }
        return res;
      }
    }

    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (hasValidAccess) {
    return NextResponse.next();
  }

  if (refreshToken) {
    const rotated = await tryRefresh(refreshToken);
    if (rotated) {
      const res = NextResponse.next();
      res.cookies.set(ACCESS_COOKIE_NAME, rotated.accessToken, ACCESS_COOKIE_OPTIONS);
      if (rotated.refreshToken) {
        res.cookies.set(REFRESH_COOKIE_NAME, rotated.refreshToken, REFRESH_COOKIE_OPTIONS);
      }
      return res;
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
  const res = NextResponse.redirect(url);
  res.cookies.set(ACCESS_COOKIE_NAME, "", { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE_NAME, "", { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
  return res;
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
