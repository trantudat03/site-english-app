import { NextRequest, NextResponse } from "next/server";
import { getStrapiBaseUrl } from "@/features/api/strapiFetch";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} from "@/lib/auth-constants";

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

async function readJsonSafely(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return undefined;
  try {
    return (await res.json()) as unknown;
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : null;
  const email = typeof body?.email === "string" ? body.email : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!username || !email || !password) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const strapiBase = stripTrailingSlash(getStrapiBaseUrl());
  const strapiRes = await fetch(`${strapiBase}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const payload = (await readJsonSafely(strapiRes)) ?? (await strapiRes.text().catch(() => ""));

  if (!strapiRes.ok) {
    return NextResponse.json(payload || { message: "Registration failed" }, { status: strapiRes.status });
  }

  const data = (payload ?? {}) as Record<string, unknown>;
  const accessToken =
    (typeof data.accessToken === "string" && data.accessToken) ||
    (typeof data.jwt === "string" && data.jwt) ||
    null;
  const refreshToken = typeof data.refreshToken === "string" ? data.refreshToken : null;
  if (!accessToken) {
    return NextResponse.json({ message: "Invalid auth response" }, { status: 502 });
  }

  let resolvedAccessToken = accessToken;
  let resolvedRefreshToken = refreshToken;
  if (!resolvedRefreshToken) {
    const loginRes = await fetch(`${strapiBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (loginRes.ok) {
      const loginPayload = (await readJsonSafely(loginRes)) ?? null;
      if (loginPayload && typeof loginPayload === "object") {
        const loginData = loginPayload as Record<string, unknown>;
        const refreshedAccessToken =
          (typeof loginData.accessToken === "string" && loginData.accessToken) ||
          (typeof loginData.jwt === "string" && loginData.jwt) ||
          null;
        const refreshedRefreshToken =
          typeof loginData.refreshToken === "string" ? loginData.refreshToken : null;

        if (refreshedAccessToken) {
          resolvedAccessToken = refreshedAccessToken;
        }
        resolvedRefreshToken = refreshedRefreshToken;
      }
    }
  }

  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set(ACCESS_COOKIE_NAME, resolvedAccessToken, ACCESS_COOKIE_OPTIONS);
  if (resolvedRefreshToken) {
    res.cookies.set(REFRESH_COOKIE_NAME, resolvedRefreshToken, REFRESH_COOKIE_OPTIONS);
  }
  return res;
}
